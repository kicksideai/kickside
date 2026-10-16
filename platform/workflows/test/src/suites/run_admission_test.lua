local test = require("test")
local maintenance = require("maintenance")
local uuid = require("uuid")
local store = require("store")
local workflow = require("workflow")
local types = require("types")
local version_publish = require("version_publish")
local admission = require("admission")
local runs = require("runs")
local json = require("json")
local channel = require("channel")
local process = require("process")
local time = require("time")
local security = require("security")
local funcs = require("funcs")

local IDENTITY = '{"version":2,"principal":{"kind":"user","id":"capacity-test"},'
    .. '"authorized_by":{"kind":"user","id":"capacity-test"},"captured_at":"2026-09-26T00:00:00Z"}'
local FORMER_RUNS_PER_WORKFLOW = 100000

local function reserve_fixture(args: any): (any?, any?)
    local run_id, dataflow_id = args.run_id or uuid.v4(), args.dataflow_id or uuid.v4()
    args.run_id, args.dataflow_id = run_id, dataflow_id
    local payload, encode_err = json.encode({ version = args.version or 1, input = {}, commands = {},
        options = { dataflow_id = dataflow_id, type = "workflow", metadata = { run_id = run_id } },
        start_options = {} })
    test.is_nil(encode_err, tostring(encode_err))
    args.creation_payload_json = payload
    return admission.reserve(args)
end

local function command(kind: string, body: any): any
    return { type = kind, body = body }
end

local function fresh_runs(workflow_id: string): any
    local pid, spawn_err = process.spawn_monitored("app:run_restart_probe", "app:processes",
        { workflow_id = workflow_id })
    test.is_nil(spawn_err, tostring(spawn_err))
    local events, deadline = process.events(), time.after("10s")
    while true do
        local selected = channel.select({ events:case_receive(), deadline:case_receive() })
        if selected.channel ~= events then error("workflow run restart probe did not exit") end
        local event = selected.value
        if type(event) == "table" and tostring(event.from) == tostring(pid) then
            test.eq(event.kind, process.event.EXIT)
            test.is_nil(event.result.error, tostring(event.result.error))
            return event.result.value
        end
    end
end

