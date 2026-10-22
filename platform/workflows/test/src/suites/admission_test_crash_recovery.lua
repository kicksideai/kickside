local test = require("test")
local uuid = require("uuid")
local writable_module = require("run_writable")
local maintenance_module = require("maintenance")
local admission = require("admission")
local store = require("store")
local admission_scaffold = require("admission_scaffold")

local sc = admission_scaffold.new({
    test = test,
    uuid = uuid,
    run_writable = writable_module,
    maintenance = maintenance_module,
    admission = admission,
    store = store,
})
local writable = sc.writable
local maintenance = sc.maintenance

local function define_tests()
    test.describe("workflow admission and recovery", function()
        local new_engine = sc.new_engine
        local new_appender = sc.new_appender
        local install = sc.install
        local build_request = sc.build_request
        local query_row = sc.query_row
        local dataflow_of = sc.dataflow_of
        local mark_terminal = sc.mark_terminal
        local force_due = sc.force_due
        local pending_count = sc.pending_count
        local old_repo, old_version_read, old_compiler = writable._repo, writable._version_read, writable._compiler
        local old_writer_client, old_checker_client = writable._client_new, maintenance._client_new
        local old_identity_loader = writable._load_identity
        local old_append = maintenance._append_event
        test.after_all(function()
            writable._repo, writable._version_read, writable._compiler = old_repo, old_version_read, old_compiler
            writable._client_new, maintenance._client_new = old_writer_client, old_checker_client
            writable._load_identity = old_identity_loader
            maintenance._append_event = old_append
        end)

        for _, observed in ipairs({"completed", "failed", "cancelled", "terminated", "running"}) do
            test.it("stale " .. observed .. " observation leaves an unadmitted run unchanged", function()
                local reserved, reserve_err = sc.reserve_fixture({
                    workflow_id = uuid.v4(), trigger_id = "automation-" .. uuid.v4(),
                    dedup_key = uuid.v4(), version = 1, trigger_kind = "binding", automation_revision = 1,
                    execution_identity_json = sc.TEST_IDENTITY_JSON,
                })
                test.is_nil(reserve_err)
                local row = reserved.row or reserved
                sc.exec("UPDATE workflow_runs SET completion_check_token=$1 WHERE run_id=$2",
                    {"current-check", row.run_id})
                local before = query_row("SELECT * FROM workflow_runs WHERE run_id=$1", {row.run_id})
                local merged, merge_err = admission.merge(row, {status = observed, error = "terminal outcome"}, "old-check")
                test.is_nil(merge_err)
                test.eq(merged.changed, false)
                local after = query_row("SELECT * FROM workflow_runs WHERE run_id=$1", {row.run_id})
                test.eq(after.admission_state, before.admission_state)
                test.eq(after.status, before.status)
                test.eq(after.finished_at, before.finished_at)
                test.eq(after.error, before.error)
                test.eq(after.terminal_event_pending, before.terminal_event_pending)
                test.eq(after.terminal_event_check_at, before.terminal_event_check_at)
                test.eq(after.completion_check_at, before.completion_check_at)
                test.eq(after.completion_check_token, before.completion_check_token)
            end)
        end

        test.it("a current terminal observation records admission after a callback wins", function()
            local reserved, reserve_err = sc.reserve_fixture({workflow_id = uuid.v4(),
                trigger_id = "automation-" .. uuid.v4(), dedup_key = uuid.v4(), version = 1,
                trigger_kind = "binding", automation_revision = 1,
                execution_identity_json = sc.TEST_IDENTITY_JSON})
            test.is_nil(reserve_err)
            local row = reserved.row or reserved
            sc.exec("UPDATE workflow_runs SET status='failed',finished_at=$1,error='callback outcome',"
                .. "completion_check_token='current-check' WHERE run_id=$2", {admission.now(), row.run_id})
            local before = query_row("SELECT * FROM workflow_runs WHERE run_id=$1", {row.run_id})
            local merged, merge_err = admission.merge(row, {status = "completed", error = "checker outcome"}, "current-check")
            test.is_nil(merge_err)
            test.eq(merged.admitted, true)
            local after = query_row("SELECT * FROM workflow_runs WHERE run_id=$1", {row.run_id})
            test.eq(after.admission_state, "admitted")
            test.eq(after.status, before.status)
            test.eq(after.finished_at, before.finished_at)
            test.eq(after.error, before.error)
            test.eq(after.terminal_event_pending, before.terminal_event_pending)
        end)

        test.it("commit before start: recovery uses the committed id once", function()
            local engine, calls, faults, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            faults.start_once = true
            local req = build_request(trigger, flow, "commit-before-start")
            local first = writable.write(req)
            test.eq(first.success, false)
            local row = query_row("SELECT * FROM workflow_runs WHERE trigger_id=$1", { trigger })
            test.eq(row.admission_state, "unadmitted")
            test.eq(engine[row.dataflow_id].status, "pending")
            force_due(trigger)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            local duplicate = writable.write(req)
            test.eq(duplicate.success, true)
            test.eq(duplicate.dest_ref.run_id, row.run_id)
            test.eq(calls.create, 1)
            test.eq(engine[row.dataflow_id].starts, 1)
        end)

        test.it("create before admission commit: retry reuses the created flow", function()
            local engine, calls, faults, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            faults.create_after = true
            faults.start_once = true
            local req = build_request(trigger, flow, "create-before-admission")
            test.eq(writable.write(req).success, false)
            local row = query_row("SELECT * FROM workflow_runs WHERE trigger_id=$1", { trigger })
            test.eq(engine[row.dataflow_id].status, "pending")
            local retry = writable.write(req)
            test.eq(retry.success, true)
            test.eq(retry.dest_ref.run_id, row.run_id)
            test.eq(calls.create, 1)
            test.eq(engine[row.dataflow_id].starts, 1)
        end)

        test.it("start before admission commit: a running flow is never started twice", function()
            local engine, calls, faults, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            faults.start_after = true
            local req = build_request(trigger, flow, "start-before-admission")
            writable.write(req)
            local row = query_row("SELECT * FROM workflow_runs WHERE trigger_id=$1", { trigger })
            local retry = writable.write(req)
            test.eq(retry.success, true)
            test.eq(retry.dest_ref.run_id, row.run_id)
            test.eq(calls.start, 1)
            test.eq(calls.create, 1)
        end)

        test.it("completion output read crash leaves the run due and never restarts it", function()
            local engine, calls, faults, cli = new_engine()
            local appender, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            local req = build_request(trigger, flow, "completion-output")
            local result = writable.write(req)
            test.eq(result.success, true)
            local run_id = result.dest_ref.run_id
            mark_terminal(engine, run_id)
            force_due(trigger)
            faults.output_once = true
            local crashed, crash_err = maintenance.tick(1, run_id)
            test.is_nil(crash_err)
            test.eq(crashed.failures, 1)
            test.eq(query_row("SELECT status FROM workflow_runs WHERE run_id=$1", { run_id }).status, "running")
            force_due(trigger)
            local recovered, recover_err = maintenance.tick(1, run_id)
            test.is_nil(recover_err)
            test.eq(recovered.failures, 0)
            test.eq(query_row("SELECT status FROM workflow_runs WHERE run_id=$1", { run_id }).status, "completed")
            test.eq(appender.physical[run_id], 1)
            test.eq(calls.start, 1)
            test.eq(writable.write(req).dest_ref.run_id, run_id)
        end)

        test.it("a terminal output error never retries creation or start", function()
            local engine, calls, faults, cli = new_engine()
            local _, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            local req = build_request(trigger, flow, "terminal-before-admission")
            local result = writable.write(req)
            test.eq(result.success, true)
            local run_id = result.dest_ref.run_id
            -- Simulate a caller lost after the engine completed, before its
            -- workflow admission transaction could commit.
            sc.exec("UPDATE workflow_runs SET admission_state='unadmitted',status='pending' WHERE run_id=$1", { run_id })
            mark_terminal(engine, run_id)
            faults.output_once = true
            local crashed = writable.write(req)
            test.eq(crashed.success, false)
            test.eq(crashed.error.retriable, true)
            test.eq(calls.create, 1)
            test.eq(calls.start, 1)
            local recovered = writable.write(req)
            test.eq(recovered.success, true)
            test.eq(recovered.dest_ref.run_id, run_id)
            test.eq(query_row("SELECT status FROM workflow_runs WHERE run_id=$1", { run_id }).status, "completed")
            test.eq(calls.create, 1)
            test.eq(calls.start, 1)
        end)

        test.it("completion publication crash retries one durable event", function()
            local engine, _, _, cli = new_engine()
            local appender, append = new_appender()
            install(cli, append)
            local trigger, flow = "automation-" .. uuid.v4(), "flow-" .. uuid.v4()
            local result = writable.write(build_request(trigger, flow, "completion-publication"))
            test.eq(result.success, true)
            local run_id = result.dest_ref.run_id
            mark_terminal(engine, run_id)
            force_due(trigger)
            appender.fail_for[run_id] = true
            local crashed, crash_err = maintenance.tick(1, run_id)
            test.is_nil(crash_err)
            test.eq(crashed.failures, 1)
            local row = query_row("SELECT status,finished_at FROM workflow_runs WHERE run_id=$1", { run_id })
            test.eq(row.status, "completed")
            test.eq(pending_count(trigger), 1)
            force_due(trigger)
            local recovered, recover_err = maintenance.tick(1, run_id)
            test.is_nil(recover_err)
            test.eq(recovered.published, 1)
            test.eq(appender.physical[run_id], 1)
            test.eq(pending_count(trigger), 0)
            test.eq(query_row("SELECT finished_at FROM workflow_runs WHERE run_id=$1", { run_id }).finished_at, row.finished_at)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
