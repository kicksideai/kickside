local test = require("test")
local funcs = require("funcs")
local security = require("security")
local json = require("json")
local canonical_json = require("canonical_json")
local registry = require("registry")
local component = require("component")
local h = require("round_harness")
local recurring = require("recurring_task")
local automations = require("automations")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local process = require("process")
local lease_release = require("lease_release")
local retention_runner = require("retention_runner")
local worker_completion = require("worker_completion")
local reclaim = require("reclaim")
local worker_loop = require("worker_loop")
local lifecycle = require("lifecycle")
local worker_fence = require("worker_fence")

local TOOL = "kickside.automation.agent:recurring_tasks"
local KIND = "kickside.automation.recurring:task"
local PORT = "kickside.automation.recurring.fixture:action"

return { run = test.run_cases(function()
    test.describe("Component-shared recurring tasks", function()
        local env, other, worker
        local ids = {}
        local task_callers: { [string]: any } = {}
        local function call(args, caller)
            return (caller or env.caller):call(TOOL, args)
        end
        local function create(input)
            local result, err = call(input or { action = "create", title = "Recurring check",
                schedule = { type = "interval", expression = "1h" },
                target = { kind = "action", port = PORT, input = { text = "tick" } } })
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            ids[#ids + 1] = result.id
            return result.id
        end
        test.before_all(function()
            env = h.setup("recurring")
            local actor = security.new_actor("recurring_other", { security_groups = { "automation_test" } })
            other = funcs.new():with_actor(actor):with_scope(env.scope)
            h.exec("CREATE TABLE recurring_fixture_log (owner_id TEXT, identity_key TEXT, actor_id TEXT, body TEXT)")
        end)
        local function cleanup()
            if worker then h.stop_worker(worker); worker = nil end
            for _, id in ipairs(ids) do call({ action = "delete", id = id }, task_callers[id]) end
            ids = {}
            task_callers = {}
        end
        -- Each case owns its tasks; a live single-worker check must not first
        -- arm every unrelated task left by preceding sharing assertions.
        test.after_each(cleanup)
        test.after_all(cleanup)
        test.it("creates a source-free timer automation with the caller's identity and generic UI controls", function()
            local id = create()
            local d = h.read_drive(id, "main")
            test.eq(d.source_kind, "timer")
            test.eq(d.action.schedule.expression, "1h")
            test.not_nil(d.job_id)
            local state, err = component.get_private_context(id)
            test.is_nil(err, tostring(err))
            test.eq(state._execution_identity.principal.kind, "user")
            test.eq(state._execution_identity.principal.id, env.owner)
            test.eq(state._execution_identity.authorized_by.id, env.owner)
            local found, type_err = env.caller:call("kickside.automation.agent:automations_read", { action = "type", id = KIND })
            test.is_nil(type_err, tostring(type_err))
            test.is_true(#found.type.controls >= 3)
        end)
        test.it("validates incomplete published commands on the server without changing tasks", function()
            local before = call({ action = "list" }).count
            local schedule = { type = "interval", expression = "1h" }
            local invalid_creates = {
                { action = "create" },
                { action = "create", target = { kind = "workflow",
                    flow_ref = { kind = "flow", id = "published-flow", version = 1 } } },
                { action = "create", target = { kind = "action", port = PORT, input = {} } },
                { action = "create", schedule = schedule },
                { action = "create", schedule = schedule, target = { kind = "workflow" } },
                { action = "create", schedule = schedule, target = { kind = "agent", agent_id = "daily-agent" } },
                { action = "create", schedule = schedule, target = { kind = "agent", prompt = "Daily summary" } },
                { action = "create", schedule = schedule, target = { kind = "action", input = {} } },
                { action = "create", schedule = schedule, target = { kind = "action", port = PORT } },
                { action = "create", schedule = schedule, target = { kind = "action", port = "app.sink:write" } },
            }
            for _, args in ipairs(invalid_creates) do
                local result, err = call(args)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.is_true(#err:message() > 0)
                test.eq(call({ action = "list" }).count, before)
            end
            for _, action in ipairs({ "get", "update", "pause", "resume", "delete", "run_now" }) do
                local result, err = call({ action = action })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.contains(err:message(), "id")
                test.eq(call({ action = "list" }).count, before)
            end
            local id = create()
            local original = canonical_json.encode(component.get_private_context(id))
            for _, target in ipairs({ { kind = "workflow" }, { kind = "agent", agent_id = "daily-agent" },
                { kind = "action", port = PORT }, { kind = "action", input = {} } }) do
                local result, err = call({ action = "update", id = id, target = target })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.is_true(#err:message() > 0)
                test.eq(canonical_json.encode(component.get_private_context(id)), original)
            end
            local unchanged, update_err = call({ action = "update", id = id })
            test.is_nil(update_err, tostring(update_err))
            test.not_nil(unchanged)
            test.eq(canonical_json.encode(component.get_private_context(id)), original)
        end)
        test.it("preserves explicit enabled values in portable declarations across partial edits", function()
            for _, enabled in ipairs({ true, false }) do
                local id = create({ action = "create", title = "Preserved task",
                    schedule = { type = "interval", expression = "1h" },
                    target = { kind = "action", port = PORT, input = {} }, enabled = enabled })
                local original = canonical_json.encode(component.get_private_context(id))
                local updated, err = call({ action = "update", id = id })
                test.is_nil(err, tostring(err))
                test.not_nil(updated)
                test.eq(canonical_json.encode(component.get_private_context(id)), original)
                local changed, change_err = call({ action = "update", id = id,
                    schedule = { type = "interval", expression = "2h" } })
                test.is_nil(change_err, tostring(change_err))
                test.not_nil(changed)
                test.eq(component.get_private_context(id)._portable_input.enabled, enabled)
                test.eq(h.read_drive(id, "main").enabled, enabled)
            end
        end)
        test.it("round-trips empty target input as an object on create and update", function()
            local id = create({ action = "create", schedule = { type = "interval", expression = "1h" },
                target = { kind = "action", port = PORT, input = {} } })
            local function check(stage)
                local result, err = call({ action = "get", id = id })
                test.is_nil(err, tostring(err))
                test.eq(json.encode(result.task.target.input), "{}", stage .. " returned config")
                test.eq(json.encode(component.get_private_context(id).target.input), "{}", stage .. " private state")
                local stored = h.query("SELECT private_context FROM kickside_components WHERE component_id=$1", { id })[1].private_context
                local decoded = type(stored) == "string" and json.decode(stored) or stored
                test.eq(json.encode(decoded.target.input), "{}", stage .. " stored state")
                test.eq(json.encode(decoded._portable_input.target.input), "{}", stage .. " stored portable input")
            end
            check("create")
            local updated, err = call({ action = "update", id = id,
                target = { kind = "action", port = PORT, input = {} } })
            test.is_nil(err, tostring(err))
            test.not_nil(updated)
            check("update")
        end)
        test.it("returns the complete task target from get and a compact list row", function()
            local body = string.rep("x", 20000)
            local id = create({ action = "create", schedule = { type = "interval", expression = "1h" },
                target = { kind = "action", port = PORT, input = { body = body } } })
            local got, get_err = call({ action = "get", id = id })
            test.is_nil(get_err, tostring(get_err))
            test.eq(got.task.target.port, PORT)
            test.eq(got.task.target.input.body, body)
            local listed, list_err = call({ action = "list" })
            test.is_nil(list_err, tostring(list_err))
            local found = false
            for _, task in ipairs(listed.tasks) do
                if task.id == id then
                    found = true
                    test.eq(task.target.port, PORT)
                    test.is_nil(task.target.input)
                    test.is_nil(task.target.config)
                end
            end
            test.is_true(found)
        end)
        test.it("pages the task list with a cursor, once per task, and rejects a bad cursor", function()
            local created = {}
            for _ = 1, 3 do created[create()] = true end
            local seen, cursor, pages = {}, nil, 0
            repeat
                local page, err = call({ action = "list", limit = 2, cursor = cursor })
                test.is_nil(err, tostring(err))
                test.is_true(#page.tasks <= 2)
                for _, task in ipairs(page.tasks) do
                    test.is_nil(seen[task.id], "task listed twice")
                    seen[task.id] = true
                    test.not_nil(task.target)
                end
                cursor = page.next_cursor
                pages = pages + 1
                test.is_true(pages < 50)
            until cursor == nil
            for id in pairs(created) do test.is_true(seen[id], "task missing from the pages") end
            for _, bad in ipairs({ "x", "-1", "1.5" }) do
                local result, err = call({ action = "list", cursor = bad })
                test.is_nil(result)
                test.not_nil(err)
            end
            local zero, zero_err = call({ action = "list", limit = 0 })
            test.is_nil(zero)
            test.not_nil(zero_err)
        end)
        test.it("retires a mapped receipt when its recurring owner is deleted", function()
            local id = create()
            h.exec([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                VALUES ($1,'source','mapped','main','mapped','{"id":"survivor"}',$2)]],
                { id, time.now():utc():format(time.RFC3339) })
            local deleted, delete_err = call({ action = "delete", id = id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted.result.deleted)
            test.eq(deleted.result.discarded.receipt_mapped, 1)
            test.eq(#h.query("SELECT owner_id FROM kickside_automation_receipt WHERE owner_id=$1", { id }), 0)
            test.eq(#h.query("SELECT component_id FROM kickside_components WHERE component_id=$1", { id }), 0)
        end)
        test.it("does not immediately requeue a pending slot with unsettled run history", function()
            local id = create()
            local job = h.query("SELECT * FROM kickside_job WHERE id=$1", { h.read_drive(id, "main").job_id })[1]
            local run_id = uuid.v7()
            h.exec("UPDATE kickside_job SET wake_enabled=FALSE,scheduled_at=NULL WHERE id=$1", { job.id })
            h.exec("INSERT INTO kickside_job_run (id,job_id,job_type,owner_kind,owner_id,"
                .. "execution_seq,attempt_no,status,lease_token) VALUES ($1,$2,$3,$4,$5,1,1,'running',$6)",
                { run_id, job.id, job.job_type, job.owner_kind, job.owner_id, uuid.v7() })
            local mailbox = process.listen("kickside.core.retention.changed")
            local db = h.db()
            local ok, failure = pcall(function()
                local deleted, delete_err = call({ action = "delete", id = id })
                test.is_nil(delete_err, tostring(delete_err))
                test.is_true(deleted.result.cleanup_pending)
                test.eq(deleted.result.details.wait_for, "run_history_settlement")
                for _ = 1, 2 do
                    local pass, pass_err = retention_runner.on_wake(db, tostring(process.pid()), {
                        kind = "unsettled_history_probe", owner_locator = { kind = "automation", id = id } })
                    test.is_nil(pass_err, tostring(pass_err))
                    test.eq(#pass.owner_failures, 0)
                    test.eq(#h.query("SELECT id FROM kickside_job_run WHERE id=$1 AND status='running'", { run_id }), 1)
                    test.eq(#h.query("SELECT id FROM kickside_job WHERE id=$1 AND status='pending'", { job.id }), 1)
                    test.not_nil(h.query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { id })[1].deleting_at)
                    test.is_false(pass.stats.needs_continue, "unchanged running history requests immediate continuation")
                    test.is_true(channel.select({ mailbox:case_receive(), default = true }).default)
                    test.eq(#pass.owner_blocked, 1)
                    test.is_true(errors.is(pass.owner_blocked[1].error, errors.CONFLICT))
                    test.eq(pass.owner_blocked[1].error:details().wait_for, "run_history_settlement")
                end
            end)
            db:release()
            process.unlisten(mailbox)
            h.exec("UPDATE kickside_job_run SET status='failed' WHERE id=$1", { run_id })
            if not ok then error(failure) end
        end)
        test.it("fully removes an ever-paused task and its parked run history", function()
            local id = create()
            local job_id = h.read_drive(id, "main").job_id
            local paused, pause_err = call({ action = "pause", id = id })
            test.is_nil(pause_err, tostring(pause_err))
            test.not_nil(paused)
            -- Lease this task's exact slot, then execute the production worker.
            -- The resident pool is disabled so no unrelated job can overtake it.
            local token = uuid.v7()
            local now = time.now():utc()
            h.exec("UPDATE kickside_job SET status='running',execution_seq=execution_seq+1,lease_token=$1,"
                .. "lease_until=$2,scheduled_at=$3 WHERE id=$4 AND status='pending'",
                { token, now:add(60 * time.SECOND):format(time.RFC3339), now:format(time.RFC3339), job_id })
            local job = h.query("SELECT * FROM kickside_job WHERE id=$1", { job_id })[1]
            job.deadline = time.now():utc():add(h.execution_ceiling_ms() * time.MILLISECOND):format(time.RFC3339)
            test.eq(job.lease_token, token)
            local completed, complete_err = env.caller:call("kickside.automation:round", {
                job = job, payload = { automation_id = id, drive_key = "main" } })
            test.is_nil(complete_err, tostring(complete_err))
            test.is_true(completed.self_completed)
            local parked = h.query("SELECT id FROM kickside_job_run WHERE job_id=$1 AND status='parked'", { job_id })
            test.is_true(#parked > 0, "pause must leave real parked history")
            local resumed, resume_err = call({ action = "resume", id = id })
            test.is_nil(resume_err, tostring(resume_err))
            test.not_nil(resumed)
            local deleted, delete_err = call({ action = "delete", id = id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted.result.deleted)
            test.eq(#h.query("SELECT component_id FROM kickside_components WHERE component_id=$1", { id }), 0)
            test.eq(#h.query("SELECT id FROM kickside_job WHERE id=$1", { job_id }), 0)
            test.eq(#h.query("SELECT id FROM kickside_job_run WHERE job_id=$1", { job_id }), 0)
            test.eq(#h.query("SELECT automation_id FROM kickside_automation_drive WHERE automation_id=$1", { id }), 0)
            local result, list_err = call({ action = "list" })
            test.is_nil(list_err, tostring(list_err))
            for _, row in ipairs(result.tasks) do test.is_true(row.id ~= id) end
        end)
        for _, mode in ipairs({ "round", "failure", "paged", "confirmed", "terminated", "child_failure", "revoked" }) do
            test.it("completes a pending delete on lease release: " .. mode, function()
                -- Own the consumer mailbox so no unrelated retention deadline or
                -- resident process can make this regression pass accidentally.
                local mailbox = process.listen(lease_release.TOPIC)
                local continuation = process.listen("kickside.core.retention.changed")
                local registered, register_err = process.registry.register(lease_release.NAME, nil, process.registry.CONSISTENT)
                test.is_nil(register_err, tostring(register_err))
                test.is_true(registered)
                local held_db
                local cleanup_id
                local cleanup_job_id
                local ok, failure = pcall(function()
                    local id = create()
                    cleanup_id = id
                    local job_id = h.read_drive(id, "main").job_id
                    cleanup_job_id = job_id
                    local token = uuid.v7()
                    local now = time.now():utc()
                    h.exec("UPDATE kickside_job SET status='running',execution_seq=execution_seq+1,lease_token=$1,"
                        .. "lease_until=$2,scheduled_at=$3 WHERE id=$4 AND status='pending'",
                        { token, now:add(60 * time.SECOND):format(time.RFC3339), now:format(time.RFC3339), job_id })
                    local job = h.query("SELECT * FROM kickside_job WHERE id=$1", { job_id })[1]
                    job.deadline = time.now():utc():add(h.execution_ceiling_ms() * time.MILLISECOND):format(time.RFC3339)
                    test.eq(job.lease_token, token)
                    if mode == "paged" then
                        -- Retained history larger than one bounded Jobs purge page.
                        h.exec("UPDATE kickside_job SET execution_seq=102 WHERE id=$1", { job_id })
                        job.execution_seq = 102
                        for seq = 1, 101 do
                            h.exec("INSERT INTO kickside_job_run (id,job_id,job_type,owner_kind,owner_id,"
                                .. "execution_seq,attempt_no,status,lease_token) VALUES ($1,$2,$3,$4,$5,$6,1,'parked',$7)",
                                { uuid.v7(), job_id, job.job_type, job.owner_kind, job.owner_id, seq, uuid.v7() })
                        end
                    elseif mode == "failure" or mode == "confirmed" or mode == "terminated" or mode == "child_failure" or mode == "revoked" then
                        job.run_id = uuid.v7()
                        h.exec("INSERT INTO kickside_job_run (id,job_id,job_type,owner_kind,owner_id,"
                            .. "execution_seq,attempt_no,status,lease_token) VALUES ($1,$2,$3,$4,$5,$6,1,'running',$7)",
                            { job.run_id, job_id, job.job_type, job.owner_kind, job.owner_id, job.execution_seq, token })
                    end
                    local deleted, delete_err = call({ action = "delete", id = id })
                    test.is_nil(delete_err, tostring(delete_err))
                    test.is_true(deleted.result.cleanup_pending)
                    test.is_false(deleted.result.deleted)
                    test.not_nil(h.query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { id })[1].deleting_at)
                    -- A retention pass while the lease is held must preserve it.
                    local db = h.db()
                    held_db = db
                    local before, before_err = retention_runner.on_wake(db, tostring(process.pid()), {
                        kind = "delete_requested", owner_locator = { kind = "automation", id = id } })
                    test.is_nil(before_err, tostring(before_err))
                    test.not_nil(before)
                    test.is_false(before.stats.needs_continue)
                    test.eq(h.query("SELECT status FROM kickside_job WHERE id=$1", { job_id })[1].status, "running")
                    local recovery_path = mode == "confirmed" or mode == "terminated" or mode == "child_failure" or mode == "revoked"
                    if recovery_path then
                        -- Parked recurring tasks have no ordinary future wake to rescue deletion.
                        h.exec("UPDATE kickside_job SET wake_enabled=FALSE,scheduled_at=NULL WHERE id=$1", { job_id })
                        local run_ctx = { id = job.run_id, started_at_unix = time.now():unix() }
                        if mode ~= "child_failure" then
                            local fence_err = worker_fence.prepare_termination(db, job)
                            test.is_nil(fence_err, tostring(fence_err))
                        end
                        if mode == "terminated" then
                            h.exec("UPDATE kickside_job SET lease_until='2000-01-01T00:00:00Z' WHERE id=$1", { job_id })
                        end
                        local function settle()
                            if mode == "child_failure" then
                                return worker_loop.settle_child_exit(db, tostring(db:type()), job, run_ctx,
                                    errors.new({ message = "child ended with error", kind = errors.INVALID }), nil)
                            elseif mode == "confirmed" or mode == "revoked" then
                                return worker_loop.settle_child_exit(db, tostring(db:type()), job, run_ctx, nil,
                                    mode == "revoked" and "revoked" or "shutdown")
                            end
                            local settled, settle_err = reclaim.reclaim_terminated(db, tostring(db:type()), 1)
                            if not settle_err then test.eq(settled, 1) end
                            return settle_err
                        end
                        if mode ~= "revoked" then
                            local original = lifecycle.finalize_job_run
                            lifecycle.finalize_job_run = function()
                                return errors.new({ message = "history commit refuses settlement", kind = errors.INTERNAL })
                            end
                            local attempted, attempt_err = pcall(settle)
                            lifecycle.finalize_job_run = original
                            test.is_true(attempted, tostring(attempt_err))
                            test.is_true(errors.is(attempt_err, errors.INTERNAL), tostring(attempt_err))
                            local still_running = h.query("SELECT status,lease_token FROM kickside_job WHERE id=$1", { job_id })[1]
                            test.eq(still_running.status, "running")
                            test.eq(still_running.lease_token, token)
                            test.eq(h.query("SELECT status FROM kickside_job_run WHERE id=$1", { job.run_id })[1].status, "running")
                            test.is_true(channel.select({ mailbox:case_receive(), default = true }).default,
                                "rolled-back settlement emits a release wake")
                        end
                        local settle_err = settle()
                        test.is_nil(settle_err, tostring(settle_err))
                        local state = h.query("SELECT status,lease_token FROM kickside_job WHERE id=$1", { job_id })[1]
                        test.is_true(state.status ~= "running")
                        test.is_nil(state.lease_token)
                        test.eq(h.query("SELECT status FROM kickside_job_run WHERE id=$1", { job.run_id })[1].status, "failed")
                        test.not_nil(h.query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { id })[1].deleting_at)
                    elseif mode == "failure" then
                        local fail_err, recorded = worker_completion.fail_job(db, tostring(db:type()), job, nil,
                            "round execution failed", "deterministic", { id = job.run_id, started_at_unix = time.now():unix() })
                        test.is_nil(fail_err, tostring(fail_err))
                        test.is_true(recorded)
                    else
                        local completed, complete_err = env.caller:call("kickside.automation:round", {
                            job = job, payload = { automation_id = id, drive_key = "main" } })
                        test.is_nil(complete_err, tostring(complete_err))
                        test.is_true(completed.self_completed)
                    end
                    local released = channel.select({ mailbox:case_receive(), time.after(5 * time.SECOND):case_receive() })
                    test.eq(released.channel, mailbox, "lease release did not hand off pending owner cleanup")
                    test.eq(released.value.job_id, job_id)
                    test.eq(released.value.execution_seq, job.execution_seq)
                    test.eq(released.value.owner_locator.id, id)
                    -- The production retention runner consumes the real post-commit
                    -- message; there is no second delete request or polling.
                    local resumed, resume_err = retention_runner.on_wake(db, tostring(process.pid()), released.value)
                    test.is_nil(resume_err, tostring(resume_err))
                    test.not_nil(resumed)
                    if mode == "paged" then
                        test.is_true(resumed.stats.needs_continue)
                        test.not_nil(h.query("SELECT id FROM kickside_job WHERE id=$1", { job_id })[1])
                        local more = channel.select({ continuation:case_receive(), time.after(5 * time.SECOND):case_receive() })
                        test.eq(more.channel, continuation, "bounded purge page lost its continuation")
                        local finished, finish_err = retention_runner.on_wake(db, tostring(process.pid()), more.value)
                        test.is_nil(finish_err, tostring(finish_err))
                        test.is_false(finished.stats.needs_continue)
                    else test.is_false(resumed.stats.needs_continue) end
                    db:release()
                    held_db = nil
                    for _, query in ipairs({
                        "SELECT component_id FROM kickside_components WHERE component_id=$1",
                        "SELECT automation_id FROM kickside_automation_drive WHERE automation_id=$1",
                        "SELECT automation_id FROM kickside_automation_command WHERE automation_id=$1",
                    }) do test.eq(#h.query(query, { id }), 0) end
                    test.eq(#h.query("SELECT id FROM kickside_job WHERE id=$1", { job_id }), 0)
                    test.eq(#h.query("SELECT id FROM kickside_job_run WHERE job_id=$1", { job_id }), 0)
                    local listed, list_err = call({ action = "list" })
                    test.is_nil(list_err, tostring(list_err))
                    for _, row in ipairs(listed.tasks) do test.is_true(row.id ~= id) end
                end)
                if held_db then held_db:release() end
                process.registry.unregister(lease_release.NAME, process.registry.CONSISTENT)
                process.unlisten(mailbox)
                process.unlisten(continuation)
                if not ok and cleanup_job_id then
                    h.exec("UPDATE kickside_job_run SET status='failed' WHERE job_id=$1 AND status='running'", { cleanup_job_id })
                    local _, cleanup_err = component.system_delete(cleanup_id, "reparent_root")
                    if cleanup_err then error(tostring(failure) .. "; cleanup: " .. tostring(cleanup_err)) end
                end
                if not ok then error(failure) end
            end)
        end
        test.it("the resident retention consumer resumes delete after the round releases its lease", function()
            local observed = process.listen("recurring.cleanup.observed")
            local _, register_err = process.registry.register("kickside.automation.recurring.fixture:delete_observer")
            test.is_nil(register_err, tostring(register_err))
            local sweeper_pid
            local ok, failure = pcall(function()
                h.exec("CREATE TABLE recurring_cleanup_watch (component_id TEXT PRIMARY KEY, phase TEXT NOT NULL)")
                local id = create()
                local job_id = h.read_drive(id, "main").job_id
                local now = time.now():utc()
                h.exec("UPDATE kickside_job SET status='running',execution_seq=execution_seq+1,lease_token=$1,"
                    .. "lease_until=$2 WHERE id=$3", { uuid.v7(), now:add(60 * time.SECOND):format(time.RFC3339), job_id })
                local job = h.query("SELECT * FROM kickside_job WHERE id=$1", { job_id })[1]
                job.deadline = time.now():utc():add(h.execution_ceiling_ms() * time.MILLISECOND):format(time.RFC3339)
                local deleted, delete_err = call({ action = "delete", id = id })
                test.is_nil(delete_err, tostring(delete_err))
                test.is_true(deleted.result.cleanup_pending)
                h.exec("INSERT INTO recurring_cleanup_watch VALUES ($1,'start')", { id })
                local spawn_err
                sweeper_pid, spawn_err = process.spawn_monitored("kickside.core.retention.service:sweeper_process", "app:processes")
                test.is_nil(spawn_err, tostring(spawn_err))
                test.not_nil(sweeper_pid)
                local held = channel.select({ observed:case_receive(), process.events():case_receive(), time.after(5 * time.SECOND):case_receive() })
                if held.channel ~= observed then
                    if type(held.value) == "table" and held.value.kind == process.event.EXIT
                        and tostring(held.value.from) == tostring(sweeper_pid) then sweeper_pid = nil end
                    error("retention did not reach held-lease boot barrier: " .. tostring(json.encode(held.value)))
                end
                test.eq(held.value.phase, "held")
                test.eq(held.value.id, id)
                local completed, complete_err = env.caller:call("kickside.automation:round", {
                    job = job, payload = { automation_id = id, drive_key = "main" } })
                test.is_nil(complete_err, tostring(complete_err))
                test.is_true(completed.self_completed)
                local removed = channel.select({ observed:case_receive(), time.after(5 * time.SECOND):case_receive() })
                test.eq(removed.channel, observed, "retention lost the lease-release wake")
                test.eq(removed.value.phase, "removed")
                test.eq(#h.query("SELECT component_id FROM kickside_components WHERE component_id=$1", { id }), 0)
                test.eq(#h.query("SELECT automation_id FROM kickside_automation_drive WHERE automation_id=$1", { id }), 0)
                test.eq(#h.query("SELECT id FROM kickside_job WHERE id=$1", { job_id }), 0)
                test.eq(#h.query("SELECT id FROM kickside_job_run WHERE job_id=$1", { job_id }), 0)
            end)
            if sweeper_pid and process.registry.lookup(lease_release.NAME, process.registry.CONSISTENT) == sweeper_pid then h.stop_worker(sweeper_pid) end
            process.registry.unregister("kickside.automation.recurring.fixture:delete_observer")
            process.unlisten(observed)
            h.exec("DROP TABLE IF EXISTS recurring_cleanup_watch")
            if not ok then error(failure) end
        end)
        test.it("refuses invalid cron and nonpositive intervals before creating anything", function()
            for _, schedule in ipairs({ { type = "cron", expression = "bad" }, { type = "interval", expression = "0s" } }) do
                local result, err = call({ action = "create", schedule = schedule, target = { kind = "action", port = PORT, input = {} } })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
            end
        end)
        test.it("checks live workflow component READ grants on create and target replacement", function()
            local target, replacement = create(), create()
            local input = { action = "create", schedule = { type = "interval", expression = "1h" },
                target = { kind = "workflow", flow_ref = { kind = "flow", id = target, version = 1 }, input = {} } }
            local id = create(input)
            local denied, access_err = call(input, other)
            test.is_nil(denied)
            test.is_true(errors.is(access_err, errors.PERMISSION_DENIED), tostring(access_err))
            local granted, grant_err = env.caller:call("kickside.component.binding:grant_subtree_func", {
                root_component_id = target, subject = { subject_type = "user", subject_id = "recurring_other" },
                access_mask = component.ACCESS.READ })
            test.is_nil(grant_err, tostring(grant_err))
            test.is_true(granted.success)
            local shared, shared_err = call(input, other)
            test.is_nil(shared_err, tostring(shared_err))
            test.not_nil(shared)
            ids[#ids + 1] = shared.id
            task_callers[shared.id] = other
            local changed, change_err = call({ action = "update", id = shared.id,
                target = { kind = "workflow", flow_ref = { kind = "flow", id = replacement, version = 1 }, input = {} } }, other)
            test.is_nil(changed)
            test.is_true(errors.is(change_err, errors.PERMISSION_DENIED), tostring(change_err))
            test.eq(component.get_private_context(id).target.flow_ref.id, target)
            local saved, saved_err = call({ action = "get", id = shared.id }, other)
            test.is_nil(saved_err, tostring(saved_err))
            test.eq(saved.task.target.flow_ref.id, target)
        end)
        test.it("rejects action config and input against the declared port schemas on create and update", function()
            local port = "kickside.automation.recurring.fixture:typed_action"
            local valid = { kind = "action", port = port, config = {
                flow_ref = { kind = "flow", id = "published", version = 1 } }, input = { text = "tick" } }
            local id = create({ action = "create", schedule = { type = "interval", expression = "1h" }, target = valid })
            local before = canonical_json.encode(component.get_private_context(id).target)
            local bad = {
                { config = {}, input = { text = "tick" }, field = "flow_ref" },
                { config = { flow_ref = { kind = "flow", id = "published" } }, input = { text = "tick" }, field = "flow_ref.version" },
                { config = { flow_ref = { kind = "flow", id = "", version = 1 } }, input = { text = "tick" }, field = "flow_ref.id" },
                { config = { flow_ref = { kind = "flow", id = "published", version = 0 } }, input = { text = "tick" }, field = "flow_ref.version" },
                { config = { flow_ref = { kind = "flow", id = "published", version = 1.5 } }, input = { text = "tick" }, field = "flow_ref.version" },
                { config = { flow_ref = { kind = "flow", id = "published", version = "1" } }, input = { text = "tick" }, field = "flow_ref.version" },
                { config = { flow_ref = { kind = "agent", id = "published", version = 1 } }, input = { text = "tick" }, field = "flow_ref.kind" },
                { config = valid.config, input = { text = 3 }, field = "text" },
                { config = valid.config, input = {}, field = "text" },
            }
            for _, value in ipairs(bad) do
                for _, action in ipairs({ "create", "update" }) do
                    local answer, err = call({ action = action, id = action == "update" and id or nil,
                        schedule = { type = "interval", expression = "1h" },
                        target = { kind = "action", port = port, config = value.config, input = value.input } })
                    if answer and action == "create" then ids[#ids + 1] = answer.id end
                    test.is_nil(answer)
                    test.is_true(errors.is(err, errors.INVALID), tostring(err))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "automation_input_invalid")
                    test.eq(err:details().field, value.field)
                    test.eq(err:details().error_kind, "declaration")
                    test.eq(canonical_json.encode(component.get_private_context(id).target), before)
                end
            end
        end)
        test.it("hides unshared tasks and refuses every cross-user operation", function()
            local id = create()
            local result, err = call({ action = "list" }, other)
            test.is_nil(err, tostring(err))
            test.eq(#result.tasks, 0)
            for _, action in ipairs({ "get", "pause", "resume", "update", "delete", "run_now" }) do
                local answer, denied = call({ action = action, id = id, schedule = { type = "interval", expression = "2h" } }, other)
                test.is_nil(answer)
                test.is_true(errors.is(denied, errors.PERMISSION_DENIED) or errors.is(denied, errors.NOT_FOUND), tostring(denied))
            end
            test.eq(h.read_drive(id, "main").action.schedule.expression, "1h")
        end)
        local function grant(id, mask, subject, caller)
            local result, err = (caller or env.caller):call("kickside.component.binding:grant_subtree_func", {
                root_component_id = id, subject = subject or { subject_type = "user", subject_id = "recurring_other" },
                access_mask = mask })
            test.is_nil(err, tostring(err))
            test.is_true(result.success, tostring(result.error))
        end
        local function listed(id, caller)
            local result, err = call({ action = "list" }, caller)
            test.is_nil(err, tostring(err))
            for _, row in ipairs(result.tasks) do if row.id == id then return row end end
            return nil
        end
        local function refused(args, caller)
            local result, err = call(args, caller or other)
            test.is_nil(result)
            test.not_nil(err)
        end
        test.it("READ shares expose config, status, errors and owner on both tools but cannot mutate or share", function()
            local id = create()
            grant(id, component.ACCESS.READ)
            local row = listed(id, other)
            test.not_nil(row)
            test.eq(row.owner_id, env.owner)
            test.is_false(row.is_owner)
            test.is_true(listed(id).is_owner)
            local result, err = call({ action = "get", id = id }, other)
            test.is_nil(err, tostring(err))
            test.eq(result.task.schedule.expression, "1h")
            test.is_true(result.task.enabled)
            test.eq(result.task.failed_runs, 0)
            local generic = other:call("kickside.automation.agent:automations_read", { action = "list", limit = 100 })
            local found
            for _, item in ipairs(generic.automations) do if item.id == id then found = item end end
            test.not_nil(found)
            test.eq(found.owner_id, env.owner)
            for _, action in ipairs({ "read_config", "status" }) do
                local answer, read_err = other:call("kickside.automation.agent:automations_read", { action = action, id = id })
                test.is_nil(read_err, tostring(read_err))
                test.not_nil(answer)
            end
            for _, action in ipairs({ "pause", "resume", "update", "delete", "run_now" }) do
                refused({ action = action, id = id, schedule = { type = "interval", expression = "2h" } })
            end
            local shared = other:call("kickside.component.binding:grant_subtree_func", { root_component_id = id,
                subject = { subject_type = "user", subject_id = "third" }, access_mask = 1 })
            test.is_false(shared.success)
        end)
        test.it("WRITE sharees can pause, resume, edit and run now without changing execution identity", function()
            local id = create()
            grant(id, 3)
            local before = canonical_json.encode(component.get_private_context(id)._execution_identity)
            test.not_nil(listed(id, other))
            for _, action in ipairs({ "pause", "resume", "run_now" }) do
                local answer, err = call({ action = action, id = id }, other)
                test.is_nil(err, tostring(err))
                test.not_nil(answer)
            end
            local answer, err = call({ action = "update", id = id, schedule = { type = "interval", expression = "2h" },
                target = { kind = "action", port = PORT, input = { text = "sharee edited" } } }, other)
            test.is_nil(err, tostring(err))
            test.not_nil(answer)
            test.eq(h.read_drive(id, "main").action.schedule.expression, "2h")
            test.eq(canonical_json.encode(component.get_private_context(id)._execution_identity), before)
            local generic, generic_err = other:call("kickside.automation.agent:automations_manage", { action = "pause", id = id })
            test.is_nil(generic_err, tostring(generic_err))
            test.not_nil(generic)
            test.is_false(h.read_drive(id, "main").enabled)
            refused({ action = "delete", id = id })
            local shared = other:call("kickside.component.binding:grant_subtree_func", { root_component_id = id,
                subject = { subject_type = "user", subject_id = "third" }, access_mask = 1 })
            test.is_false(shared.success)
            local selected, select_err = other:call("kickside.automation.recurring.fixture:access_probe", {
                id = id, operation = "identity", request_id = "denied:" .. id })
            test.is_nil(selected)
            test.not_nil(select_err)
        end)
        test.it("sharees edit cadence without access to unchanged targets and need grants for new targets", function()
            local target, replacement = create(), create()
            local id = create({ action = "create", schedule = { type = "interval", expression = "1h" },
                target = { kind = "agent", agent_id = target, prompt = "Existing target" } })
            grant(id, 3)
            local before = canonical_json.encode(component.get_private_context(id)._execution_identity)
            local changed, err = call({ action = "update", id = id,
                schedule = { type = "interval", expression = "2h" } }, other)
            test.is_nil(err, tostring(err))
            test.not_nil(changed)
            local new_target = { kind = "agent", agent_id = replacement, prompt = "New target" }
            refused({ action = "update", id = id, target = new_target })
            test.eq(component.get_private_context(id).target.agent_id, target)
            grant(replacement, component.ACCESS.READ)
            local updated, update_err = other:call("kickside.automation.agent:automations_manage", {
                action = "reconfigure", id = id, input = { target = new_target } })
            test.is_nil(update_err, tostring(update_err))
            test.not_nil(updated)
            test.eq(component.get_private_context(id).target.agent_id, replacement)
            test.eq(canonical_json.encode(component.get_private_context(id)._execution_identity), before)
            -- Retaining a target never skips the executor's live resource grant.
            h.exec("UPDATE kickside_component_access SET access_mask=0 WHERE component_id=$1 AND subject_id=$2",
                { replacement, env.owner })
            refused({ action = "update", id = id, schedule = { type = "interval", expression = "3h" } })
            h.exec("UPDATE kickside_component_access SET access_mask=15 WHERE component_id=$1 AND subject_id=$2",
                { replacement, env.owner })
        end)
        test.it("returns PERMISSION_DENIED for visible ADMIN shares without DELETE", function()
            local id = create()
            grant(id, 11)
            test.not_nil(listed(id, other))
            for _, tool in ipairs({ TOOL, "kickside.automation.agent:automations_manage" }) do
                local result, err = other:call(tool, { action = tool == TOOL and "delete" or "uninstall", id = id })
                test.is_nil(result)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            end
            test.not_nil(listed(id, other))
            test.is_nil(h.query("SELECT deleting_at FROM kickside_components WHERE component_id=$1", { id })[1].deleting_at)
        end)
        test.it("ADMIN shares permit cascading sharing and deletion through recurring and generic tools", function()
            for _, generic in ipairs({ false, true }) do
                local id = create()
                grant(id, 15)
                grant(id, 1, { subject_type = "user", subject_id = "third" }, other)
                local answer, err
                if generic then
                    answer, err = other:call("kickside.automation.agent:automations_manage", { action = "uninstall", id = id })
                else answer, err = call({ action = "delete", id = id }, other) end
                test.is_nil(err, tostring(err))
                test.not_nil(answer)
                test.is_nil(listed(id, other))
            end
        end)
        test.it("resolves group grants by membership and keeps unrelated actors invisible", function()
            local id = create()
            local member = funcs.new():with_actor(security.new_actor("recurring_member", {
                security_groups = { "automation_test", "recurring_shared" } })):with_scope(env.scope)
            grant(id, 3, { subject_type = "group", subject_id = "recurring_shared" })
            test.is_nil(listed(id, other))
            test.not_nil(listed(id, member))
            local answer, err = call({ action = "pause", id = id }, member)
            test.is_nil(err, tostring(err))
            test.not_nil(answer)
            test.is_false(h.read_drive(id, "main").enabled)
        end)
        test.it("does not require READ for generic WRITE controls or ADMIN identity selection", function()
            for _, mask in ipairs({ component.ACCESS.WRITE, component.ACCESS.ADMIN }) do
                local id = create()
                grant(id, mask)
                test.is_nil(listed(id, other))
                local operation = mask == component.ACCESS.WRITE and "control" or "identity"
                local answer, err = other:call("kickside.automation.recurring.fixture:access_probe", {
                    id = id, operation = operation, request_id = "acl:" .. id .. ":" .. operation })
                test.is_nil(err, tostring(err))
                test.not_nil(answer)
                test.eq(answer.state, "succeeded")
                if mask == component.ACCESS.WRITE then
                    for _, action in ipairs({ "pause", "resume", "update", "run_now" }) do
                        local result, tool_err = call({ action = action, id = id,
                            schedule = { type = "interval", expression = "3h" } }, other)
                        test.is_nil(tool_err, tostring(tool_err))
                        test.is_true(result.success)
                        test.is_nil(result.task)
                    end
                    test.eq(h.read_drive(id, "main").action.schedule.expression, "3h")
                end
            end
        end)
        test.it("updates cadence and target, pauses, resumes and deletes through one tool", function()
            local id = create()
            test.not_nil(select(1, call({ action = "pause", id = id })))
            test.is_false(h.read_drive(id, "main").enabled)
            local updated, err = call({ action = "update", id = id, schedule = { type = "cron", expression = "*/5 * * * *" },
                target = { kind = "action", port = PORT, input = { text = "updated" } } })
            test.is_nil(err, tostring(err))
            test.not_nil(updated)
            test.eq(h.read_drive(id, "main").action.schedule.expression, "*/5 * * * *")
            test.is_false(h.read_drive(id, "main").enabled)
            test.not_nil(select(1, call({ action = "resume", id = id })))
            test.is_true(h.read_drive(id, "main").enabled)
            test.not_nil(select(1, call({ action = "delete", id = id })))
            test.is_nil(select(1, call({ action = "get", id = id })))
        end)
        test.it("refuses undelegated group selection and leaves the task paused under its creator", function()
            local result, err = call({ action = "create", title = "Denied group",
                schedule = { type = "interval", expression = "1h" },
                target = { kind = "action", port = PORT, input = {} },
                principal = { kind = "group", id = "not-delegated" } })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            local details = (err :: any):details()
            test.not_nil(details.task_id)
            ids[#ids + 1] = details.task_id
            test.is_false(h.read_drive(details.task_id, "main").enabled)
            local state = component.get_private_context(details.task_id)
            test.eq(state._execution_identity.principal.id, env.owner)
        end)
        test.it("preserves INVALID when group identity selection rejects its input", function()
            local result, err = call({ action = "create", schedule = { type = "interval", expression = "1h" },
                target = { kind = "action", port = PORT, input = {} }, principal = { kind = "group", id = "" } })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            local details = (err :: any):details()
            ids[#ids + 1] = details.task_id
            test.is_true(details.paused)
            test.is_false(h.read_drive(details.task_id, "main").enabled)
        end)
        test.it("declares the same tool in the public manager trait used by MCP", function()
            local trait = registry.get("kickside.automation.traits:manager")
            local found = false
            for _, id in ipairs(trait.data.tools) do if id == TOOL then found = true end end
            test.is_true(found)
            local entry = registry.get(TOOL)
            test.eq(entry.meta.type, "tool")
            test.not_nil(select(1, json.decode(entry.meta.input_schema)))
        end)
        test.it("lowers workflow and agent targets to their owning declared endpoints", function()
            local ref = { kind = "flow", id = "published-flow", version = 3 }
            local workflow, err = recurring.target({ kind = "workflow", flow_ref = ref, input = { label = "hello" } })
            test.is_nil(err, tostring(err))
            test.eq(workflow.port, "kickside.automation.recurring.fixture:workflow_action")
            test.eq(workflow.config.flow_ref.version, 3)
            test.eq(workflow.input.label, "hello")
            local agent = recurring.target({ kind = "agent", agent_id = "my-agent", prompt = "Check daily" })
            test.eq(agent.port, "kickside.automation.recurring.fixture:agent_action")
            test.eq(agent.input.content, "Check daily")
            test.eq(agent.config.agent_id, "my-agent")
            test.is_nil(select(1, recurring.target({ kind = "workflow", flow_ref = { id = "draft" } })))
            test.is_nil(select(1, recurring.target({ kind = "agent", agent_id = "my-agent", prompt = "" })))
        end)
        test.it("runs at least two scheduled ticks through Jobs under the creator's live identity", function()
            local id = create({ action = "create", title = "Live recurring", schedule = { type = "interval", expression = "2s" },
                target = { kind = "action", port = PORT, input = { text = "scheduled tick" } } })
            grant(id, 3)
            local edited, edit_err = call({ action = "update", id = id,
                target = { kind = "action", port = PORT, input = { text = "shared scheduled tick" } } }, other)
            test.is_nil(edit_err, tostring(edit_err))
            test.not_nil(edited)
            local listener = h.listen_round(id, "main")
            local job_id = h.read_drive(id, "main").job_id
            local probe_key = h.probe_key_for(job_id)
            worker = h.start_worker()
            for _ = 1, 2 do
                local got = channel.select({ listener.signal:case_receive(), time.after(60 * time.SECOND):case_receive() })
                test.eq(got.channel, listener.signal, "scheduled task did not deliver: " .. json.encode(h.read_drive(id, "main")))
            end
            h.await_worker_pass(probe_key, job_id)
            h.close_round(listener)
            h.stop_worker(worker)
            worker = nil
            local rows = h.query("SELECT actor_id,identity_key,body FROM recurring_fixture_log WHERE owner_id=$1", { id })
            test.is_true(#rows >= 2)
            test.is_true(rows[1].identity_key ~= rows[2].identity_key)
            for _, row in ipairs(rows) do test.eq(row.actor_id, env.owner) end
            local result, err = call({ action = "get", id = id })
            test.is_nil(err, tostring(err))
            test.not_nil(result.task.last_run_at)
            test.not_nil(result.task.next_run_at)
            test.is_nil(result.task.last_error)
        end)
        test.it("records terminal destination failures and exposes their reason", function()
            local id = create({ action = "create", schedule = { type = "interval", expression = "1h" },
                target = { kind = "action", port = PORT, input = { fail = true } } })
            local armed, arm_err = env.run(id, "main")
            test.is_nil(arm_err, tostring(arm_err))
            test.not_nil(armed)
            h.set_drive(id, "main", "next_run_at=$1", { h.PAST })
            local result, run_err = env.run(id, "main")
            test.is_nil(run_err, tostring(run_err))
            test.not_nil(result)
            grant(id, component.ACCESS.READ)
            local status, err = call({ action = "get", id = id }, other)
            test.is_nil(err, tostring(err))
            test.eq(status.task.failed_runs, 1)
            test.contains(status.task.last_error.message, "recurring fixture failed")
            test.not_nil(status.task.last_run_at)
            test.not_nil(status.task.next_run_at)
        end)
    end)
end) }
