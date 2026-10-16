-- Isolated max_execution kill probe: runs alone to observe the kill path.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local job_fixture = require("job_fixture")
local lifecycle = require("lifecycle")
local worker_child = require("worker_child")

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

local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    sql.builder.insert("kickside_thread"):set_map({ id = id, thread_class = "test", component_id = id }):run_with(db):exec()
    return id
end

local function job_row(db, id): table?
    local rows = sql.builder.select("status", "lease_token", "attempts", "scheduled_at", "wake_enabled")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs.worker kill isolation", function()
        test.it("terminates a blocked function child at max_execution", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local thread_id = make_thread(db)
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "killprobe_test" },
                parked = true,
                thread_id = thread_id,
                job_type = "test.function.child",
                worker_ref = "func://app:generic_job_target",
                priority = 10000,
                payload = { block = true, max_execution_ms = 250 },
            })
            test.is_nil(enqueue_err)
            local job, lease_err = job_fixture.lease_own(db, dbtype, id)
            if not job then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            test.eq(job.id, id)
            db:release()

            local child_err = worker_child.supervise_job_child(job)
            test.not_nil(child_err)
            test.is_true(tostring(child_err):find(worker_child.PROC_TIMEOUT_MARKER, 1, true) ~= nil)

            local verify_db, verify_err = sql.get("app:db")

            if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            test.eq(job_row(verify_db, id).status, job_types.JOB_STATE.RUNNING)
            verify_db:release()
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
