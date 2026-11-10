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

-- Process a leased job as its execution child does: the child registers its
-- execution name, through which progress reaches the proc supervisor.
local function process_as_child(db: sql.DB, dbtype: string, job: table)
    local name = proc_supervisor.child_name(tostring(job.id), tostring(job.lease_token))
    local registered, register_err = process.registry.register(name, nil, process.registry.CONSISTENT)
    if register_err or registered ~= true then error("child name registration failed: " .. tostring(register_err)) end
    worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job)
    process.registry.unregister(name, process.registry.CONSISTENT)
end

local function thread_events_for(db: sql.DB, thread_id: string, event_type: string): { table }
    return sql.builder.select("type", "body", "trace_id", "run_id", "correlation_key")
        :from("kickside_event")
        :where(sql.builder.eq({ thread_id = thread_id, type = event_type }))
        :run_with(db):query() or {}
end

local function define_tests()
    test.describe("jobs.worker supervised proc (live)", function()
        test.it("runs a multi-hundred-ms proc to completion without losing its lease", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                -- 300ms of work under the default (large) ceiling: completes cleanly.
                local job = enqueue_proc_and_claim(db, dbtype, thread_id, { sleep_ms = 300 })

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DONE)
                test.is_nil(job_row(db, job.id).lease_token)
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, "completed")
            end)
        end)

        test.it("keeps a proc running past max_execution while it reports progress", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                -- 2.4s of work under a 1s ceiling, reporting progress every 300ms.
                local job = enqueue_proc_and_claim(db, dbtype, thread_id, {
                    max_execution_ms = 1000, progress_every_ms = 300, progress_count = 8,
                })

                process_as_child(db, dbtype, job :: table)

                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, "completed")
                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DONE)
            end)
        end)

        test.it("ends a proc at max_execution measured from its latest progress", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                -- Progress for 0.9s, then 3s without progress under a 1s ceiling.
                local job = enqueue_proc_and_claim(db, dbtype, thread_id, {
                    max_execution_ms = 1000, progress_every_ms = 300, progress_count = 3, sleep_ms = 3000,
                })
                local started = time.now()

                process_as_child(db, dbtype, job :: table)

                local elapsed_ms = (tonumber(time.now():sub(started):nanoseconds()) or 0) / 1000000
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, job_types.RUN_STATE.FAILED)
                test.contains(tostring(run.error_text), dispatch.PROC_TIMEOUT_MARKER)
                test.is_true(elapsed_ms >= 1800, "the ceiling restarts at the latest progress")
                test.is_true(elapsed_ms < 3000, "the ceiling ends work that stops progressing")
            end)
        end)

        test.it("ends a one-shot proc dead when its failure carries a deterministic kind", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                for _ = 1, 10 do
                    local thread_id = make_thread(db)
                    local job = enqueue_proc_and_claim(db, dbtype, thread_id, {
                        fail = true, error_text = "bad input", error_kind = errors.INVALID,
                    })

                    worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                    local row = job_row(db, job.id)
                    test.eq(row.status, job_types.JOB_STATE.DEAD)
                    test.is_nil(row.scheduled_at)
                    local run = latest_run(db, job.id)
                    test.not_nil(run)
                    test.eq(run.status, job_types.RUN_STATE.FAILED)
                end
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
