-- Wake-to-claim (design v5 §4.1, §15.1): an installed event drive's slot,
-- woken by an append to its source thread, is claimed by the live jobs worker
-- within the steady wake-to-claim bound (2 s) and delivers the event. Runs on
-- SQLite and PostgreSQL.

local test = require("test")
local json = require("json")
local time = require("time")
local registry = require("registry")
local h = require("round_harness")

type Map = { [string]: any }

local MANAGE_TOOL = "kickside.automation.agent:automations_manage"
local BOUND_MS = 2000

local function claim_elapsed_ms(run: Map, job_id: string, before_seq: number, started_ns: number): number
    test.eq(run.job_id, job_id, "fixture observed the claimed drive slot")
    test.is_true(tonumber(run.execution_seq) > before_seq, "fixture observed a later execution")
    local raw = tostring(run.started_at)
    -- SQLite stores UTC without a zone suffix; parse it explicitly as UTC so
    -- a local runner timezone does not shift the measured claim by hours.
    if not string.find(raw, "T", 1, true) then raw = raw:gsub(" ", "T", 1) .. "Z" end
    local claimed, parse_err = time.parse(time.RFC3339, raw)
    test.is_nil(parse_err)
    test.not_nil(claimed)
    return ((claimed :: any):unix_nano() - started_ns) / 1e6
end

local function queue_state(job_id: string): string
    local job = h.query("SELECT status, scheduled_at, wake_enabled, attempts, last_error FROM kickside_job WHERE id = $1", { job_id })
    local by_status = h.query("SELECT status, queue_tier, COUNT(*) AS n FROM kickside_job GROUP BY status, queue_tier", {})
    local running = h.query("SELECT id, job_type, heartbeat_at, lease_until FROM kickside_job WHERE status = 'running'", {})
    local workers = h.query("SELECT * FROM kickside_job_worker", {})
    return json.encode({ job = job, by_status = by_status, running = running, workers = workers })
end

local function assert_parked(job_id: string): ()
    local row = h.query("SELECT status, scheduled_at, wake_enabled FROM kickside_job WHERE id=$1", { job_id })[1]
    test.not_nil(row, "drive slot exists")
    test.eq(row.status, "pending", "drive slot is pending for its next wake")
    test.is_nil(row.scheduled_at, "drive slot is parked before the measured append")
    test.is_true(row.wake_enabled == true or row.wake_enabled == 1, "drive slot accepts wake demand")
end

