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
local reclaim = require("reclaim")
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
    test.describe("jobs.worker process_job claim->dispatch->finalize", function()
        test.it("retains the run finalized by a self-completing idle slot", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = enqueue_and_claim(db, dbtype, thread_id, "worker.test.self.completed",
                    { slot = true, worker_ref = "func://app:generic_job_target" })
                local original_execute = dispatch.execute_job
                local original_finalize = lifecycle.finalize_job_run
                local finalize_calls = 0
                dispatch.execute_job = function(_db: any, _dbtype: string, claimed: table)
                    local result, err = jobs.complete(claimed.id,
                        { token = claimed.lease_token, execution_seq = claimed.execution_seq }, {})
                    if err then return nil, err end
                    return { self_completed = true, completion = result }, nil
                end
                lifecycle.finalize_job_run = function(...)
                    finalize_calls = finalize_calls + 1
                    return original_finalize(...)
                end
                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job)
                lifecycle.finalize_job_run = original_finalize
                dispatch.execute_job = original_execute

                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.PENDING)
                test.eq(latest_run(db, job.id).status, "completed")
                test.eq(finalize_calls, 0)
            end)
        end)

        test.it("completes a claimed job and records a success run", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                -- An unknown type exercises the full path with a deterministic,
                -- dependency-free executor (returns skipped, no error). The job
                -- completes (DONE) but the run records that no work was performed.
                local job = enqueue_and_claim(db, dbtype, thread_id, "worker.test.skip")
                local pid = "test-pid-" .. uuid.v7()

                worker.process_job(db, dbtype, pid, job)

                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DONE)
                test.is_nil(job_row(db, job.id).lease_token)

                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, "parked")
                test.eq(tonumber(run.attempt_no), tonumber(job.attempts))
            end)
        end)

        test.it("records a lease_lost run and does not complete a stolen job", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = enqueue_and_claim(db, dbtype, thread_id, "worker.test.stolen")
                local pid = "test-pid-" .. uuid.v7()

                -- Simulate the lease being stolen by a reclaim before this worker
                -- runs: expire it, reclaim it back to pending (clearing the token),
                -- then process the stale job. The pre-execute heartbeat guard
                -- (running AND lease_token=?) now fails, so process_job records a
                -- lease_lost run and never completes the job.
                local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                sql.builder.update("kickside_job"):set("lease_until", past)
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                reclaim.reclaim_expired(db, dbtype)

                worker.process_job(db, dbtype, pid, job)

                -- The job was requeued (pending) by the reclaim and not marked done.
                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.PENDING)
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, job_types.RUN_STATE.LEASE_LOST)
            end)
        end)

        test.it("runs a generic worker_ref job under the worker frame", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "upload.process",
                    priority = 10000,
                    worker_ref = "func://app:generic_job_target",
                    payload = {
                        upload_id = "upload-" .. uuid.v7(),
                        trace_context = { trace_id = "trace-" .. uuid.v7(), run_id = "run-" .. uuid.v7() },
                    },
                })
                test.is_nil(enqueue_err)
                test.not_nil(job_id)

                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)

                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)
                test.eq(job.worker_ref, "func://app:generic_job_target")

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DONE)
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, "completed")
                local decoded = json.decode(run.result_json :: string)
                local frame = security.actor()
                test.eq(decoded.actor_id, frame and frame:id() or nil)
                test.eq(decoded.job_type, "upload.process")
                test.eq(decoded.trace_id, (lifecycle.decode_payload(job.payload).trace_context :: any).trace_id)
            end)
        end)

        test.it("tells the worker the instant its execution ceiling ends", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local thread_id = make_thread(db)
            local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_test" },
                parked = true, thread_id = thread_id, job_type = "test.function.deadline", priority = 10000,
                worker_ref = "func://app:generic_job_target", payload = { max_execution_ms = 5000 },
            })
            test.is_nil(enqueue_err)
            local job, lease_err = job_fixture.lease_own(db, dbtype, job_id :: string)
            if not job then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            db:release()
            local before = time.now()

            local child_err = worker_child.supervise_job_child(job :: table)

            local after = time.now()
            test.is_nil(child_err)
            local verify_db, verify_err = sql.get("app:db")
            if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            local run = latest_run(verify_db, job_id)
            verify_db:release()
            test.eq(run.status, "completed")
            local decoded = json.decode(run.result_json :: string)
            local deadline, parse_err = time.parse(time.RFC3339, tostring(decoded.deadline))
            test.is_nil(parse_err, "the worker input carries its execution deadline: " .. tostring(decoded.deadline))
            -- RFC3339 drops sub-second precision, so the deadline may read up to a second early.
            local earliest = before:add(4000 * time.MILLISECOND)
            local latest = after:add(5000 * time.MILLISECOND)
            test.is_false((deadline :: any):before(earliest), "the deadline is the execution ceiling, not earlier")
            test.is_false((deadline :: any):after(latest), "the deadline never outlasts the execution ceiling")
        end)

        test.it("rearms a job through the worker when output requests it", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local future = lifecycle.future_string(dbtype, 3600)
                if dbtype == sql.type.POSTGRES then future = string.sub(future, 1, 19) .. "Z" end
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "test.rearm.passthrough",
                    priority = 10000,
                    worker_ref = "func://app:generic_job_target",
                    payload = { rearm = future },
                })
                test.is_nil(enqueue_err)
                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)
                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                local row = job_row(db, job.id)
                test.eq(row.status, job_types.JOB_STATE.PENDING)
                test.eq(tostring(row.scheduled_at), future)
            end)
        end)

        test.it("ends a one-shot job dead on a raised deterministic target error", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "test.raise.deterministic",
                    priority = 10000,
                    worker_ref = "func://app:generic_job_target",
                    payload = { raise_kind = "invalid", raise_message = "bad declaration" },
                })
                test.is_nil(enqueue_err)
                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)
                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                local row = job_row(db, job.id)
                test.eq(row.status, job_types.JOB_STATE.DEAD)
                test.is_nil(row.scheduled_at)
            end)
        end)

        test.it("retries a job whose worker raises an infrastructure error", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "test.raise.infrastructure",
                    priority = 10000,
                    worker_ref = "func://app:generic_job_target",
                    payload = { raise_kind = "internal", raise_message = "provider down" },
                })
                test.is_nil(enqueue_err)
                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)
                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                local row = job_row(db, job.id)
                test.eq(row.status, job_types.JOB_STATE.PENDING)
                test.not_nil(row.scheduled_at)
            end)
        end)

        test.it("records a single run row across parent claim and execution child", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local thread_id = make_thread(db)
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_test" },
                parked = true,
                thread_id = thread_id,
                job_type = "test.single.run.row",
                worker_ref = "func://app:generic_job_target",
                priority = 10000,
                payload = { sleep_ms = 20, max_execution_ms = 1000 },
            })
            test.is_nil(enqueue_err)
            local job, lease_err = job_fixture.lease_own(db, dbtype, id)
            if not job then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            test.eq(job.id, id)
            local run_ctx, run_err = lifecycle.start_job_run(db, dbtype, job, "test-pid-" .. uuid.v7(), math.floor(tonumber(job.attempts) or 1))
            test.is_nil(run_err)
            test.not_nil(run_ctx)
            local parent_run_id = (run_ctx :: any).id
            test.not_nil(parent_run_id)
            db:release()

            local child_err, control = worker_child.supervise_job_child(job, tostring(parent_run_id))
            test.is_nil(child_err)
            test.is_nil(control)
            local verify_db, verify_err = sql.get("app:db")
            if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            local rows = sql.builder.select("id", "status"):from("kickside_job_run")
                :where(sql.builder.eq({ job_id = id })):run_with(verify_db):query()
            test.eq(#rows, 1)
            test.eq(tostring(rows[1].id), tostring(parent_run_id))
            test.eq(rows[1].status, "completed")
            verify_db:release()
        end)

        test.it("rearms a job with output events through the worker", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local future = lifecycle.future_string(dbtype, 3600)
                if dbtype == sql.type.POSTGRES then future = string.sub(future, 1, 19) .. "Z" end
                local upload_id = "upload-" .. uuid.v7()
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "test.rearm.events",
                    priority = 10000,
                    worker_ref = "func://app:generic_job_target",
                    payload = {
                        upload_id = upload_id,
                        emit_thread_event = true,
                        event_type = "test.job.rearmed",
                        rearm = future,
                    },
                })
                test.is_nil(enqueue_err)
                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)
                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                local row = job_row(db, job.id)
                test.eq(row.status, job_types.JOB_STATE.PENDING)
                test.eq(tostring(row.scheduled_at), future)
                local events = thread_events_for(db, thread_id, "test.job.rearmed")
                test.eq(#events, 1)
            end)
        end)

        test.it("atomically appends worker-returned thread events when a job completes", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local upload_id = "upload-" .. uuid.v7()
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "upload.process",
                    priority = 10000,
                    worker_ref = "func://app:generic_job_target",
                    payload = {
                        upload_id = upload_id,
                        emit_thread_event = true,
                        event_type = "test.job.completed",
                        trace_context = {
                            trace_id = "trace-" .. uuid.v7(),
                            run_id = "run-" .. uuid.v7(),
                            correlation_key = "upload:" .. upload_id,
                        },
                    },
                })
                test.is_nil(enqueue_err)
                test.not_nil(job_id)

                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)

                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DONE)
                local events = thread_events_for(db, thread_id, "test.job.completed")
                test.eq(#events, 1)
                local body = json.decode(tostring(events[1].body))
                test.eq(body.upload_id, upload_id)
                local payload = lifecycle.decode_payload(job.payload)
                test.eq(events[1].trace_id, payload.trace_context.trace_id)
                test.eq(events[1].run_id, payload.trace_context.run_id)
                test.eq(events[1].correlation_key, payload.trace_context.correlation_key)
            end)
        end)

        test.it("appends a deterministic failure event while ending the job dead", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local upload_id = "upload-" .. uuid.v7()
                local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "worker_test" },
                    parked = true,
                    thread_id = thread_id,
                    job_type = "upload.process",
                    priority = 10000,
                    max_attempts = 1,
                    worker_ref = "func://app:generic_job_target",
                    payload = {
                        upload_id = upload_id,
                        fail_with_event = true,
                        failure_class = "deterministic",
                        error_text = "bad file",
                        event_type = "test.job.failed",
                    },
                })
                test.is_nil(enqueue_err)
                test.not_nil(job_id)

                local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)

                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.not_nil(job)
                test.eq(job.id, job_id)

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job :: table)

                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DEAD)
                test.is_nil(job_row(db, job.id).scheduled_at)
                local run = latest_run(db, job.id)
                test.not_nil(run)
                test.eq(run.status, job_types.RUN_STATE.FAILED)
                local events = thread_events_for(db, thread_id, "test.job.failed")
                test.eq(#events, 1)
                local body = json.decode(tostring(events[1].body))
                test.eq(body.upload_id, upload_id)
                test.eq(body.error, "bad file")
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
