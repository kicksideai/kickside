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
    test.describe("jobs.worker child termination", function()
        test.it("finalizes a proc timeout inside its execution child", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local job = enqueue_proc_and_claim(db, dbtype, make_thread(db), { block = true, max_execution_ms = 250 })
            db:release()

            -- The execution child owns and reaps its proc target; the test only
            -- monitors the child, as the loop's supervisor would.
            local events = process.events()
            local child_pid, spawn_err = process.spawn_monitored(
                "kickside.core.jobs.service:job_child", "app:processes", { job = job })
            test.is_nil(spawn_err)
            local deadline = time.after("15s")
            local exit_event: any = nil
            while exit_event == nil do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                if selected.channel ~= events then error("execution child did not exit") end
                local event: any = selected.value
                if type(event) == "table" and tostring(event.from) == tostring(child_pid)
                    and event.kind == process.event.EXIT then
                    exit_event = event
                end
            end
            test.is_nil(exit_event.result.error)

            local verify_db, verify_err = sql.get("app:db")

            if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            test.eq(job_row(verify_db, job.id).status, job_types.JOB_STATE.PENDING)
            local run = latest_run(verify_db, job.id)
            test.not_nil(run)
            test.eq(run.status, job_types.RUN_STATE.FAILED)
            test.is_true(tostring(run.error_text):find(dispatch.PROC_TIMEOUT_MARKER, 1, true) ~= nil)
            verify_db:release()
        end)

        test.it("terminates a blocked function child at max_execution", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local thread_id = make_thread(db)
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_test" },
                parked = true,
                thread_id = thread_id,
                job_type = "test.function.child",
                worker_ref = "func://app:generic_job_target",
                priority = 10000,
                payload = { block = true, max_execution_ms = 250 },
            })
            test.is_nil(enqueue_err)
            local job, lease_err = job_fixture.lease_own(db, dbtype, id)
            if not job then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            test.eq(job.id, id)
            db:release()

            local child_err = worker_child.supervise_job_child(job)
            test.not_nil(child_err)
            test.is_true(tostring(child_err):find(worker_child.PROC_TIMEOUT_MARKER, 1, true) ~= nil)

            local verify_db, verify_err = sql.get("app:db")

            if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            test.eq(job_row(verify_db, id).status, job_types.JOB_STATE.RUNNING)
            verify_db:release()
        end)

        test.it("keeps a heartbeating proc past its heartbeat timeout", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            -- 2.4s of work under a 1s heartbeat timeout, heartbeating every 300ms.
            local job = enqueue_proc_and_claim(db, dbtype, make_thread(db), {
                heartbeat_timeout_ms = 1000, max_execution_ms = 30000,
                heartbeat_every_ms = 300, heartbeat_count = 8,
            })
            db:release()

            local child_err = worker_child.supervise_job_child(job :: table)
            test.is_nil(child_err)

            local verify_db = assert(sql.get("app:db"))
            test.eq(job_row(verify_db, job.id).status, job_types.JOB_STATE.DONE)
            verify_db:release()
        end)

        test.it("fails a proc that stops heartbeating and returns it to the queue", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            -- Heartbeats for 0.6s, then blocks without heartbeating.
            local job = enqueue_proc_and_claim(db, dbtype, make_thread(db), {
                heartbeat_timeout_ms = 1000, max_execution_ms = 30000,
                heartbeat_every_ms = 300, heartbeat_count = 2, block = true,
            })
            db:release()
            local started = time.now()

            local child_err, control = worker_child.supervise_job_child(job :: table)

            local elapsed_ms = (tonumber(time.now():sub(started):nanoseconds()) or 0) / 1000000
            test.not_nil(child_err)
            test.contains(tostring(child_err), worker_child.HEARTBEAT_TIMEOUT_MARKER)
            test.is_true(elapsed_ms >= 1500, "the heartbeat timeout restarts at the latest heartbeat")
            test.is_true(elapsed_ms < 10000, "the heartbeat timeout ends work long before the ceiling")

            local settle_db = assert(sql.get("app:db"))
            test.is_nil(worker.settle_child_exit(settle_db, dbtype, job :: table, nil, child_err, control))
            local row = job_row(settle_db, job.id)
            test.eq(row.status, job_types.JOB_STATE.PENDING)
            local failed = assert(settle_db:query("SELECT last_error FROM kickside_job WHERE id=$1", { job.id }))[1]
            test.contains(tostring(failed.last_error), worker_child.HEARTBEAT_TIMEOUT_MARKER)
            settle_db:release()
        end)

        test.it("ends a heartbeating proc at its ceiling", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local job = enqueue_proc_and_claim(db, dbtype, make_thread(db), {
                heartbeat_timeout_ms = 1000, max_execution_ms = 1500,
                heartbeat_every_ms = 300, heartbeat_count = 20,
            })
            db:release()

            local child_err = worker_child.supervise_job_child(job :: table)
            test.not_nil(child_err)
            test.contains(tostring(child_err), worker_child.PROC_TIMEOUT_MARKER)
        end)

        test.it("refuses a heartbeat for a lease the execution no longer holds", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local job = enqueue_proc_and_claim(db, dbtype, make_thread(db), {})
            local alive, heartbeat_err = jobs.heartbeat(job.id, { token = job.lease_token, execution_seq = job.execution_seq })
            test.is_nil(heartbeat_err)
            test.is_true(alive)
            local renewed = assert(db:query("SELECT heartbeat_at FROM kickside_job WHERE id=$1", { job.id }))[1]
            test.not_nil(renewed.heartbeat_at)
            local stale, stale_err = jobs.heartbeat(job.id, { token = uuid.v7(), execution_seq = job.execution_seq })
            test.is_nil(stale_err)
            test.is_false(stale)
            local later, later_err = jobs.heartbeat(job.id, { token = job.lease_token, execution_seq = job.execution_seq + 1 })
            test.is_nil(later_err)
            test.is_false(later)
            local fractional, fractional_err = jobs.heartbeat(job.id, {token = job.lease_token, execution_seq = job.execution_seq + 0.5})
            test.is_nil(fractional)
            test.is_true(errors.is(fractional_err, errors.INVALID))
            assert(db:execute("UPDATE kickside_job SET last_error=$1 WHERE id=$2",
                {job_types.TERMINATION_PENDING_PREFIX .. job.lease_token, job.id}))
            local fenced, fenced_err = jobs.heartbeat(job.id, {token = job.lease_token, execution_seq = job.execution_seq})
            test.is_nil(fenced_err)
            test.is_false(fenced)
            db:release()
        end)

        test.it("terminates a proc that exceeds max_execution and retries it", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                -- The target waits on a channel until the supervisor terminates it.
                local job = enqueue_proc_and_claim(db, dbtype, thread_id, { block = true, max_execution_ms = 250 })

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                -- attempts (1) < max (3): the killed attempt is requeued, not completed.
                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.PENDING)
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, job_types.RUN_STATE.FAILED)
                test.is_true(tostring(run.error_text):find(dispatch.PROC_TIMEOUT_MARKER, 1, true) ~= nil)
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
