-- Prune lock races and append serialization: a pin and a prune racing on one
-- thread serialize on the thread lock in either order, and racing appends
-- serialize on the thread lock into consecutive sequences.

local test = require("test")
local channel = require("channel")
local pin = require("pin")
local prune = require("prune")
local append = require("append")
local prune_scaffold = require("prune_scaffold")

local open_db = prune_scaffold.open_db
local query = prune_scaffold.query
local dialect = prune_scaffold.dialect
local ts = prune_scaffold.ts
local make_thread = prune_scaffold.make_thread
local add_events = prune_scaffold.add_events
local add_bulk_events = prune_scaffold.add_bulk_events
local range = prune_scaffold.range
local seqs_of = prune_scaffold.seqs_of
local boundary_of = prune_scaffold.boundary_of
local run_prune = prune_scaffold.run_prune
local lower = prune_scaffold.lower
local await_lock_waiter = prune_scaffold.await_lock_waiter
local function define_tests()
    test.describe("Retention prune concurrency", function()
        test.it("a pin that takes the thread lock first protects its cursor from the waiting prune", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 10), 10)
            local dbtype = dialect()

            local db = open_db()
            local tx = db:begin()
            local receipt, lower_err = pin.lower_tx(tx, { thread_id = thread_id, consumer_key = "drive:a",
                command_id = "cmd-1", command_generation = 1, target_cursor = 2 })
            test.is_nil(lower_err)
            test.eq(receipt.pin_generation, 1)

            local done = channel.new(1)
            coroutine.spawn(function()
                local result, err = run_prune(thread_id)
                done:send({ result = result, err = err })
            end)
            await_lock_waiter(dbtype)
            tx:commit()
            db:release()

            local outcome = done:receive()
            test.is_nil(outcome.err)
            test.eq(outcome.result.deleted, 2)
            test.eq(boundary_of(thread_id), 2)
            test.eq(seqs_of(thread_id)[1], 3)
        end)

        test.it("a pin that waits on a prune sees the advanced boundary and is refused", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 10), 10)
            local dbtype = dialect()

            local db = open_db()
            local tx = db:begin()
            local pruned, prune_err = prune.prune_tx(tx, thread_id, { cutoff = ts(-1) })
            test.is_nil(prune_err)
            test.eq(pruned.max_pruned_seq, 10)

            local done = channel.new(1)
            coroutine.spawn(function()
                local receipt, err = lower(thread_id, 1, 3)
                done:send({ receipt = receipt, err = err })
            end)
            await_lock_waiter(dbtype)
            tx:commit()
            db:release()

            local outcome = done:receive()
            test.is_nil(outcome.receipt)
            test.not_nil(outcome.err)
            test.eq(outcome.err:details().reason, pin.REASON.BELOW_PRUNE)
            test.eq(outcome.err:details().max_pruned_seq, 10)
            test.eq(#query("SELECT 1 AS one FROM kickside_retention_pin WHERE thread_id = $1", { thread_id }), 0)
        end)

        test.it("serializes append then prune on the thread lock", function()
            local thread_id = make_thread()
            add_events(thread_id, { 1 }, 10)
            local dbtype = dialect()
            local db = open_db()
            local tx = db:begin()
            local appended, append_err = append.append_events_tx(tx, thread_id,
                { { type = "test:fresh", body_json = "{}" } })
            test.is_nil(append_err)
            test.eq(appended.inserted, 1)
            local done = channel.new(1)
            coroutine.spawn(function()
                local result, err = run_prune(thread_id)
                done:send({ result = result, err = err })
            end)
            await_lock_waiter(dbtype)
            tx:commit()
            db:release()
            local outcome = done:receive()
            test.is_nil(outcome.err)
            test.eq(outcome.result.deleted, 1)
            test.eq(seqs_of(thread_id)[1], 2)
        end)

        test.it("serializes two racing appends into consecutive sequences", function()
            local thread_id = make_thread()
            local dbtype = dialect()
            local db = open_db()
            local tx = db:begin()
            local first, first_err = append.append_events_tx(tx, thread_id,
                { { type = "test:first", body_json = "{}" } })
            test.is_nil(first_err)
            test.eq(first.inserted, 1)
            local done = channel.new(1)
            coroutine.spawn(function()
                local other = open_db()
                local other_tx = other:begin()
                local result, err = append.append_events_tx(other_tx, thread_id,
                    { { type = "test:second", body_json = "{}" } })
                if err then other_tx:rollback() else other_tx:commit() end
                other:release()
                done:send({ result = result, err = err })
            end)
            await_lock_waiter(dbtype)
            tx:commit()
            db:release()
            local outcome = done:receive()
            test.is_nil(outcome.err)
            test.eq(outcome.result.inserted, 1)
            local seqs = seqs_of(thread_id)
            test.eq(#seqs, 2)
            test.eq(seqs[1], 1)
            test.eq(seqs[2], 2)
        end)

        test.it("accepts both racing appends past the former per-thread event count", function()
            local thread_id = make_thread()
            add_bulk_events(thread_id, 99999)
            local dbtype = dialect()
            local first_db = open_db()
            local first_tx = first_db:begin()
            local first, first_err = append.append_events_tx(first_tx, thread_id,
                { { type = "test:edge-first", body_json = "{}" } })
            test.is_nil(first_err)
            test.eq(first.inserted, 1)
            local done = channel.new(1)
            coroutine.spawn(function()
                local second_db = open_db()
                local second_tx = second_db:begin()
                local result, err = append.append_events_tx(second_tx, thread_id,
                    { { type = "test:edge-second", body_json = "{}" } })
                if err then second_tx:rollback() else second_tx:commit() end
                second_db:release()
                done:send({ result = result, err = err })
            end)
            await_lock_waiter(dbtype)
            first_tx:commit()
            first_db:release()
            local second = done:receive()
            test.is_nil(second.err)
            test.eq(second.result.inserted, 1)
            test.eq(second.result.max_seq, 100001)
            test.eq(#seqs_of(thread_id), 100001)
        end)
    end)
end

return test.run_cases(define_tests)
