local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local jobs = require("jobs")
local wake = require("wake")

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

-- A control wake of one job by id in its own transaction. A retryable
-- conflict rolls back and the wake runs once more in a fresh transaction.
local function wake_job_transaction(dbtype: string, id: string, done: any, backend: any)
    local db = assert(sql.get("app:db"))
    local attempts = {}
    for attempt = 1, 2 do
        local tx = assert(db:begin())
        if backend and attempt == 1 then
            local rows = assert(tx:query("SELECT pg_backend_pid() AS pid"))
            backend:send(tonumber(rows[1].pid))
        end
        local result, err = wake.wake_job(tx, id, { control = true }, dbtype)
        if err then tx:rollback() else
            local _, commit_err = tx:commit()
            err = commit_err
        end
        attempts[attempt] = { result = result, err = err }
        if not (err and errors.is(err, errors.CONFLICT) and err:retryable() == true) then break end
    end
    db:release()
    done:send(attempts)
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

        test.it("a wake that observes a concurrently moved wake key retries into the moved key", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local scope = uuid.v7()
            local from_key, to_key = "lock-order:" .. scope .. ":a", "lock-order:" .. scope .. ":b"
            local slot, slot_err = jobs.enqueue(slot_request(scope, "moved", from_key))
            test.is_nil(slot_err)

            local tx = assert(db:begin())
            local moved, move_err = jobs.enqueue_tx(tx, dbtype, slot_request(scope, "moved", to_key))
            test.is_nil(move_err)
            test.eq(moved.id, slot.id)

            local done = channel.new(1)
            local waiting = true
            if dbtype == sql.type.POSTGRES then
                local backend = channel.new(1)
                coroutine.spawn(function() wake_job_transaction(dbtype, slot.id, done, backend) end)
                waiting = await_lock_wait(db, backend:receive())
            end
            assert(tx:commit())
            if dbtype ~= sql.type.POSTGRES then wake_job_transaction(dbtype, slot.id, done, nil) end
            local attempts = done:receive()

            test.is_true(waiting, "the wake waits on the wake row of the key it observed")
            local final = attempts[#attempts]
            if dbtype == sql.type.POSTGRES then
                test.eq(#attempts, 2)
                local conflict = attempts[1].err
                test.not_nil(conflict)
                test.is_true(errors.is(conflict, errors.CONFLICT), tostring(conflict))
                test.is_true(conflict:retryable())
                test.eq(conflict:details().job_id, slot.id)
            else
                test.eq(#attempts, 1)
            end
            test.is_nil(final.err, tostring(final.err))
            test.is_true(final.result.woken)
            local rows = assert(db:query("SELECT wake_key, wake_enabled FROM kickside_job WHERE id=$1", { slot.id }))
            test.eq(rows[1].wake_key, to_key)
            db:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
