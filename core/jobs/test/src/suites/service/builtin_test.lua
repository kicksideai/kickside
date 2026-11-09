-- The wake continuation, the one built-in job, through the supervised execution child.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local job_fixture = require("job_fixture")
local lifecycle = require("lifecycle")
local worker_child = require("worker_child")
local jobs = require("jobs")
local wake = require("wake")

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

local function job_row(db, id): table?
    local rows = sql.builder.select("status", "lease_token", "attempts", "scheduled_at", "wake_enabled")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function latest_run(db, job_id): table?
    local rows = sql.builder.select("status", "attempt_no", "error_text", "result_json")
        :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
        :order_by("attempt_no DESC"):limit(1):run_with(db):query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs.worker built-in execution", function()
        test.it("continues parked watchers through its supervised child", function()
            local key = "thread:" .. uuid.v7()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                for i = 1, 205 do
                    local _, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "builtin_test" },
                        job_identity = { namespace = "drive", scope = key, key = "watcher-" .. tostring(i) },
                        job_type = "test.watcher", wake_key = key, parked = true,
                    })
                    test.is_nil(enqueue_err)
                end
            end)
            local wake_db, db_err = sql.get("app:db")
            if not wake_db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(wake_db:type())
            local woken, wake_err = job_fixture.wake_key(wake_db, dbtype, key)
            test.is_nil(wake_err)
            test.eq(woken.touched_count, 200)
            wake_db:release()
            local continuation: table? = nil
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local identity = lifecycle.identity_parts({
                    job_type = "test.watcher",
                    job_identity = { namespace = "wake", scope = key, key = "continuation" },
                }, "unused")
                local rows = sql.builder.select("id", "payload", "owner_kind", "owner_id")
                    :from("kickside_job"):where(sql.builder.eq({ job_identity = identity }))
                    :run_with(db):query()
                test.eq(#rows, 1)
                local leased, lease_err = job_fixture.lease_own(db, dbtype, rows[1].id)
                test.is_nil(lease_err)
                continuation = leased
                db:release()
            end)
            test.not_nil(continuation)
            if not continuation then error("continuation job is absent") end

            local child_err = worker_child.supervise_job_child(continuation)
            test.is_nil(child_err)

            local verify_db, verify_err = sql.get("app:db")

            if not verify_db then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            local watchers = sql.builder.select("scheduled_at", "wake_generation")
                :from("kickside_job")
                :where(sql.builder.eq({ wake_key = key, status = "pending", job_type = "test.watcher" }))
                :where("scheduled_at IS NOT NULL")
                :run_with(verify_db):query()
            test.eq(#watchers, 205)
            for _, row in ipairs(watchers) do
                test.eq(tonumber(row.wake_generation), 1)
            end
            local settled = sql.builder.select("demand_generation", "ack_generation")
                :from("kickside_wake_fanout"):where(sql.builder.eq({ key = key }))
                :run_with(verify_db):query()
            test.eq(tonumber(settled[1].demand_generation), 1)
            test.eq(tonumber(settled[1].ack_generation), 1)
            local finished = job_row(verify_db, (continuation :: table).id)
            test.eq(finished.status, job_types.JOB_STATE.DONE)
            local run = latest_run(verify_db, (continuation :: table).id)
            test.not_nil(run)
            test.eq(run.status, job_types.RUN_STATE.SUCCESS)
            sql.builder.update("kickside_job"):set("status", "cancelled")
                :where(sql.builder.eq({ wake_key = key })):run_with(verify_db):exec()
            sql.builder.update("kickside_job"):set("status", "cancelled")
                :where(sql.builder.eq({ id = (continuation :: table).id })):run_with(verify_db):exec()
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