-- seed_runs copies a reserved run into count settled runs of its workflow.
local function seed_runs(template_id: string, count: integer): ()
    local db = assert(store.open_db())
    local rows = assert(db:query("SELECT * FROM workflow_runs WHERE run_id=$1", { template_id }))
    local columns: { string } = {}
    local values: { string } = {}
    for column in pairs(rows[1]) do
        columns[#columns + 1] = column
        if column == "run_id" then values[#values + 1] = "'seed-' || CAST(x AS TEXT) || '-' || r.run_id"
        elseif column == "dataflow_id" then values[#values + 1] = "'seed-flow-' || CAST(x AS TEXT) || '-' || r.run_id"
        elseif column == "dedup_key" then values[#values + 1] = "'seed-' || CAST(x AS TEXT)"
        else values[#values + 1] = "r." .. column end
    end
    local seeded, seed_err = db:execute("WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<"
        .. tostring(count) .. ") INSERT INTO workflow_runs (" .. table.concat(columns, ",") .. ") SELECT "
        .. table.concat(values, ",") .. " FROM workflow_runs r, n WHERE r.run_id=$1", { template_id })
    test.is_nil(seed_err, tostring(seed_err))
    test.eq(tonumber(seeded.rows_affected), count)
    local settled, settle_err = db:execute([[UPDATE workflow_runs SET status='completed',
        finished_at='2000-01-01T00:00:00Z' WHERE run_id LIKE 'seed-%' AND run_id LIKE $1]],
        { "%-" .. template_id })
    db:release()
    test.is_nil(settle_err, tostring(settle_err))
    test.eq(tonumber(settled.rows_affected), count)
end

local run_cases = test.run_cases(function()
    test.describe("workflow run admission bounded by age expiry", function()
        test.it("admits runs across duplicate delivery and trigger churn", function()
            local flow = "flow-" .. uuid.v4()
            local first = { workflow_id = flow, trigger_id = "trigger-" .. uuid.v4(), dedup_key = "one",
                version = 1, automation_revision = 1, execution_identity_json = IDENTITY }
            local admitted, admit_err = reserve_fixture(first)
            test.is_nil(admit_err, tostring(admit_err))
            test.is_false(admitted.existing)
            local duplicate, duplicate_err = reserve_fixture(first)
            test.is_nil(duplicate_err, tostring(duplicate_err))
            test.is_true(duplicate.existing)
            local removed_gate_db = assert(store.open_db())
            local _, removed_gate_err = removed_gate_db:execute(
                "DELETE FROM workflow_admission_gate WHERE trigger_id=$1", { first.trigger_id })
            removed_gate_db:release()
            test.is_nil(removed_gate_err, tostring(removed_gate_err))
            local second = { workflow_id = flow, trigger_id = "trigger-" .. uuid.v4(), dedup_key = "two",
                version = 1, automation_revision = 1, execution_identity_json = IDENTITY }
            local next_run, next_err = reserve_fixture(second)
            test.is_nil(next_err, tostring(next_err))
            test.is_false(next_run.existing)
            for _ = 1, 2 do test.eq(fresh_runs(flow).physical, 2) end
        end)

        test.it("admits a run for a workflow holding more runs than any former per-workflow count", function()
            local flow = "flow-" .. uuid.v4()
            local template, template_err = reserve_fixture({ workflow_id = flow, trigger_id = "trigger-" .. uuid.v4(),
                dedup_key = "template", version = 1, automation_revision = 1, execution_identity_json = IDENTITY })
            test.is_nil(template_err, tostring(template_err))
            seed_runs(template.row.run_id, FORMER_RUNS_PER_WORKFLOW)
            local next_run, next_err = reserve_fixture({ workflow_id = flow, trigger_id = "trigger-" .. uuid.v4(),
                dedup_key = "past", version = 1, automation_revision = 1, execution_identity_json = IDENTITY })
            test.is_nil(next_err, tostring(next_err))
            test.is_false(next_run.existing)
            test.eq(fresh_runs(flow).physical, FORMER_RUNS_PER_WORKFLOW + 2)
            local pruned = 0
            while true do
                local removed, prune_err = maintenance.prune_terminal()
                test.is_nil(prune_err, tostring(prune_err))
                if removed == 0 then break end
                pruned = pruned + (removed :: integer)
            end
            test.eq(pruned, FORMER_RUNS_PER_WORKFLOW)
            test.eq(fresh_runs(flow).physical, 2)
        end)

        test.it("refuses an oversized run identity before a run row is admitted", function()
            local flow = "flow-" .. uuid.v4()
            local _, reserve_err = reserve_fixture({ workflow_id = flow,
                trigger_id = "trigger-" .. uuid.v4(), dedup_key = "oversized-identity", version = 1,
                automation_revision = 1, execution_identity_json = string.rep("x", 4194305) })
            test.is_true(errors.is(reserve_err, errors.INVALID), tostring(reserve_err))
            test.eq(reserve_err:details().reason, "row_too_large")
            local db = assert(store.open_db())
            local rows = assert(db:query("SELECT run_id FROM workflow_runs WHERE workflow_id=$1", { flow }))
            db:release()
            test.eq(#rows, 0)
        end)

        test.it("bounds the complete encoded run row before admission", function()
            local flow = "flow-" .. uuid.v4()
            local _, reserve_err = reserve_fixture({ workflow_id = flow,
                trigger_id = "trigger-" .. uuid.v4(), dedup_key = "full-row-edge",
                version = 1, automation_revision = 1,
                execution_identity_json = string.rep("x", 4194250) })
            test.is_true(errors.is(reserve_err, errors.INVALID), tostring(reserve_err))
            test.eq(reserve_err:details().reason, "row_too_large")
            local db = assert(store.open_db())
            local rows = assert(db:query("SELECT run_id FROM workflow_runs WHERE workflow_id=$1", { flow }))
            db:release()
            test.eq(#rows, 0)
        end)

        test.it("admits concurrent runs from distinct triggers", function()
            local flow = "flow-" .. uuid.v4()
            local ready, start, done = channel.new(2), channel.new(2), channel.new(2)
            for n = 1, 2 do
                coroutine.spawn(function()
                    ready:send(true)
                    start:receive()
                    local result, err = reserve_fixture({ workflow_id = flow,
                        trigger_id = "trigger-" .. uuid.v4(), dedup_key = "race-" .. tostring(n),
                        version = 1, automation_revision = 1, execution_identity_json = IDENTITY })
                    done:send({ result = result, err = err })
                end)
            end
            ready:receive(); ready:receive()
            start:send(true); start:send(true)
            for _ = 1, 2 do
                local outcome = done:receive()
                test.is_nil(outcome.err, tostring(outcome.err))
                test.not_nil(outcome.result.row)
            end
            test.eq(fresh_runs(flow).physical, 2)
        end)

        test.it("keeps terminal runs until publication and prunes only deleted rows", function()
            local flow, trigger = uuid.v4(), uuid.v4()
            local run, reserve_err = reserve_fixture({ workflow_id = flow, trigger_id = trigger,
                dedup_key = "retention-proof", version = 1, automation_revision = 1,
                execution_identity_json = "{}" })
            test.is_nil(reserve_err, tostring(reserve_err))
            local db = assert(store.open_db())
            local _, terminal_err = db:execute([[UPDATE workflow_runs SET status='completed',
                finished_at='2000-01-01T00:00:00Z',
                terminal_event_pending=TRUE WHERE run_id=$1]], { run.row.run_id })
            test.is_nil(terminal_err, tostring(terminal_err))
            local protected, protected_err = maintenance.prune_terminal(10)
            test.is_nil(protected_err, tostring(protected_err))
            test.eq(protected, 0)
            local _, ack_err = db:execute([[UPDATE workflow_runs SET terminal_event_pending=FALSE
                WHERE run_id=$1]], { run.row.run_id })
            test.is_nil(ack_err, tostring(ack_err))
            local removed, prune_err = maintenance.prune_terminal(10)
            test.is_nil(prune_err, tostring(prune_err))
            test.eq(removed, 1)
            local physical = assert(db:query("SELECT COUNT(*) AS n FROM workflow_runs WHERE workflow_id=$1", { flow }))
            db:release()
            test.eq(tonumber(physical[1].n), 0)
        end)

        test.it("deletes settled runs when the workflow owner is purged", function()
            local flow, trigger = uuid.v4(), uuid.v4()
            local run, reserve_err = reserve_fixture({ workflow_id = flow, trigger_id = trigger,
                dedup_key = "owner-purge", version = 1, automation_revision = 1,
                execution_identity_json = "{}" })
            test.is_nil(reserve_err, tostring(reserve_err))
            local db = assert(store.open_db())
            local _, terminal_err = db:execute([[UPDATE workflow_runs SET status='completed',
                finished_at='2000-01-01T00:00:00Z',
                terminal_event_pending=FALSE WHERE run_id=$1]], { run.row.run_id })
            test.is_nil(terminal_err, tostring(terminal_err))
            db:release()
            local purged, purge_err = store.purge(flow)
            test.is_nil(purge_err, tostring(purge_err))
            test.is_true(purged)
            db = assert(store.open_db())
            local rows = assert(db:query("SELECT run_id FROM workflow_runs WHERE workflow_id=$1", { flow }))
            db:release()
            test.eq(#rows, 0)
        end)
    end)
end)

local function run(options: any): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error(tostring(policy_err or "workflow suite policy unavailable")) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error(tostring(scope_err or "workflow suite scope unavailable")) end
    local actor, actor_err = security.new_actor("capacity-test", {})
    if actor_err or not actor then error(tostring(actor_err or "workflow suite actor unavailable")) end
    local result, err = funcs.new():with_actor(actor):with_scope(scope)
        :call("app:run_admission_actor_run", options or {})
    if err then error(tostring(err)) end
    return result
end

return { run = run, actor_run = run_cases }
