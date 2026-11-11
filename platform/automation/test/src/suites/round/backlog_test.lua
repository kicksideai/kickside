-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local time = require("time")
local channel = require("channel")
local process = require("process")
local uuid = require("uuid")
local registry = require("registry")
local json = require("json")
local jobs = require("jobs")
local slot = require("slot")
local config = require("jobs_config")
local h = require("round_harness")

type Map = { [string]: any }

return { run = test.run_cases(function()
    test.describe("automation rounds behind long jobs", function()
        local worker: string? = nil
        local listener: Map? = nil
        local started: any = nil
        local scope = ""
        local original: any = nil
        test.before_all(function()
            h.await_migrations()
            original = assert(registry.get("kickside.automation:round"))
            local instrumented = config.copy(original)
            local entry = assert(registry.get("kickside.automation:round_backlog_entry"))
            instrumented.data.source = entry.data.source
            instrumented.data.modules = entry.data.modules
            instrumented.data.imports = entry.data.imports
            local changes = assert(registry.snapshot()):changes()
            changes:update(instrumented)
            assert(changes:apply())
        end)
        test.after_all(function()
            if original then
                local changes = assert(registry.snapshot()):changes()
                changes:update(original)
                assert(changes:apply())
            end
        end)
        test.after_each(function()
            h.exec("UPDATE kickside_job SET status='cancelled', scheduled_at=NULL WHERE owner_kind='test' AND owner_id=$1 AND status='pending'", { scope })
            if worker then h.stop_worker(worker); worker = nil end
            if listener then h.close_round(listener); listener = nil end
            if started then process.unlisten(started); started = nil end
        end)
        for _, backlog in ipairs({0, 10, 100}) do
            test.it("starts a round promptly with " .. tostring(backlog) .. " long jobs queued", function()
                local env = h.setup("round_backlog")
                scope = uuid.v7()
                local topic = "round.backlog." .. scope
                started = process.listen(topic, { message = true })
                local db = h.db()
                local engine = tostring(db:type())
                db:release()
                local policy, policy_err = config.policy()
                test.is_nil(policy_err, tostring(policy_err))
                local general = engine == "sqlite" and policy.worker_count_sqlite or 1
                local total = backlog > 0 and backlog + general or 0
                for index = 1, total do
                    local queued, err = jobs.enqueue({ namespace = "round-backlog", scope = scope,
                        key = tostring(index), job_type = "kickside.automation:round_backlog_job",
                        owner_locator = { kind = "test", id = scope },
                        immutable_payload = { reply_pid = tostring(process.pid()), reply_topic = topic } })
                    test.is_nil(err, tostring(err))
                    test.not_nil(queued)
                end
                worker = h.start_worker()
                for _ = 1, total > 0 and general or 0 do
                    local got = channel.select({ started:case_receive(), time.after("10s"):case_receive() })
                    test.eq(got.channel, started, "general workers start long jobs before the round is enqueued")
                end
                h.new_drive({ automation_id = env.automation_id, drive_key = "backlog", source_kind = "event",
                    source_thread_id = env.thread_id,
                    action = { source_ref = "fixture:backlog", event_type = h.EVENT_TYPE } })
                listener = h.listen_round(env.automation_id, "backlog")
                env.append("backlog")
                local enqueued_at = time.now():unix_nano()
                local job_id, enqueue_err = slot.enqueue(env.automation_id, "backlog")
                test.is_nil(enqueue_err, tostring(enqueue_err))
                test.is_nil(slot.record(env.automation_id, "backlog", job_id :: string))
                h.receive_logged(listener :: Map, "70s")
                local entries = h.query("SELECT detail_json FROM round_fixture_log WHERE automation_id=$1"
                    .. " AND drive_key='backlog' AND item_key='worker-entry' ORDER BY id", { env.automation_id })
                test.is_true(#entries > 0, "round worker records its execution entry")
                local began, parse_err = json.decode(entries[1].detail_json)
                test.is_nil(parse_err, tostring(parse_err))
                local start_ms = (assert(tonumber(began.entered_at)) - enqueued_at) / 1000000
                h.exec("INSERT INTO round_fixture_log (automation_id, drive_key, item_key, attempts, detail_json)"
                    .. " VALUES ($1, 'backlog', 'start-timing', 0, $2)",
                    { env.automation_id, h.encoded({ queued = backlog, start_ms = start_ms }) })
                test.is_true(start_ms < 1000, "round waits " .. tostring(start_ms) .. "ms behind " .. tostring(backlog) .. " long jobs")
                if total > 0 then
                    local deadline = time.after("10s")
                    while true do
                        local done = h.query("SELECT COUNT(*) AS n FROM kickside_job WHERE owner_kind='test' AND owner_id=$1 AND status='done'", { scope })
                        if tonumber(done[1].n) >= general + 1 then break end
                        local got = channel.select({ deadline:case_receive(), time.after("10ms"):case_receive() })
                        test.is_true(got.channel ~= deadline, "long jobs continue beyond the initially occupied workers")
                    end
                end
            end)
        end
        test.it("completes general jobs while rounds keep arriving", function()
            local env = h.setup("round_arrivals")
            scope = uuid.v7()
            local topic = "round.arrivals." .. scope
            started = process.listen(topic, { message = true })
            local ids: { string } = {}
            for index = 1, 8 do
                local key = "arrival-" .. tostring(index)
                h.new_drive({ automation_id = env.automation_id, drive_key = key, source_kind = "event",
                    source_thread_id = env.thread_id,
                    action = { source_ref = "fixture:arrivals", event_type = h.EVENT_TYPE } })
                local id, err = slot.enqueue(env.automation_id, key)
                test.is_nil(err, tostring(err))
                test.is_nil(slot.record(env.automation_id, key, id :: string))
                ids[#ids + 1] = id :: string
                local queued, queue_err = jobs.enqueue({ namespace = "round-arrivals", scope = scope,
                    key = tostring(index), job_type = "kickside.automation:round_backlog_job",
                    owner_locator = { kind = "test", id = scope },
                    immutable_payload = { reply_pid = tostring(process.pid()), reply_topic = topic } })
                test.is_nil(queue_err, tostring(queue_err))
                test.not_nil(queued)
            end
            env.append("initial arrival")
            worker = h.start_worker()
            local deadline = time.after("10s")
            local arrivals: number = 0
            local rounds_during_progress: number = 0
            while true do
                env.append("arrival " .. tostring(arrivals))
                for _, id in ipairs(ids) do
                    local _, err = jobs.wake_job(id)
                    test.is_nil(err, tostring(err))
                end
                arrivals = arrivals + 1
                local done = h.query("SELECT COUNT(*) AS n FROM kickside_job WHERE owner_kind='test' AND owner_id=$1 AND status='done'", { scope })
                local entries = h.query("SELECT COUNT(*) AS n FROM round_fixture_log WHERE automation_id=$1 AND item_key='worker-entry'", { env.automation_id })
                if tonumber(done[1].n) > 0 then rounds_during_progress = tonumber(entries[1].n) :: number end
                if tonumber(done[1].n) == 8 then break end
                local got = channel.select({ deadline:case_receive(), time.after("10ms"):case_receive() })
                test.is_true(got.channel ~= deadline, "general jobs finish during sustained round arrivals")
            end
            test.is_true(arrivals > 1, "arrivals continue after the initial round backlog")
            test.is_true(rounds_during_progress > #ids, "rounds keep executing while general jobs complete")
            for _, id in ipairs(ids) do
                h.exec("UPDATE kickside_job SET scheduled_at=NULL WHERE id=$1 AND status='pending'", {id})
            end
        end)
    end)
end) }
