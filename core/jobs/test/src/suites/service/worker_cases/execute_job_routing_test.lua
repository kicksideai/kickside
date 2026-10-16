-- Worker dispatch + finalize decision logic. The process main loop (messages,
-- exact deadlines, cancel via channel.select) is process-bound and covered at
-- integration when the worker.service boots; here the isolatable path is tested
-- directly via the exported execute_job (type -> executor routing) and
-- process_job (claim -> run history -> lease heartbeat -> execute -> finalize),
-- driven through the already-tested claim/lifecycle libs.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local security = require("security")
local time = require("time")
local channel = require("channel")
local process = require("process")
local job_types = require("job_types")
local cfg = require("config")
local claim = require("claim")
local lifecycle = require("lifecycle")
local lease_status = require("lease_status")
local job_fixture = require("job_fixture")
local worker = require("worker")
local worker_pool = require("worker_pool")
local dispatch = require("worker_dispatch")
local worker_fence = require("worker_fence")
local worker_child = require("worker_child")
local proc_supervisor = require("proc_supervisor")
local jobs = require("jobs")
local worker_heartbeat = require("worker_heartbeat")

local active_db
local function release_db() if active_db then active_db:release(); active_db = nil end end
local function get_db() local db, err = sql.get("app:db"); active_db = db; return db, err end
local function with_db(fn)
    local db, err = get_db()
    if err or not db then error("jobs test: db connect failed: " .. tostring(err)) end
    fn(db)
end

local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    sql.builder.insert("kickside_thread"):set_map({ id = id, thread_class = "test", component_id = id }):run_with(db):exec()
    return id
end

-- Enqueue a job parked and lease exactly that row. Claim selection has its own
-- suite on a private queue; these cases never claim from the shared queue.
local function enqueue_and_claim(db: sql.DB, dbtype: string, thread_id: string, job_type: string, opts: table?): table
    local params = { thread_id = thread_id, job_type = job_type }
    for key, value in pairs(opts or {}) do params[key] = value end
    local job, lease_err = job_fixture.enqueue_leased(db, dbtype, params)
    if lease_err or not job then error("own job lease failed: " .. tostring(lease_err)) end
    return job
end

local function job_row(db: sql.DB, id): table?
    local rows = sql.builder.select("status", "lease_token", "attempts", "scheduled_at", "wake_enabled")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function latest_run(db: sql.DB, job_id): table?
    local rows = sql.builder.select("status", "attempt_no", "error_text", "result_json")
        :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
        :order_by("attempt_no DESC"):limit(1):run_with(db):query()
    return rows and rows[1] or nil
end

local SLEEP_PROC = "proc://app:job_sleep_proc"

local function enqueue_proc_and_claim(db: sql.DB, dbtype: string, thread_id: string, payload: any): table
    return enqueue_and_claim(db, dbtype, thread_id, "upload.process.test", {
        worker_ref = SLEEP_PROC,
        priority = 10000,
        max_attempts = 3,
        payload = payload,
    })
end

local function thread_events_for(db: sql.DB, thread_id: string, event_type: string): { table }
    return sql.builder.select("type", "body", "trace_id", "run_id", "correlation_key")
        :from("kickside_event")
        :where(sql.builder.eq({ thread_id = thread_id, type = event_type }))
        :run_with(db):query() or {}
end

