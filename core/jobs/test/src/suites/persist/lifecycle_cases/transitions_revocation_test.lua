local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local job_types = require("job_types")
local config = require("config")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local lease_status = require("lease_status")
local reclaim = require("reclaim")
local jobs = require("jobs")
local wake = require("wake")
local process = require("process")
local channel = require("channel")
local proc_supervisor = require("proc_supervisor")
local job_fixture = require("job_fixture")

local function with_db(fn)
    local db, err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(err)) end
    if err or not db then
        error("jobs test: db connect failed: " .. tostring(err))
    end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then
        error(run_err)
    end
end

-- Insert a thread row so kickside_job FK is satisfied on both dialects.
local function make_thread(db): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({ id = id, thread_class = "test", component_id = id })
        :run_with(db)
        :exec()
    if err then
        error("make_thread failed: " .. tostring(err))
    end
    return id
end

-- Create a fenced execution with the shared claim-snapshot fixture.
local function make_running_job(db, dbtype, thread_id, attempts, max_attempts): table
    return assert(job_fixture.running_job(db, dbtype, thread_id, attempts, max_attempts))
end

local function job_status(db, id): string?
    local rows = sql.builder.select("status"):from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    if rows and rows[1] then
        return tostring(rows[1].status)
    end
    return nil
end

local function job_row(db, id): table?
    local rows = sql.builder.select("status", "lease_token", "last_error")
        :from("kickside_job")
        :where(sql.builder.eq({ id = id }))
        :limit(1)
        :run_with(db)
        :query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs.lifecycle transitions", function()
        test.it("sends a token-qualified revocation to the registered supervisor", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local job = make_running_job(db, dbtype, make_thread(db), 1, 3)
                local name = proc_supervisor.execution_name(job.id, job.lease_token)
                local control_ch = process.listen(proc_supervisor.CONTROL_TOPIC)
                local registered, register_err = process.registry.register(name, nil, process.registry.CONSISTENT)
                test.is_nil(register_err)
                test.is_true(registered)

                local stale, stale_err = jobs.cancel(job.id, uuid.v7())
                test.is_nil(stale)
                test.not_nil(stale_err)
                test.eq(stale_err:kind(), errors.CONFLICT)
                local cancelled, cancel_err = jobs.cancel(job.id, job.lease_token)
                test.is_nil(cancel_err)
                test.is_true(cancelled.canceled)
                test.eq(cancelled.job_id, job.id)
                local notice = channel.select({ control_ch:case_receive() })
                test.eq(notice.value.kind, "revoked")
                test.eq(notice.value.job_id, job.id)
                test.eq(notice.value.lease_token, job.lease_token)
                test.eq(notice.value.execution_seq, job.execution_seq)

                process.registry.unregister(name, process.registry.CONSISTENT)
                process.unlisten(control_ch)
                local settled, settle_err = lifecycle_cancel.finish_cancellation(db, dbtype, {
                    id = job.id, token = job.lease_token, execution_seq = job.execution_seq,
                    reason = "test cancellation",
                })
                test.is_nil(settle_err)
                test.is_true(settled)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.CANCELLED)
            end)
        end)

        test.it("still owns the attempt its own child finalized before exiting", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local run_ctx, start_err = lifecycle.start_job_run(db, dbtype, job, "pid-1", 1)
                test.is_nil(start_err)

                -- The child finalizes the job and its run, then exits; the
                -- monitored EXIT can still be in flight at this observation.
                test.is_nil(lifecycle.complete_job(db, job, dbtype))
                test.is_nil(lifecycle.finalize_job_run(db, dbtype, run_ctx, job_types.RUN_STATE.SUCCESS, {}, {}, nil))

                local leased, leased_err = lease_status.job_still_running(db, job, dbtype)
                test.is_nil(leased_err)
                test.is_false(leased)

                local owned, owned_err = lease_status.job_still_running(db, job, dbtype, run_ctx.id)
                test.is_nil(owned_err)
                test.is_true(owned)
            end)
        end)

        test.it("loses the lease when another attempt reclaims the job", function()
            -- Reclaim recovers every expired lease in its queue, so the case owns a private queue.
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_transitions_revocation_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local queue = db :: sql.DB
            local dialect = dbtype :: string
            local job = make_running_job(queue, dialect, uuid.v7(), 1, 3)
            local run_ctx, start_err = lifecycle.start_job_run(queue, dialect, job, "pid-1", 1)
            test.is_nil(start_err)

            local _, update_err = sql.builder.update("kickside_job")
                :set("lease_until", lifecycle.format_time(dialect, time.now():add(-60 * time.SECOND)))
                :where(sql.builder.eq({ id = job.id }))
                :run_with(queue)
                :exec()
            test.is_nil(update_err)
            local reclaimed, reclaim_err = reclaim.reclaim_expired(queue, dialect)
            test.is_nil(reclaim_err)
            test.eq(reclaimed, 1)

            -- This attempt never finalized its run, so the reclaimed
            -- lease is genuinely lost and the supervisor must terminate.
            local owned, owned_err = lease_status.job_still_running(queue, job, dialect, run_ctx.id)
            test.is_nil(owned_err)
            test.is_false(owned)
            queue:release()
        end)

        test.it("treats a running job with an expired lease as not running", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)

                local _, update_err = sql.builder.update("kickside_job")
                    :set("lease_until", lifecycle.format_time(dbtype, time.now():add(-60 * time.SECOND)))
                    :where(sql.builder.eq({ id = job.id }))
                    :run_with(db)
                    :exec()
                test.is_nil(update_err)

                local active, active_err = lease_status.job_still_running(db, job, dbtype)
                test.is_nil(active_err)
                test.is_false(active)
            end)
        end)

        test.it("rejects broad cancellation without id or thread idempotency key", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local canceled, cancel_err = lifecycle_cancel.cancel_job(db, dbtype, {} :: any)
                test.is_false(canceled)
                test.not_nil(cancel_err)
                test.eq(cancel_err:kind(), errors.INVALID)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
