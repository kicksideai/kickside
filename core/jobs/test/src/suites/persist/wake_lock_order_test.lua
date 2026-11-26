local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local jobs = require("jobs")

local function slot_request(scope: string, key: string, wake_key: string): table
    return { namespace = "wake-lock-order", scope = scope, key = key,
        owner_locator = { kind = "test", id = scope }, job_type = "test.consumer",
        immutable_payload = { scope = scope, key = key }, slot = true, parked = true, wake_key = wake_key }
end

local function wake_generation(db, id: string): integer
    local rows = assert(db:query("SELECT wake_generation FROM kickside_job WHERE id=$1", { id }))
    return math.floor(tonumber(rows[1].wake_generation) or -1) :: integer
end

-- One caller transaction enqueues demand on an existing slot and then wakes
-- the slot's key, while another transaction wakes the same key.
local function wake_key_transaction(dbtype: string, key: string, done: any, backend: any)
    local db = assert(sql.get("app:db"))
    local tx = assert(db:begin())
    if backend then
        local rows = assert(tx:query("SELECT pg_backend_pid() AS pid"))
        backend:send(tonumber(rows[1].pid))
    end
    local result, err = jobs.wake_tx(tx, key, dbtype)
    if err then tx:rollback() else
        local _, commit_err = tx:commit()
        err = commit_err
    end
    db:release()
    done:send({ result = result, err = err })
end

local function await_lock_wait(db, pid: integer): boolean
    for _ = 1, 500 do
        local rows = assert(db:query("SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1", { pid }))
        if rows[1] and rows[1].wait_event_type == "Lock" then return true end
        time.sleep("10ms")
    end
    return false
end

local function define_tests()
    test.describe("wake lock order across caller calls", function()
        test.it("orders slot demand and a later wake against a concurrent wake of the same key", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local scope = uuid.v7()
            local key = "lock-order:" .. scope
            local first, first_err = jobs.enqueue(slot_request(scope, "first", key))
            test.is_nil(first_err)
            local second, second_err = jobs.enqueue(slot_request(scope, "second", key))
            test.is_nil(second_err)
            -- The demanded slot has the higher id, so the concurrent wake
            -- holds the lower slot while it waits for the demanded one.
            local demanded = first.id > second.id and "first" or "second"
            local demanded_id = first.id > second.id and first.id or second.id
            local other_id = first.id > second.id and second.id or first.id
            local request = slot_request(scope, demanded, key)
            request.demand = true

            local tx = assert(db:begin())
            local enqueued, enqueue_err = jobs.enqueue_tx(tx, dbtype, request)
            test.is_nil(enqueue_err)
            test.eq(enqueued.id, demanded_id)
            test.is_true(enqueued.existing)

            local done = channel.new(1)
            local waiting = true
            if dbtype == sql.type.POSTGRES then
                local backend = channel.new(1)
                coroutine.spawn(function() wake_key_transaction(dbtype, key, done, backend) end)
                waiting = await_lock_wait(db, backend:receive())
            end
            local woken, wake_err = jobs.wake_tx(tx, key, dbtype)
            if wake_err then tx:rollback() else
                local _, commit_err = tx:commit()
                wake_err = commit_err
            end
            if dbtype ~= sql.type.POSTGRES then wake_key_transaction(dbtype, key, done, nil) end
            local concurrent = done:receive()

            test.is_true(waiting, "the concurrent wake waits on a row lock")
            test.is_nil(wake_err, tostring(wake_err))
            test.is_nil(concurrent.err, tostring(concurrent.err))
            local generations = { [woken.demand_generation] = true, [concurrent.result.demand_generation] = true }
            test.is_true(generations[1] and generations[2], "both wakes publish one generation each")
            test.eq(wake_generation(db, demanded_id), 2)
            test.eq(wake_generation(db, other_id), 2)
            db:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
