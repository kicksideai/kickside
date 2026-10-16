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
    test.describe("jobs wake demand", function()
        test.it("drains bounded fan-out and acknowledges a newer demand after continuation", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local key = "thread:" .. uuid.v7()
                for i = 1, 205 do
                    local id, err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "lifecycle_test" },
                        job_identity = { namespace = "drive", scope = "fanout", key = key .. ":" .. tostring(i) },
                        job_type = "test.watcher", wake_key = key, parked = true,
                    })
                    test.is_nil(err)
                    test.not_nil(id)
                end
                local first, first_err = job_fixture.wake_key(db, dbtype, key)
                test.is_nil(first_err)
                test.eq(first.touched_count, 200)
                test.eq(first.demand_generation, 1)
                test.not_nil(first.continuation_id)
                local row = sql.builder.select("demand_generation", "ack_generation")
                    :from("kickside_wake_fanout"):where(sql.builder.eq({ key = key }))
                    :run_with(db):query()
                test.eq(tonumber(row[1].demand_generation), 1)
                test.eq(tonumber(row[1].ack_generation), 0)

                local continuation = sql.builder.select("id", "payload", "job_type", "attempts")
                    :from("kickside_job"):where(sql.builder.eq({ job_type = wake.CONTINUATION_TYPE }))
                    :where("status IN ('pending','running')")
                    :order_by("created_at DESC"):limit(1):run_with(db):query()
                test.eq(#continuation, 1)
                local job = continuation[1]
                job.lease_token = uuid.v7()
                local _, running_err = sql.builder.update("kickside_job")
                    :set("status", "running"):set("lease_token", job.lease_token)
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(running_err)

                local second, second_err = job_fixture.wake_key(db, dbtype, key)
                test.is_nil(second_err)
                test.eq(second.touched_count, 0)
                test.eq(second.demand_generation, 2)
                test.eq(second.continuation_id, first.continuation_id)
                local result, continue_err = wake.continue_job(db, dbtype, job)
                test.is_nil(continue_err)
                test.is_true(result.self_completed)
                job.lease_token = uuid.v7()
                local _, retry_err = sql.builder.update("kickside_job")
                    :set("status", "running"):set("lease_token", job.lease_token)
                    :set("lease_until", lifecycle.future_string(dbtype, 60))
                    :where(sql.builder.eq({ id = job.id, status = "pending" }))
                    :run_with(db):exec()
                test.is_nil(retry_err)
                local final, final_err = wake.continue_job(db, dbtype, job)
                test.is_nil(final_err)
                test.is_true(final.self_completed)
                local after = sql.builder.select("demand_generation", "ack_generation")
                    :from("kickside_wake_fanout"):where(sql.builder.eq({ key = key }))
                    :run_with(db):query()
                test.eq(tonumber(after[1].demand_generation), 2)
                test.eq(tonumber(after[1].ack_generation), 2)
                local unseen = sql.builder.select("id"):from("kickside_job")
                    :where(sql.builder.eq({ wake_key = key }))
                    :where("wake_generation < 2")
                    :run_with(db):query()
                test.eq(#unseen, 0)
                local _, cleanup_err = sql.builder.update("kickside_job")
                    :set("status", "cancelled")
                    :where(sql.builder.eq({ wake_key = key }))
                    :run_with(db):exec()
                test.is_nil(cleanup_err)
            end)
        end)

        test.it("wakes a parked threadless watcher inside the caller transaction", function()
            test.not_nil(jobs.wake_tx)
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local key = "thread:" .. uuid.v7()
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_identity = { namespace = "drive", scope = "demo", key = uuid.v7() },
                    job_type = "test.watcher", wake_key = key, parked = true,
                })
                test.is_nil(enqueue_err)
                local tx, begin_err = db:begin()
                test.is_nil(begin_err)
                local woken, wake_err = jobs.wake_tx(tx, key)
                test.is_nil(wake_err)
                test.eq(woken.touched_count, 1)
                test.eq(woken.demand_generation, 1)
                test.is_nil(woken.continuation_id)
                local _, commit_err = tx:commit()
                test.is_nil(commit_err)
                local rows = sql.builder.select("scheduled_at", "wake_generation")
                    :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
                test.not_nil(rows[1].scheduled_at)
                test.eq(tonumber(rows[1].wake_generation), 1)
                local _, cleanup_err = sql.builder.update("kickside_job")
                    :set("status", "cancelled")
                    :where(sql.builder.eq({ id = id })):run_with(db):exec()
                test.is_nil(cleanup_err)
            end)
        end)

        test.it("records demand while running and control wake after a deterministic park", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local key = "thread:" .. uuid.v7()
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_identity = { namespace = "drive", scope = "demo", key = uuid.v7() },
                    job_type = "test.watcher", wake_key = key,
                })
                test.is_nil(enqueue_err)
                local _, set_err = sql.builder.update("kickside_job")
                    :set("status", "running"):set("lease_token", uuid.v7())
                    :set("scheduled_at", nil)
                    :where(sql.builder.eq({ id = id })):run_with(db):exec()
                test.is_nil(set_err)
                local woken, wake_err = job_fixture.wake_key(db, dbtype, key)
                test.is_nil(wake_err)
                test.eq(woken.touched_count, 1)
                local rows = sql.builder.select("wake_demand_at")
                    :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
                test.not_nil(rows[1].wake_demand_at)

                local _, park_err = sql.builder.update("kickside_job")
                    :set("status", "pending"):set("lease_token", nil)
                    :set("scheduled_at", nil):set("wake_enabled", false)
                    :where(sql.builder.eq({ id = id })):run_with(db):exec()
                test.is_nil(park_err)
                local control, control_err = jobs.wake_job(id :: string, { control = true })
                test.is_nil(control_err)
                test.is_true(control.woken)
                local after = sql.builder.select("scheduled_at", "wake_enabled")
                    :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
                test.not_nil(after[1].scheduled_at)
                test.eq(tostring(control.scheduled_at), tostring(after[1].scheduled_at))
                test.is_true(after[1].wake_enabled == true or tonumber(after[1].wake_enabled) == 1)
                local _, cleanup_err = sql.builder.update("kickside_job")
                    :set("status", "cancelled")
                    :where(sql.builder.eq({ id = id })):run_with(db):exec()
                test.is_nil(cleanup_err)
            end)
        end)

        test.it("makes a parked slot due on ordinary demand wake", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local key = "thread:" .. uuid.v7()
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_identity = { namespace = "drive", scope = "demo", key = uuid.v7() },
                    job_type = "test.watcher", wake_key = key, parked = true,
                })
                test.is_nil(enqueue_err)
                local before = sql.builder.select("scheduled_at")
                    :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
                test.is_nil(before[1].scheduled_at)
                local woken, wake_err = wake.wake_job(db, id, nil, dbtype)
                test.is_nil(wake_err)
                test.is_true(woken.woken)
                local after = sql.builder.select("status", "scheduled_at", "wake_demand_at")
                    :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
                test.eq(after[1].status, job_types.JOB_STATE.PENDING)
                test.not_nil(after[1].scheduled_at)
                test.eq(tostring(woken.scheduled_at), tostring(after[1].scheduled_at))
                test.not_nil(after[1].wake_demand_at)
                local _, cleanup_err = sql.builder.update("kickside_job")
                    :set("status", "cancelled")
                    :where(sql.builder.eq({ id = id })):run_with(db):exec()
                test.is_nil(cleanup_err)

                local gone, gone_err = wake.wake_job(db, id, nil, dbtype)
                test.is_nil(gone_err)
                test.is_false(gone.woken)
                test.is_nil(gone.scheduled_at)
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
