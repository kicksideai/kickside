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
local claim = require("claim")
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
    test.describe("jobs.lifecycle run history", function()
        test.it("starts fresh lifetime history without a replay lookup", function()
            with_db(function(db)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local tx = assert(db:begin())
                local calls = 0
                local function observed() calls = calls + 1 end
                local probe = job_fixture.observe_tx(tx, observed, observed)
                local run, start_err = lifecycle.start_job_run(probe, dbtype, job, "run-insert-probe", 1)
                tx:rollback()
                test.is_nil(start_err)
                test.not_nil(run)
                test.eq(calls, 1)
            end)
        end)

        test.it("starts then finalizes a job run", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local run_ctx, start_err = lifecycle.start_job_run(db, dbtype, job, "pid-1", 1)
                test.is_nil(start_err)
                test.not_nil(run_ctx.id)

                local fin_err = lifecycle.finalize_job_run(db, dbtype, run_ctx, job_types.RUN_STATE.SUCCESS, { ok = true }, {}, nil)
                test.is_nil(fin_err)

                local rows = sql.builder.select("status", "result_json")
                    :from("kickside_job_run"):where(sql.builder.eq({ id = run_ctx.id })):run_with(db):query()
                test.eq(rows[1].status, job_types.RUN_STATE.SUCCESS)
                test.eq(json.decode(rows[1].result_json).ok, true)
            end)
        end)

        test.it("reuses the run row for the same running execution", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local first = lifecycle.start_job_run(db, dbtype, job, "pid-1", 1)
                local second = lifecycle.start_job_run(db, dbtype, job, "pid-2", 1)
                test.eq(first.id, second.id)
                local rows = sql.builder.select("id"):from("kickside_job_run")
                    :where(sql.builder.eq({ job_id = job.id })):run_with(db):query()
                test.eq(#rows, 1)
            end)
        end)

        test.it("records a new run row when a resumed execution repeats an attempt number", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local first, first_err = lifecycle.start_job_run(db, dbtype, job, "pid-1", 1)
                test.is_nil(first_err)
                local first_token = tostring(job.lease_token)
                job.lease_token = uuid.v7()
                job.execution_seq = 2
                local second, second_err = lifecycle.start_job_run(db, dbtype, job, "pid-2", 1)
                test.is_nil(second_err)
                test.not_nil(second.id)
                test.is_true(tostring(second.id) ~= tostring(first.id))
                local rows = sql.builder.select("id", "attempt_no", "lease_token", "execution_seq")
                    :from("kickside_job_run")
                    :where(sql.builder.eq({ job_id = job.id }))
                    :order_by("execution_seq ASC"):run_with(db):query()
                test.eq(#rows, 2)
                test.eq(tostring(rows[1].id), tostring(first.id))
                test.eq(tostring(rows[1].lease_token), first_token)
                test.eq(tonumber(rows[2].attempt_no), tonumber(rows[1].attempt_no))
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
