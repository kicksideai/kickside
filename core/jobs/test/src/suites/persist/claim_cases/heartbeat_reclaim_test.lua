local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local claim = require("claim")
local reclaim = require("reclaim")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

-- Every case owns a private queue rebuilt empty from the live job schema, so
-- each claim selects only rows the case created.
local function with_db(fn)
    local db, _, err = job_fixture.private_queue("app:private_queue_heartbeat_reclaim_test")
    if not db or not _ then error("test queue unavailable: " .. tostring(err)) end
    if err or not db then
        error("jobs test: private queue unavailable: " .. tostring(err))
    end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then
        error(run_err)
    end
end

-- Jobs carry thread_id without a thread foreign key; the private queue holds
-- only the job closure.
local function make_thread(_db: sql.DB): string
    return uuid.v7()
end

local function enqueue(db: sql.DB, dbtype: string, thread_id: string, job_type: string?, scheduled_at: string?): string
    local id, err = lifecycle.enqueue_job(db, dbtype, {
        owner_locator = { kind = "test", id = "claim_test" },
        thread_id = thread_id,
        job_type = job_type or "test.claim",
        scheduled_at = scheduled_at,
    })
    if err then
        error("enqueue failed: " .. tostring(err))
    end
    return id :: string
end

local function row_of(db: sql.DB, id): table?
    local rows = sql.builder.select("status", "lease_token", "lease_until", "attempts", "execution_seq")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs.claim heartbeat + reclaim", function()
        test.it("extends the lease window for the lease owner", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                enqueue(db, dbtype, thread_id)
                local job = claim.claim_job(db, dbtype)
                test.not_nil(job)

                local before = row_of(db, job.id).lease_until
                local err = lifecycle.heartbeat_job(db, job :: table, dbtype)
                test.is_nil(err)
                local after = row_of(db, job.id).lease_until
                test.is_true(after >= before)
            end)
        end)

        test.it("reclaims a running job whose lease has expired", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                enqueue(db, dbtype, thread_id)
                local job = claim.claim_job(db, dbtype)
                test.not_nil(job)

                -- Force the lease into the past, simulating a crashed worker.
                -- Text timestamps sort chronologically, so an early literal is
                -- strictly less than now under the reclaim comparison.
                local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                sql.builder.update("kickside_job")
                    :set("lease_until", past)
                    :where(sql.builder.eq({ id = job.id }))
                    :run_with(db):exec()

                local reclaimed, err = reclaim.reclaim_expired(db, dbtype)
                test.is_nil(err)
                test.is_true(reclaimed >= 1)
                local row = row_of(db, job.id)
                test.eq(row.status, job_types.JOB_STATE.PENDING)
                test.is_nil(row.lease_token)
            end)
        end)

        test.it("does not reclaim a job with a live lease", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                enqueue(db, dbtype, thread_id)
                local job = claim.claim_job(db, dbtype)
                test.not_nil(job)

                reclaim.reclaim_expired(db, dbtype)
                test.eq(row_of(db, job.id).status, job_types.JOB_STATE.RUNNING)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