local function define_tests()
    test.describe("jobs.worker execute_job routing", function()
        test.after_each(release_db)
        test.it("completes a function in its supervised execution child", function()
            local db, db_err = get_db()
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local thread_id = make_thread(db)
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_test" },
                parked = true,
                thread_id = thread_id,
                job_type = "test.function.child.success",
                worker_ref = "func://app:generic_job_target",
                priority = 10000,
                payload = { sleep_ms = 20, max_execution_ms = 1000 },
            })
            test.is_nil(enqueue_err)
            local job, lease_err = job_fixture.lease_own(db, dbtype, id)
            if not job then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            test.eq(job.id, id)
            release_db()

            local child_err = worker_child.supervise_job_child(job)
            test.is_nil(child_err)
            local verify_db, verify_err = get_db()
            test.is_nil(verify_err)
            test.eq(job_row(verify_db, id).status, job_types.JOB_STATE.DONE)
            test.eq(latest_run(verify_db, id).status, "completed")
            release_db()
        end)

        test.it("refreshes four durable worker rows during a simulated ten-minute job", function()
            local db, db_err = get_db()
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local count = dbtype == sql.type.POSTGRES and 4 or 1
            local old = lifecycle.format_time(dbtype, time.now():add(-600 * time.SECOND))
            local current_job_ids = {}
            local worker_ids = {}
            local child_pids = {}
            for i = 1, count do
                local worker_id = "long-job-worker-" .. uuid.v7()
                local job_id = uuid.v7()
                worker_ids[i] = worker_id
                current_job_ids[i] = job_id
                local _, insert_err = sql.builder.insert("kickside_job_worker")
                    :set_map({ id = worker_id, registry_version = "simulated-v1",
                        current_job_id = job_id, last_seen_at = old })
                    :run_with(db):exec()
                test.is_nil(insert_err)
                local _, pulse_err = sql.builder.insert("kickside_job_worker_pulse")
                    :set_map({ worker_id = worker_id, registry_version = "simulated-v1", last_seen_at = old })
                    :run_with(db):exec()
                test.is_nil(pulse_err)
                local pid, start_err = worker_heartbeat.start(worker_id, "simulated-v1", "100ms")
                test.is_nil(start_err)
                child_pids[i] = pid
            end
            for _, worker_id in ipairs(worker_ids) do
                local _, stale_err = sql.builder.update("kickside_job_worker_pulse")
                    :set("last_seen_at", old)
                    :where(sql.builder.eq({ worker_id = worker_id }))
                    :run_with(db):exec()
                test.is_nil(stale_err)
            end
            -- A supervised long-running job supplies a real completion signal;
            -- the independent heartbeat loops must refresh during that work.
            local thread_id = make_thread(db)
            local work_id, work_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_test" },
                parked = true, thread_id = thread_id, job_type = "test.heartbeat.work",
                worker_ref = "proc://app:job_sleep_proc", payload = { sleep_ms = 1500 },
            })
            test.is_nil(work_err)
            local work, lease_err = job_fixture.lease_own(db, dbtype, work_id)
            if not work then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            release_db()
            local child_err = worker_child.supervise_job_child(work)
            test.is_nil(child_err)
            db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local cutoff = lifecycle.format_time(dbtype, time.now():add(-2 * time.SECOND))
            for i, worker_id in ipairs(worker_ids) do
                local rows = db:query([[SELECT p.last_seen_at,w.current_job_id
                    FROM kickside_job_worker w JOIN kickside_job_worker_pulse p ON p.worker_id=w.id
                    WHERE w.id=$1]], { worker_id })
                test.eq(#rows, 1)
                test.is_true(tostring(rows[1].last_seen_at) > cutoff)
                test.eq(rows[1].current_job_id, current_job_ids[i])
            end
            for _, pid in ipairs(child_pids) do test.is_nil(worker_heartbeat.stop(pid)) end
            release_db()
        end)

        test.it("reports durable worker heartbeats and overdue jobs", function()
            test.not_nil(jobs.health)
            local db, db_err = get_db()
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local worker_id = "test-worker-" .. uuid.v7()
            test.is_nil(worker_heartbeat.mark(db, dbtype, worker_id, "test-version"))
            release_db()
            local health, health_err = jobs.health()
            test.is_nil(health_err)
            local found = false
            for _, row in ipairs(health.workers or {}) do
                if row.id == worker_id then
                    found = true
                    test.is_true(row.healthy)
                    test.eq(row.registry_version, "test-version")
                end
            end
            test.is_true(found)
        end)

        test.it("reports claimable work due past the overdue grace as unhealthy", function()
            local db, db_err = get_db()
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "health_due" }, thread_id = uuid.v7(),
                job_type = "test.health_due", scheduled_at = "2000-01-01T00:00:00Z",
            })
            test.is_nil(enqueue_err)
            release_db()
            local health, health_err = jobs.health()
            test.is_nil(health_err)
            test.is_false(health.healthy)
            test.is_true(health.overdue_unclaimed_count >= 1)
            test.is_true(health.due_unclaimed_count >= health.overdue_unclaimed_count)
            local policy = cfg.policy()
            test.is_true(health.due_unclaimed_oldest_age_ms > (policy :: any).health_overdue_grace_ms)
            local reported = false
            for _, issue in ipairs(health.issues) do
                if issue.code == "due_work_unclaimed" then
                    reported = true
                    test.eq(issue.count, health.overdue_unclaimed_count)
                    test.eq(issue.oldest_age_ms, health.due_unclaimed_oldest_age_ms)
                end
            end
            test.is_true(reported)
            local _, cancel_err = jobs.cancel(id :: string)
            test.is_nil(cancel_err)
        end)

        test.it("recycles a loop on the direct OUTDATED process event", function()
            local events = channel.new(1)
            events:send({ kind = process.event.OUTDATED })
            local signal = proc_supervisor.wait_once(events,
                time.now():add(60 * time.SECOND), "child-1")
            test.eq(signal.kind, "outdated")
        end)

        test.it("replaces a recycled loop at once and paces a loop that cannot start", function()
            local delay_ns = (job_types.LOOP_RESPAWN_DELAY_MS :: number) * 1e6
            test.eq(worker_pool.respawn_after_ns(delay_ns * 3, delay_ns), 0)
            test.eq(worker_pool.respawn_after_ns(delay_ns, delay_ns), 0)
            test.eq(worker_pool.respawn_after_ns(delay_ns / 4, delay_ns), delay_ns * 3 / 4)
            test.eq(worker_pool.respawn_after_ns(0, delay_ns), delay_ns)
        end)

        test.it("distributes policy tier shares across one or four free slots", function()
            for _, slots in ipairs({ 1, 4 }) do
                local step = 0
                local totals = { live = 0, backfill = 0, maintenance = 0 }
                for _ = 1, 20 / slots do
                    local shares, next_step = cfg.distribute_shares(slots,
                        { live = 6, backfill = 2, maintenance = 2 }, step)
                    step = next_step
                    for tier in pairs(totals) do totals[tier] = totals[tier] + shares[tier] end
                end
                test.eq(totals.live, 12)
                test.eq(totals.backfill, 4)
                test.eq(totals.maintenance, 4)
            end
        end)

        test.it("surfaces a failed size read and converges after recovery and policy changes", function()
            local available = false
            local configured = 4
            local db = { type = function() return sql.type.POSTGRES, nil end,
                release = function() end }
            local sized = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function()
                    if not available then return nil, "database unavailable" end
                    return db, nil
                end,
                policy = function()
                    return job_fixture.pool_policy({ worker_count_postgres = configured,
                        worker_count_sqlite = 1, worker_awaited_slots = 1 }), nil
                end,
            })
            local missing, read_err = sized.detect_size()
            test.is_nil(missing)
            test.not_nil(read_err)
            available = true
            -- The pool size is the general slots plus the awaited slots.
            local size, recovered_err = sized.detect_size()
            test.is_nil(recovered_err)
            test.eq(size, 5)
            test.eq(table.concat(worker_pool.resize_slots(0, size), ","), "1,2,3,4,5")
            configured = 2
            local changed, change_err = sized.detect_size()
            test.is_nil(change_err)
            test.eq(changed, 3)
            test.eq(table.concat(worker_pool.resize_slots(5, changed), ","), "5,4")
        end)

        test.it("reads pool policy at start and on registry change, with no healthy timer", function()
            local reads, spawns, cancels, selections, drained = 0, 0, 0, 0, 0
            local configured = 2
            local event_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local drain_ch = { case_receive = function(self) return self end }
            local subscription = { channel = function() return registry_ch end, close = function() end }
            local fake_process = {
                registry = job_fixture.process_registry("pool-test"),
                    event = process.event, pid = function() return "pool-test" end,
                events = function() return event_ch end, set_options = function() end,
                 listen = function() return { case_receive = function(self) return self end } end,
                 unlisten = function() end,
                spawn_linked_monitored = function()
                    spawns = spawns + 1
                    return "child-" .. tostring(spawns), nil
                end,
                cancel = function() cancels = cancels + 1 end,
            }
            local fake_time = { now = function() return { unix_nano = function() return 0 end } end,
                after = function(duration)
                    test.eq(duration, job_types.LOOP_CANCEL_GRACE, "only the drain deadline arms a timer")
                    return drain_ch
                end }
            local fake_channel = { select = function(cases)
                if cases.default == true then return { default = true } end
                if #cases == 3 then
                    drained = drained + 1
                    return { channel = event_ch, value = { kind = process.event.EXIT,
                        from = "child-" .. tostring(drained) } }
                end
                selections = selections + 1
                test.eq(#cases, 4)
                if selections == 1 then
                    test.eq(reads, 1)
                    return { channel = event_ch, value = { kind = process.event.EXIT, from = "other" } }
                end
                if selections == 2 then
                    test.eq(reads, 1)
                    configured = 1
                    return { channel = registry_ch, value = { kind = "registry.commit" }, ok = true }
                end
                test.eq(reads, 2)
                return { channel = event_ch, value = { kind = process.event.CANCEL } }
            end }
            local sized = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return { type = function() return sql.type.POSTGRES end,
                    query = function() return {}, nil end, release = function() end } end,
                reclaim = {
                    reclaim_expired = function() return 0, nil end,
                    reclaim_terminated = function() return 0, nil end,
                    close_lost_runs = function() return 0, nil end,
                },
                claim = {
                    due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
                    claim_batch = function() return {}, nil end,
                    release_unstarted = function() return false, nil end,
                },
                policy = function()
                    reads = reads + 1
                    return job_fixture.pool_policy({ worker_count_postgres = configured,
                        worker_count_sqlite = 1, worker_awaited_slots = 1 }), nil
                end,
                process = fake_process, time = fake_time, channel = fake_channel,
                events = { subscribe = function(system, kind)
                    test.eq(system, "registry")
                    test.eq(kind, "registry.commit")
                    return subscription
                end },
            })
            sized.main()
            test.eq(reads, 2)
            test.eq(selections, 3)
            test.eq(spawns, 3, "two general slots and one awaited slot")
            test.eq(drained, 3)
            test.eq(cancels, 3, "one slot retired by the resize, two drained on cancel")
        end)

        test.it("retries failed pool detection at supervisor delay then stops timing", function()
            local reads, selections, now_ns = 0, 0, 0
            local delay_ns = (job_types.LOOP_RESPAWN_DELAY_MS :: number) * 1e6
            local event_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local fake_time = {
                now = function() return { unix_nano = function() return now_ns end } end,
                after = function(duration)
                    if duration == job_types.LOOP_CANCEL_GRACE then return timer_ch end
                    test.eq(duration, tostring(job_types.LOOP_RESPAWN_DELAY_MS) .. "ms")
                    return timer_ch
                end,
            }
            local fake_channel = { select = function(cases)
                if cases.default == true then return { default = true } end
                if #cases == 3 then
                    return { channel = event_ch, value = { kind = process.event.EXIT, from = "child-1" } }
                end
                selections = selections + 1
                if selections == 1 then
                    test.eq(#cases, 5)
                    now_ns = delay_ns
                    return { channel = timer_ch }
                end
                test.eq(#cases, 4)
                return { channel = event_ch, value = { kind = process.event.CANCEL } }
            end }
            local sized = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return { type = function() return sql.type.POSTGRES end,
                    query = function() return {}, nil end,
                    release = function() end } end,
                reclaim = {
                    reclaim_expired = function() return 0, nil end,
                    reclaim_terminated = function() return 0, nil end,
                    close_lost_runs = function() return 0, nil end,
                },
                claim = {
                    due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
                    claim_batch = function() return {}, nil end,
                },
                policy = function()
                    reads = reads + 1
                    if reads == 1 then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "transient" }) end
                    return job_fixture.pool_policy({ worker_count_postgres = 1,
                        worker_count_sqlite = 1 }), nil
                end,
                process = { registry = job_fixture.process_registry("pool-retry"),
                    event = process.event, pid = function() return "pool-retry" end,
                    events = function() return event_ch end, set_options = function() end,
                 listen = function() return { case_receive = function(self) return self end } end,
                 unlisten = function() end,
                    spawn_linked_monitored = function() return "child-1" end,
                    cancel = function() end },
                time = fake_time, channel = fake_channel,
                events = { subscribe = function() return {
                    channel = function() return registry_ch end, close = function() end,
                } end },
            })
            sized.main()
            test.eq(reads, 2)
            test.eq(selections, 2)
        end)

        test.it("detects a heartbeat process exit for loop recycling", function()
            test.not_nil(worker.heartbeat_exited)
            local pid = "hb-" .. uuid.v7()
            test.is_true(worker.heartbeat_exited({ kind = process.event.EXIT, from = pid }, pid))
            test.is_false(worker.heartbeat_exited({ kind = process.event.EXIT, from = pid }, "other-" .. uuid.v7()))
            test.is_false(worker.heartbeat_exited({ kind = process.event.EXIT, from = pid }, nil))
            test.is_false(worker.heartbeat_exited({ kind = process.event.LINK_DOWN, from = pid }, pid))
            test.is_false(worker.heartbeat_exited("nope", pid))
        end)

        test.it("detects the exit of its dispatcher so a slot never outlives its pool", function()
            test.not_nil(worker.dispatcher_exited)
            local pool = "pool-" .. uuid.v7()
            test.is_true(worker.dispatcher_exited({ kind = process.event.LINK_DOWN, from = pool }, pool))
            test.is_true(worker.dispatcher_exited({ kind = process.event.EXIT, from = pool }, pool))
            test.is_false(worker.dispatcher_exited({ kind = process.event.LINK_DOWN, from = "other-" .. uuid.v7() }, pool))
            test.is_false(worker.dispatcher_exited({ kind = process.event.CANCEL, from = pool }, pool))
            test.is_false(worker.dispatcher_exited({ kind = process.event.LINK_DOWN, from = pool }, nil))
            test.is_false(worker.dispatcher_exited("nope", pool))
        end)

        test.it("keeps a claimed job in the worker marker", function()
            local db, raw_dbtype, queue_err = job_fixture.private_queue("app:private_queue_execute_job_routing_test")
            if not db or not raw_dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            local dbtype = raw_dbtype :: string
            local worker_id = "test-clear-" .. uuid.v7()
            test.is_nil(worker_heartbeat.mark(db, dbtype, worker_id, "test-version"))
            local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = worker_id },
                job_identity = { namespace = "test", scope = worker_id, key = "heartbeat-marker" },
                job_type = "test.heartbeat.marker",
                scheduled_at = lifecycle.now_string(dbtype),
            })
            test.is_nil(enqueue_err)
            local claimed, claim_err = claim.claim_batch(db, dbtype, 1, nil,
                { live = 1, backfill = 0, maintenance = 0 }, worker_id)
            test.is_nil(claim_err)
            test.eq(#(claimed or {}), 1)
            test.eq((claimed :: table[])[1].id, job_id)
            local rows = sql.builder.select("current_job_id"):from("kickside_job_worker")
                :where(sql.builder.eq({ id = worker_id })):run_with(db):query()
            test.eq(tostring(rows[1].current_job_id), job_id)
            db:release()
        end)

        test.it("skips an unknown job_type instead of failing", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local out, err = dispatch.execute_job(db, dbtype, { id = uuid.v7(), job_type = "no.such.type" })
                test.is_nil(err)
                test.not_nil(out)
                test.is_true(out.skipped)
                test.eq(out.reason, "unknown_job_type")
                test.eq(out.job_type, "no.such.type")
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

-- This process supervises job children directly, standing in for the loop.
local function run(options)
    local trap_err = job_fixture.supervise_as_loop()
    if trap_err then error(trap_err) end
    return run_cases(options)
end

return { run = run }
