-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
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
        backend:send(assert(math.tointeger(rows[1].pid)))
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
            backend:send(assert(math.tointeger(rows[1].pid)))
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
        test.it("repeated addressed wakes leave an existing fanout row untouched", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local key = "repeated-lock:" .. uuid.v7()
            local slot = assert(jobs.enqueue(slot_request(key, "slot", key)))
            local tx = assert(db:begin())
            assert(tx:execute("INSERT INTO kickside_wake_fanout(key) VALUES ($1) ON CONFLICT(key) DO NOTHING", {key}))
            local inspect = "SELECT demand_generation,ack_generation FROM kickside_wake_fanout WHERE key=$1"
            if dbtype == sql.type.POSTGRES then
                inspect = "SELECT ctid::text AS version,demand_generation,ack_generation FROM kickside_wake_fanout WHERE key=$1"
            end
            local before = assert(tx:query(inspect, {key}))[1]
            for _ = 1, 32 do assert(wake.wake_job(tx, slot.id, { control = true }, dbtype)) end
            local after = assert(tx:query(inspect, {key}))
            test.eq(#after, 1)
            test.eq(after[1].version, before.version)
            test.eq(after[1].demand_generation, before.demand_generation)
            test.eq(after[1].ack_generation, before.ack_generation)
            local addressed = { control = true, ensure_due = true }
            assert(wake.wake_job(tx, slot.id, addressed, dbtype))
            local job_sql = dbtype == sql.type.POSTGRES
                and "SELECT ctid::text AS version,dispatch_requested_at FROM kickside_job WHERE id=$1"
                or "SELECT dispatch_requested_at FROM kickside_job WHERE id=$1"
            local first = assert(tx:query(job_sql, {slot.id}))[1]
            test.not_nil(first.dispatch_requested_at)
            for _ = 1, 32 do assert(wake.wake_job(tx, slot.id, addressed, dbtype)) end
            local last = assert(tx:query(job_sql, {slot.id}))[1]
            test.eq(last.version, first.version)
            test.eq(tostring(last.dispatch_requested_at), tostring(first.dispatch_requested_at))
            tx:rollback()
            db:release()
        end)

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

        test.it("retries wake-key convergence when the observed slot settles before its lock", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local scope = uuid.v7()
            local original = assert(jobs.enqueue(slot_request(scope, "settled", scope .. ":a")))
            local request = slot_request(scope, "settled", scope .. ":b")
            local tx = assert(db:begin())
            assert(tx:execute("UPDATE kickside_job SET status='cancelled' WHERE id=$1", {original.id}))
            if dbtype == sql.type.POSTGRES then
                local backend, done = channel.new(1), channel.new(1)
                coroutine.spawn(function()
                    local other = assert(sql.get("app:db"))
                    local writer = assert(other:begin())
                    local rows = assert(writer:query("SELECT pg_backend_pid() AS pid"))
                    backend:send(assert(math.tointeger(rows[1].pid)))
                    local result, err = jobs.enqueue_tx(writer, dbtype, request)
                    writer:rollback()
                    other:release()
                    done:send({result = result, err = err})
                end)
                local waiting = await_lock_wait(db, backend:receive())
                assert(tx:commit())
                local attempt = done:receive()
                test.is_true(waiting)
                test.is_nil(attempt.result)
                test.not_nil(attempt.err)
                test.is_true(errors.is(attempt.err, errors.CONFLICT))
                test.is_true(attempt.err:retryable())
            else
                assert(tx:commit())
            end
            local fresh = assert(jobs.enqueue(request))
            test.is_true(fresh.id ~= original.id)
            local rows = assert(db:query("SELECT wake_key FROM kickside_job WHERE id=$1", {fresh.id}))
            test.eq(rows[1].wake_key, request.wake_key)
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
