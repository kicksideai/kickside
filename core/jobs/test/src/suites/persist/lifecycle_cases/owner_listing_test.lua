local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

local function define_tests()
    test.describe("Thread owner job listings", function()
        test.it("lists canonical thread-owned jobs and runs without a stored thread_id", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype, type_err = db:type()
            test.is_nil(type_err)
            local owner = uuid.v7()
            local owned_id = ""
            local other_owned_id = ""
            for _, locator in ipairs({
                { kind = "thread", id = owner },
                { kind = "thread", id = uuid.v7() },
                { kind = "test", id = owner },
            }) do
                local id, enqueue_err = lifecycle.enqueue_job(db, tostring(dbtype), {
                    owner_locator = locator,
                    job_type = "test.owner_listing",
                    payload = {}, parked = true,
                    job_identity = { namespace = "owner-listing", scope = locator.id, key = locator.kind },
                })
                if not id then error("test job enqueue fails: " .. tostring(enqueue_err)) end
                test.is_nil(enqueue_err)
                if locator.kind == "thread" and locator.id == owner then owned_id = id end
                if locator.kind == "test" then other_owned_id = id end
                local job, lease_err = job_fixture.lease_own(db, tostring(dbtype), id)
                if not job then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                test.is_nil(job.thread_id)
                local run, run_err = lifecycle.start_job_run(db, tostring(dbtype), job, "owner-listing", 1)
                test.is_nil(run_err)
                test.not_nil(run)
            end
            local jobs, jobs_err = lifecycle.list_jobs(db, { owner }, nil, 100)
            test.is_nil(jobs_err)
            test.eq(#jobs, 1)
            test.eq(jobs[1].id, owned_id)
            test.eq(jobs[1].thread_id, owner)
            local filtered, filtered_err = lifecycle.list_jobs(db, { owner }, { thread_id = owner }, 100)
            test.is_nil(filtered_err)
            test.eq(#filtered, 1)
            local runs, runs_err = lifecycle.list_job_runs(db, { owner }, { job_id = owned_id, thread_id = owner }, 100)
            test.is_nil(runs_err)
            test.eq(#runs, 1)
            test.eq(runs[1].job_id, owned_id)
            test.eq(runs[1].thread_id, owner)
            local absent, absent_err = lifecycle.list_job_runs(db, { uuid.v7() }, nil, 100)
            test.is_nil(absent_err)
            test.eq(#absent, 0)
            local exact, exact_err = lifecycle.get_job(db, other_owned_id)
            test.is_nil(exact_err)
            test.eq(exact.id, other_owned_id)
            test.eq(exact.owner_kind, "test")
            test.eq(exact.owner_id, owner)
            local missing, missing_err = lifecycle.get_job(db, uuid.v7())
            test.is_nil(missing_err)
            test.is_nil(missing)
            local _, release_err = db:release()
            test.is_nil(release_err)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
