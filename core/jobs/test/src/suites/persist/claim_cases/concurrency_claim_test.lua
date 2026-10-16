local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local claim = require("claim")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

-- Every case owns a private queue rebuilt empty from the live job schema, so
-- each claim selects only rows the case created.
local function with_db(fn)
    local db, _, err = job_fixture.private_queue("app:private_queue_concurrency_claim_test")
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
    test.describe("jobs.claim", function()
        test.it("single-flights jobs that share a concurrency key while claiming other keys", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_a = make_thread(db)
                local thread_b = make_thread(db)
                local first_id, first_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_a,
                    job_type = "test.owner-a.1",
                    priority = 100,
                    concurrency_key = "uploads:owner-a",
                })
                local second_id, second_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_a,
                    job_type = "test.owner-a.2",
                    priority = 90,
                    concurrency_key = "uploads:owner-a",
                })
                local other_id, other_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_b,
                    job_type = "test.owner-b.1",
                    priority = 80,
                    concurrency_key = "uploads:owner-b",
                })
                test.is_nil(first_err)
                test.is_nil(second_err)
                test.is_nil(other_err)

                local first = claim.claim_job(db, dbtype)
                test.not_nil(first)
                test.eq(first.id, first_id)

                local second = claim.claim_job(db, dbtype)
                test.not_nil(second)
                test.eq(second.id, other_id)
                test.eq(row_of(db, second_id).status, job_types.JOB_STATE.PENDING)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
