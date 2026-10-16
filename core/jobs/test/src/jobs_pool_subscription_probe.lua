-- A supervised test process whose pool subscription always fails. Each start
-- records its PID so the suite can observe a real process.service retry.
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local time = require("time")
local worker_pool = require("worker_pool")

local POOL_TEST_CLIENT = "app:jobs_pool_subscription_test"
local ATTEMPT_TOPIC = "pool.subscription.attempt"

local function run(): (any?, error?)
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, db_err end
    local _, insert_err = db:execute("INSERT INTO jobs_pool_subscription_attempt (id,pid) VALUES ($1,$2)",
        { uuid.v7(), tostring(process.pid()) })
    db:release()
    if insert_err then return nil, insert_err end
    local acknowledged = process.listen("pool.subscription.ack")
    local recipient, lookup_err = process.registry.lookup(POOL_TEST_CLIENT)
    if lookup_err or not recipient then
        process.unlisten(acknowledged)
        return nil, errors.new({ kind = errors.UNAVAILABLE,
            message = "pool test client unavailable: " .. tostring(lookup_err), retryable = true })
    end
    local _, signal_err = process.send(tostring(recipient), ATTEMPT_TOPIC, { pid = tostring(process.pid()) })
    if signal_err then process.unlisten(acknowledged); return nil, signal_err end
    local deadline = time.after("10s")
    local ack = channel.select({ acknowledged:case_receive(), deadline:case_receive() })
    process.unlisten(acknowledged)
    if ack.channel ~= acknowledged then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "pool probe start was not acknowledged", retryable = true })
    end
    local subscribe_err = errors.new({ kind = errors.UNAVAILABLE, message = "test subscription unavailable", retryable = true })
    return worker_pool.new({
        sql_get = function() error("pool read policy before subscribing") end,
        policy = function() error("pool read policy before subscribing") end,
        process = process,
        events = { subscribe = function() return nil, subscribe_err end },
    }).main()
end

return { run = run }
