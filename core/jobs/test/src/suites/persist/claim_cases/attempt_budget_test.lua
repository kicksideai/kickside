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
    local db, _, err = job_fixture.private_queue("app:private_queue_attempt_budget_test")
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
    test.describe("jobs.claim + fail attempt budget", function()
        test.it("keeps retrying a slot's infrastructure failures past max_attempts with a lifetime sequence", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local max_attempts = 3
                local job_id, enq_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_id,
                    job_type = "test.budget",
                    max_attempts = max_attempts,
                    slot = true,
                    job_identity = { namespace = "test", scope = uuid.v7(), key = "budget" },
                })
                test.is_nil(enq_err)

                local runs = 0
                for _ = 1, max_attempts + 2 do
                    -- A retry reschedules with backoff into the future; pull the
                    -- row back to now so the next claim is deterministic.
                    sql.builder.update("kickside_job")
                        :set("scheduled_at", lifecycle.now_string(dbtype))
                        :where(sql.builder.eq({ id = job_id }))
                        :run_with(db):exec()

                    local job = claim.claim_job(db, dbtype)
                    if not job or job.id ~= job_id then
                        break
                    end
                    runs = runs + 1

                    local fail_err = lifecycle.fail_job(db, job, dbtype, "boom")
                    test.is_nil(fail_err)

                    test.eq(tonumber(row_of(db, job_id).execution_seq), runs)
                end

                test.eq(runs, max_attempts + 2)
                test.eq(row_of(db, job_id).status, job_types.JOB_STATE.PENDING)
            end)
        end)

        test.it("ends a one-shot job dead when its attempts reach max_attempts", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local max_attempts = 3
                local job_id, enq_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = make_thread(db),
                    job_type = "test.budget",
                    max_attempts = max_attempts,
                })
                test.is_nil(enq_err)
                local runs = 0
                for _ = 1, max_attempts + 2 do
                    sql.builder.update("kickside_job")
                        :set("scheduled_at", lifecycle.now_string(dbtype))
                        :where(sql.builder.eq({ id = job_id, status = job_types.JOB_STATE.PENDING }))
                        :run_with(db):exec()
                    local job = claim.claim_job(db, dbtype)
                    if not job or job.id ~= job_id then break end
                    runs = runs + 1
                    test.is_nil(lifecycle.fail_job(db, job, dbtype, "boom"))
                end
                test.eq(runs, max_attempts)
                test.eq(row_of(db, job_id).status, job_types.JOB_STATE.DEAD)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }

