local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local process = require("process")
local channel = require("channel")
local registry = require("registry")
local job_types = require("job_types")
local config = require("config")
local lifecycle = require("lifecycle")
local jobs = require("jobs")

local function make_thread(db): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({ id = id, thread_class = "test", component_id = id })
        :run_with(db):exec()
    if err then error("delivery notification thread setup failed: " .. tostring(err)) end
    return id
end

local function make_running_job(db, dbtype: string): table
    local id = uuid.v7()
    local token = uuid.v7()
    local _, err = sql.builder.insert("kickside_job")
        :set_map({
            id = id,
            owner_kind = "test",
            owner_id = "delivery_notification_test",
            job_identity = "7:oneshot" .. tostring(#id) .. ":" .. id .. tostring(#id) .. ":" .. id,
            thread_id = make_thread(db),
            job_type = "test.job",
            payload = "{}",
            status = job_types.JOB_STATE.RUNNING,
            attempts = 1,
            max_attempts = 3,
            queue_tier = job_types.QUEUE_TIER.LIVE,
            lease_token = token,
            execution_seq = 1,
            lease_until = lifecycle.future_string(dbtype, 60),
        })
        :run_with(db):exec()
    if err then error("delivery notification job setup failed: " .. tostring(err)) end
    return { id = id, lease_token = token, execution_seq = 1 }
end

local function with_registered_pool(fn)
    local previous_pid = process.registry.lookup(config.POOL_NAME, process.registry.CONSISTENT)
    local listener, listen_err = process.listen(config.WAKE_TOPIC)
    test.is_nil(listen_err)
    local registered, register_err = process.registry.register(config.POOL_NAME, nil, process.registry.CONSISTENT)
    test.is_nil(register_err)
    test.is_true(registered)
    fn(listener)
    process.registry.unregister(config.POOL_NAME, process.registry.CONSISTENT)
    if type(previous_pid) == "string" then
        local restored, restore_err = process.registry.register(config.POOL_NAME, previous_pid, process.registry.CONSISTENT)
        test.is_nil(restore_err)
        test.is_true(restored)
    end
    process.unlisten(listener)
end

local function discard_job(id: string): ()
    local _, cancel_err = jobs.cancel(id)
    test.is_nil(cancel_err)
end

local function define_tests()
    test.describe("jobs migration order", function()
    end)

    test.describe("jobs transition pool notices", function()
        test.it("notifies the pool after a due completion rearm commits", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local job = make_running_job(db, dbtype)
            db:release()

            with_registered_pool(function(listener)
                local completed, complete_err = jobs.complete(job.id,
                    { token = job.lease_token, execution_seq = 1 },
                    { rearm = lifecycle.format_time(dbtype, time.now()) })
                local notice = channel.select({ listener:case_receive(), default = true })
                test.is_nil(complete_err)
                test.eq(completed.status, "rearmed")
                test.eq(notice.channel, listener)
                discard_job(job.id)
            end)
        end)

        -- Audit #6 removes the public exact-id claim/fail path: jobs.fail is
        -- no longer callable outside the supervised worker loop. Infrastructure
        -- retries now transition through worker_completion.fail_job,
        -- and the pool recomputes its own due-work deadline on its next loop
        -- iteration instead of receiving a push notice from an external caller.
    end)
end

return test.run_cases(define_tests)
