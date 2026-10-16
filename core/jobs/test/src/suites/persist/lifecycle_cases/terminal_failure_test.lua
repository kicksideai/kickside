local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local lifecycle = require("lifecycle")
local dispatch = require("worker_dispatch")
local worker_completion = require("worker_completion")
local job_fixture = require("job_fixture")

local function with_db(fn: (sql.DB, string) -> ())
    local db, err = sql.get("app:db")
    if err or not db then error("jobs test: db connect failed: " .. tostring(err)) end
    fn(db, tostring(db:type()))
    db:release()
end

local function leased(db: sql.DB, dbtype: string, params: table): table
    local spec: table = { job_type = "test.terminal_failure", thread_id = uuid.v7() }
    for key, value in pairs(params) do spec[key] = value end
    local job, err = job_fixture.enqueue_leased(db, dbtype, spec)
    if err or not job then error("enqueue failed: " .. tostring(err)) end
    return job :: table
end

local function row_of(db: sql.DB, id: string): table
    local rows, err = db:query("SELECT status,attempts,scheduled_at,finished_at,wake_enabled,last_error FROM kickside_job WHERE id=$1", { id })
    if err or not rows or not rows[1] then error("job unreadable: " .. tostring(err)) end
    return rows[1] :: table
end

local function slot_identity(): table
    return { namespace = "test", scope = uuid.v7(), key = "slot" }
end

local function define_tests()
    test.describe("jobs terminal failure", function()
        test.it("retries a one-shot infrastructure failure until max_attempts, then ends it dead", function()
            with_db(function(db, dbtype)
                local job = leased(db, dbtype, { max_attempts = 2 })
                test.is_nil(lifecycle.fail_job(db, job, dbtype, "provider down", "infrastructure"))
                local retried = row_of(db, job.id)
                test.eq(retried.status, job_types.JOB_STATE.PENDING)
                test.not_nil(retried.scheduled_at)
                test.is_nil(retried.finished_at)

                local again, lease_err = job_fixture.lease_own(db, dbtype, job.id)
                test.is_nil(lease_err)
                test.eq(tonumber((again :: table).attempts), 2)
                test.is_nil(lifecycle.fail_job(db, again :: table, dbtype, "provider still down", "infrastructure"))
                local dead = row_of(db, job.id)
                test.eq(dead.status, job_types.JOB_STATE.DEAD)
                test.not_nil(dead.finished_at)
                test.is_nil(dead.scheduled_at)
                test.eq(dead.last_error, "provider still down")
                local _, release_err = job_fixture.lease_own(db, dbtype, job.id)
                test.not_nil(release_err)
            end)
        end)

        test.it("ends a one-shot deterministic failure dead at once", function()
            with_db(function(db, dbtype)
                local job = leased(db, dbtype, { max_attempts = 5 })
                test.is_nil(lifecycle.fail_job(db, job, dbtype, "bad input", "deterministic"))
                local dead = row_of(db, job.id)
                test.eq(dead.status, job_types.JOB_STATE.DEAD)
                test.not_nil(dead.finished_at)
                test.eq(dead.last_error, "bad input")
            end)
        end)

        test.it("keeps a slot past max_attempts: infrastructure retries, deterministic parks", function()
            with_db(function(db, dbtype)
                local retrying = leased(db, dbtype, { max_attempts = 1, slot = true, job_identity = slot_identity() })
                test.is_nil(lifecycle.fail_job(db, retrying, dbtype, "provider down", "infrastructure"))
                local retry = row_of(db, retrying.id)
                test.eq(retry.status, job_types.JOB_STATE.PENDING)
                test.not_nil(retry.scheduled_at)
                test.is_nil(retry.finished_at)

                local parking = leased(db, dbtype, { max_attempts = 1, slot = true, job_identity = slot_identity() })
                test.is_nil(lifecycle.fail_job(db, parking, dbtype, "bad input", "deterministic"))
                local parked = row_of(db, parking.id)
                test.eq(parked.status, job_types.JOB_STATE.PENDING)
                test.is_nil(parked.scheduled_at)
                test.is_nil(parked.finished_at)
            end)
        end)

        for _, failure in ipairs({"plain", "unavailable"}) do
            test.it("classifies function " .. failure .. " before settling a slot", function()
                with_db(function(db, dbtype)
                    local job = leased(db, dbtype, {max_attempts = 1, slot = true,
                        job_identity = slot_identity(), worker_ref = "func://app:generic_job_target",
                        payload = {raise_kind = failure, raise_message = "function worker boom"}})
                    for attempt = 1, 3 do
                        local output, err = dispatch.execute_job(db, dbtype, job)
                        test.is_nil(output); test.not_nil(err)
                        test.eq(err:kind(), failure == "plain" and errors.INTERNAL or errors.UNAVAILABLE)
                        test.is_false(err:retryable())
                        test.eq(err:details().cause.kind, err:kind())
                        test.eq(err:details().cause.retryable, failure ~= "plain")
                        local classification = worker_completion.failure_class_for(err)
                        test.eq(classification, failure == "plain" and "deterministic" or "infrastructure")
                        test.is_nil(lifecycle.fail_job(db, job, dbtype, tostring(err), classification))
                        local row = row_of(db, job.id)
                        test.eq(row.status, job_types.JOB_STATE.PENDING)
                        test.eq(tonumber(row.attempts), attempt)
                        test.not_nil(row.last_error); test.is_nil(row.finished_at)
                        if failure == "plain" then
                            test.is_nil(row.scheduled_at)
                            test.is_true(row.last_error:find("function worker boom", 1, true) ~= nil)
                            break
                        end
                        test.not_nil(row.scheduled_at)
                        test.is_true(row.last_error:find("database unavailable", 1, true) ~= nil)
                        local again, lease_err = job_fixture.lease_own(db, dbtype, job.id)
                        test.is_nil(lease_err); job = again
                    end
                end)
            end)
        end

        test.it("keeps infrastructure kinds retryable independently of function retry policy", function()
            for _, kind in ipairs({errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, policy in ipairs({{}, {retryable = true}, {retryable = false}}) do
                    local err = errors.new({kind = kind, message = "infrastructure failure", retryable = policy.retryable})
                    test.eq(worker_completion.failure_class_for(err),
                        kind == errors.INTERNAL and policy.retryable == false and "deterministic" or "infrastructure")
                end
            end
            local _, crash = dispatch.supervise_proc_loop({
                wait = function() return {kind = "crash", error = "process stopped"} end,
            }, "owned-child")
            test.not_nil(crash)
            test.eq(worker_completion.failure_class_for(crash), "infrastructure")
        end)

        test.it("marks only a one-shot job's last attempt final", function()
            local function final(attempts: integer, max_attempts: integer, slot: any): boolean
                local input, _, err = dispatch.build_worker_input({ id = "j", attempts = attempts,
                    max_attempts = max_attempts, slot = slot, payload = "{}" })
                if err or not input then error("worker input failed: " .. tostring(err)) end
                return (input :: table).job.is_final_attempt
            end
            test.is_false(final(1, 3, false))
            test.is_true(final(3, 3, false))
            test.is_true(final(3, 3, 0))
            test.is_false(final(3, 3, true))
            test.is_false(final(5, 3, 1))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