local function define_tests()
    test.describe("automation wake to claim", function()
        local env: Map = {}
        local live_worker: string? = nil
        local listeners: { Map } = {}
        local bump_id: string? = nil

        local function listen(automation_id: string, drive_key: string): Map
            local listener = h.listen_round(automation_id, drive_key)
            listeners[#listeners + 1] = listener
            return listener
        end

        local function close(listener: Map): ()
            h.close_round(listener)
            for index, tracked in ipairs(listeners) do
                if tracked == listener then table.remove(listeners, index); return end
            end
        end

        test.after_each(function()
            if live_worker then h.stop_worker(live_worker); live_worker = nil end
            for _, listener in ipairs(listeners) do h.close_round(listener) end
            listeners = {}
            if bump_id then
                local snapshot, snapshot_err = registry.snapshot()
                test.is_nil(snapshot_err)
                local cleanup = snapshot:changes()
                cleanup:delete(bump_id)
                local _, cleanup_err = cleanup:apply()
                test.is_nil(cleanup_err)
                bump_id = nil
            end
        end)

        test.before_all(function()
            h.await_migrations()
            env = h.setup("round_wake")
        end)

        test.it("claims a woken event drive's slot within the wake-to-claim bound and delivers the event", function()
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "all" } })
            test.is_true(installed.success, tostring(installed.error))
            local main = h.read_drive(installed.id, "main")
            local probe_key = h.probe_key_for(main.job_id)
            live_worker = h.start_worker()
            h.await_worker_pass(probe_key, main.job_id)
            assert_parked(main.job_id)
            -- Give the first round a test-consumer effect to await. Empty-round
            -- parking is asserted separately in round_test.
            local first_delivery = listen(installed.id, "main")
            env.append("initial")
            local first_event = h.receive_logged(first_delivery, "15s",
                function() return queue_state(main.job_id) end)
            h.await_worker_pass(probe_key, main.job_id)
            close(first_delivery)
            assert_parked(main.job_id)
            test.is_true(h.read_drive(installed.id, "main").round_seq >= 1,
                "initial round did not complete: " .. queue_state(main.job_id))
            test.is_true(h.read_drive(installed.id, "main").event_seq > 0,
                "initial event cursor did not commit")
            local function execution_seq(): integer
                local row = h.query("SELECT execution_seq FROM kickside_job WHERE id = $1", { main.job_id })[1]
                return math.floor(tonumber(row and row.execution_seq) or 0)
            end
            local before = execution_seq()
            local before_cursor = h.read_drive(installed.id, "main").event_seq
            local delivered = listen(installed.id, "main")
            local started = time.now():unix_nano()
            env.append("woken")
            local next_event = h.receive_logged(delivered, "5s",
                function() return queue_state(main.job_id) end)
            test.is_true(next_event.item_key ~= first_event.item_key)
            h.await_worker_pass(probe_key)
            local claimed_ms = claim_elapsed_ms(next_event, main.job_id, before, started)
            test.is_true(execution_seq() >= tonumber(next_event.execution_seq), "the woken claim did not complete")
            test.is_true(h.read_drive(installed.id, "main").event_seq > before_cursor,
                "the woken event cursor did not commit")
            test.is_true(claimed_ms <= BOUND_MS,
                "claimed after " .. tostring(claimed_ms) .. " ms: " .. queue_state(main.job_id))
            test.is_true(#h.log_rows(installed.id, "main") >= 1,
                "the claimed round delivered the event: " .. queue_state(main.job_id))
        end)

        -- A hub install or update changes the registry while automations run:
        -- the jobs worker recycles its loop on the new version and keeps claiming.
        test.it("keeps claiming woken slots after an unrelated registry change", function()
            local env = h.setup("round_wake_restart")
            local installed = env.caller:call(MANAGE_TOOL, { action = "install", type = "kickside.automation.round.fixture:event_kind",
                input = { thread_id = env.thread_id, start = "all" } })
            test.is_true(installed.success, tostring(installed.error))
            local main = h.read_drive(installed.id, "main")
            local probe_key = h.probe_key_for(main.job_id)
            live_worker = h.start_worker()
            h.await_worker_pass(probe_key, main.job_id)
            assert_parked(main.job_id)
            local first_delivery = listen(installed.id, "main")
            env.append("initial after install")
            local first_event = h.receive_logged(first_delivery, "15s",
                function() return queue_state(main.job_id) end)
            h.await_worker_pass(probe_key, main.job_id)
            close(first_delivery)
            assert_parked(main.job_id)
            test.is_true(h.read_drive(installed.id, "main").round_seq >= 1,
                "initial round did not complete: " .. queue_state(main.job_id))
            test.is_true(h.read_drive(installed.id, "main").event_seq > 0,
                "initial event cursor did not commit")
            local candidate_bump_id = "kickside.automation.round.fixture:registry_bump_" .. tostring(time.now():unix_nano())
            local snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            local changes = snapshot:changes()
            changes:create({ id = candidate_bump_id, kind = "registry.entry", meta = { comment = "Unrelated registry change." }, data = {} })
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            bump_id = candidate_bump_id

            local before = math.floor(tonumber(h.query("SELECT execution_seq FROM kickside_job WHERE id = $1", { main.job_id })[1].execution_seq) or 0)
            local before_cursor = h.read_drive(installed.id, "main").event_seq
            local delivered = listen(installed.id, "main")
            env.append("after registry change")
            local next_event = h.receive_logged(delivered, "15s",
                function() return queue_state(main.job_id) end)
            test.is_true(next_event.item_key ~= first_event.item_key)
            test.is_true(tonumber(next_event.execution_seq) > before,
                "the post-change event was delivered by a later claim")
            h.await_worker_pass(probe_key)
            test.is_true(h.read_drive(installed.id, "main").event_seq > before_cursor,
                "the post-change event cursor did not commit")
            test.is_true(tonumber(h.query("SELECT execution_seq FROM kickside_job WHERE id=$1", { main.job_id })[1].execution_seq)
                >= tonumber(next_event.execution_seq),
                "never claimed within 15 s after the registry change: " .. queue_state(main.job_id))
        end)
    end)
end

return test.run_cases(define_tests)
