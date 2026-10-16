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

-- Insert a job already in running state under a known lease token.
local function make_running_job(db, dbtype, thread_id, attempts, max_attempts): table
    local id = uuid.v7()
    local token = uuid.v7()
    local _, err = sql.builder.insert("kickside_job")
        :set_map({
            id = id,
            owner_kind = "test",
            owner_id = "lifecycle_test",
            job_identity = "7:oneshot" .. tostring(#id) .. ":" .. id .. tostring(#id) .. ":" .. id,
            thread_id = thread_id,
            job_type = "test.job",
            payload = "{}",
            status = job_types.JOB_STATE.RUNNING,
            attempts = attempts,
            max_attempts = max_attempts,
            queue_tier = job_types.QUEUE_TIER.LIVE,
            lease_token = token,
            execution_seq = 1,
            lease_until = lifecycle.future_string(dbtype, 60),
        })
        :run_with(db)
        :exec()
    if err then
        error("make_running_job failed: " .. tostring(err))
    end
    return { id = id, thread_id = thread_id, job_type = "test.job", attempts = attempts,
        max_attempts = max_attempts, lease_token = token, execution_seq = 1, payload = "{}",
        owner_kind = "test", owner_id = "lifecycle_test" }
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
    test.describe("jobs.lifecycle backoff", function()
        test.it("doubles the configured retry floor and caps at the policy ceiling", function()
            test.eq(lifecycle.retry_delay_seconds(1, 2, 900), 2)
            test.eq(lifecycle.retry_delay_seconds(2, 2, 900), 4)
            test.eq(lifecycle.retry_delay_seconds(3, 2, 900), 8)
            test.eq(lifecycle.retry_delay_seconds(8, 2, 900), 256)
            test.eq(lifecycle.retry_delay_seconds(9, 2, 900), 512)
            test.eq(lifecycle.retry_delay_seconds(50, 2, 900), 900)
        end)

        test.it("clamps non-positive attempts to the first step", function()
            test.eq(lifecycle.retry_delay_seconds(0, 2, 900), 2)
            test.eq(lifecycle.retry_delay_seconds(-3, 2, 900), 2)
        end)

        test.it("caps at the given ceiling and floors a non-positive ceiling at one second", function()
            test.eq(lifecycle.retry_delay_seconds(8, 2, 100), 100)
            test.eq(lifecycle.retry_delay_seconds(8, 2, 0), 1)
            test.eq(lifecycle.retry_delay_seconds(8, 2, -1), 1)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
