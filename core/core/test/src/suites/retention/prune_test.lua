-- Batched event prune (design v4 §4.9): a contiguous prefix below the protected
-- floor and the age cutoff, at most batch_size rows per transaction, with
-- max_pruned_seq raised in the same transaction; a fully pruned thread keeps
-- its boundary; and a pin and a prune racing on one thread serialize on the
-- thread lock in either order. Runs on SQLite and PostgreSQL; on SQLite the
-- racing writer waits for the single connection instead of the row lock.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local pin = require("pin")
local prune = require("prune")
local append = require("append")
local prune_scaffold = require("prune_scaffold")

local open_db = prune_scaffold.open_db
local exec = prune_scaffold.exec
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
local missing_delete_executor = prune_scaffold.missing_delete_executor
local lower = prune_scaffold.lower
local function define_tests()
    test.describe("Retention prune", function()
        test.it("does not advance the watermark after an unproved event delete", function()
            local result, err = prune.prune_tx(missing_delete_executor(), uuid.v7(),
                { cutoff = ts(-1), batch_size = 1 })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INTERNAL)
        end)
        test.it("prunes the aged prefix and raises max_pruned_seq in the same transaction", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 6), 10)
            add_events(thread_id, range(7, 8), 0)

            local result, err = run_prune(thread_id)
            test.is_nil(err)
            test.eq(result.deleted, 6)
            test.eq(result.max_pruned_seq, 6)
            test.eq(boundary_of(thread_id), 6)
            local left = seqs_of(thread_id)
            test.eq(#left, 2)
            test.eq(left[1], 7)
        end)

        test.it("uses the shared prune path after the PostgreSQL helper is removed", function()
            if dialect() ~= sql.type.POSTGRES then return end
            local thread_id = make_thread()
            add_events(thread_id, { 1, 2 }, 10)
            exec("DROP FUNCTION IF EXISTS kickside_prune_event_batch(UUID,TIMESTAMPTZ,INTEGER)", {})
            local result, err = run_prune(thread_id, 1)
            test.is_nil(err)
            test.eq(result.deleted, 2)
            test.eq(boundary_of(thread_id), 2)
            test.eq(#seqs_of(thread_id), 0)
        end)

        test.it("stops at the first event inside the retention window", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 3), 10)
            add_events(thread_id, { 4 }, 0)
            add_events(thread_id, range(5, 6), 10)

            local result = run_prune(thread_id)
            test.eq(result.deleted, 3)
            test.eq(boundary_of(thread_id), 3)
            test.eq(#seqs_of(thread_id), 3)
        end)

        test.it("never prunes above the lowest retention pin", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 10), 10)
            test.is_nil(select(2, lower(thread_id, 1, 4)))

            local result = run_prune(thread_id)
            test.eq(result.deleted, 4)
            test.eq(boundary_of(thread_id), 4)
            test.eq(seqs_of(thread_id)[1], 5)
        end)

        test.it("keeps paused consumer evidence until the pin advances while appends continue", function()
            local thread_id = make_thread()
            add_events(thread_id, { 1 }, 10)
            local receipt, pin_err = lower(thread_id, 1, 0)
            test.is_nil(pin_err)
            test.not_nil(receipt)
            local db = open_db()
            local tx = db:begin()
            local added, add_err = append.append_events_tx(tx, thread_id,
                { { type = "test:paused", body_json = "{}" } })
            test.is_nil(add_err)
            test.eq(added.inserted, 1)
            tx:commit()
            db:release()
            test.eq(run_prune(thread_id).deleted, 0)
            test.eq(#seqs_of(thread_id), 2)
            local pin_db = open_db()
            local raised, raise_err = pin.pin_raise(pin_db, { thread_id = thread_id,
                consumer_key = "drive:a", expected_pin_generation = receipt.pin_generation,
                new_cursor = 1 })
            pin_db:release()
            test.is_nil(raise_err)
            test.not_nil(raised)
            test.eq(run_prune(thread_id).deleted, 1)
            local left = seqs_of(thread_id)
            test.eq(#left, 1)
            test.eq(left[1], 2)
        end)

        test.it("deletes at most one batch per transaction", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 7), 10)

            local db = open_db()
            local tx = db:begin()
            local one, err = prune.prune_tx(tx, thread_id, { cutoff = ts(-1), batch_size = 3 })
            tx:commit()
            db:release()
            test.is_nil(err)
            test.eq(one.deleted, 3)
            test.eq(boundary_of(thread_id), 3)

            local rest = run_prune(thread_id, 3)
            test.eq(rest.deleted, 4)
            test.eq(boundary_of(thread_id), 7)
        end)

        test.it("releases the thread lock after a bounded delete even for a large requested batch", function()
            local thread_id = make_thread()
            add_bulk_events(thread_id, 501)
            local db = open_db()
            local tx = db:begin()
            local first, err = prune.prune_tx(tx, thread_id, { cutoff = ts(-1), batch_size = 5000 })
            test.is_nil(err)
            tx:commit()
            db:release()
            test.eq(first.deleted, 250)
            test.eq(boundary_of(thread_id), 250)
            local second, second_err = run_prune(thread_id, 5000)
            test.is_nil(second_err)
            -- prune_thread drains with more than one 250-row transaction.
            test.eq(second.deleted, 251)
            test.eq(boundary_of(thread_id), 501)
        end)

        test.it("bounds total work per sweep even when more than one batch is eligible", function()
            local thread_id = make_thread()
            add_bulk_events(thread_id, 5001)
            local first, first_err = run_prune(thread_id, 5000)
            test.is_nil(first_err)
            test.eq(first.deleted, 5000)
            test.eq(boundary_of(thread_id), 5000)
            test.eq(seqs_of(thread_id)[1], 5001)
            local second, second_err = run_prune(thread_id, 5000)
            test.is_nil(second_err)
            test.eq(second.deleted, 1)
            test.eq(boundary_of(thread_id), 5001)
        end)

        test.it("keeps the boundary of a fully pruned thread", function()
            local thread_id = make_thread()
            add_events(thread_id, range(1, 5), 10)
            local result = run_prune(thread_id)
            test.eq(result.deleted, 5)
            test.eq(#seqs_of(thread_id), 0)
            test.eq(boundary_of(thread_id), 5)

            local again = run_prune(thread_id)
            test.eq(again.deleted, 0)
            test.eq(again.max_pruned_seq, 5)
            test.eq(boundary_of(thread_id), 5)
            local _, below_err = lower(thread_id, 1, 4)
            test.not_nil(below_err)
            test.eq(below_err:details().reason, pin.REASON.BELOW_PRUNE)
        end)
    end)
end

return test.run_cases(define_tests)
