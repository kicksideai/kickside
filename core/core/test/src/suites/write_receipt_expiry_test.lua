-- Write receipts are bounded by age expiry alone: a sink keeps reserving new
-- keys past any former per-sink count, same-key replay and concurrent first
-- reservations settle to one row, ambiguous pending rows wait for conclusive
-- evidence, and the receipt purge removes committed rows past the window.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local receipts = require("write_receipt")
local receipt_purge = require("receipt_purge")

local FORMER_RECEIPTS_PER_SINK = 100000

local function db(): sql.DB
    local handle, err = sql.get("app:db")
    if err or not handle then error("receipt database unavailable: " .. tostring(err)) end
    return handle :: sql.DB
end

local function reserve(handle: sql.DB, sink: string, key: string): (table?, any)
    local tx, begin_err = handle:begin()
    if begin_err or not tx then error("receipt reservation begin failed: " .. tostring(begin_err)) end
    local result, err = receipts.reserve(tx, { sink_id = sink, idempotency_key = key,
        identity_key = "record", payload_hash = "hash", created_at = "2000-01-01T00:00:00Z" })
    if err then
        tx:rollback()
        return nil, err
    end
    local _, commit_err = tx:commit()
    if commit_err then error("receipt reservation commit failed: " .. tostring(commit_err)) end
    return result, nil
end

local function physical(handle: sql.DB, sink: string): integer
    local rows, err = handle:query("SELECT COUNT(*) AS n FROM kickside_write_receipt WHERE sink_id=$1", { sink })
    if err then error("receipt physical count unavailable: " .. tostring(err)) end
    return math.floor(tonumber(rows[1].n) :: number)
end

local function seed_committed(handle: sql.DB, sink: string, count: integer, completed_at: string): integer
    local statement: string
    if tostring(handle:type()) == sql.type.POSTGRES then
        statement = [[INSERT INTO kickside_write_receipt
            (sink_id,idempotency_key,identity_key,payload_hash,status,created_at,completed_at)
            SELECT $1,'seed-' || n::text,'record-' || n::text,'hash','committed',$2,$2
            FROM generate_series(1,]] .. tostring(count) .. [[) AS n]]
    else
        statement = [[WITH RECURSIVE numbered(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbered WHERE n<]]
            .. tostring(count) .. [[)
            INSERT INTO kickside_write_receipt
            (sink_id,idempotency_key,identity_key,payload_hash,status,created_at,completed_at)
            SELECT $1,'seed-' || n,'record-' || n,'hash','committed',$2,$2 FROM numbered]]
    end
    local seeded, err = handle:execute(statement, { sink, completed_at })
    if err then error("receipt seed failed: " .. tostring(err)) end
    return math.floor(tonumber(seeded.rows_affected) :: number)
end

local function define_tests()
    test.describe("write receipts bounded by age expiry", function()
        test.it("reserves new keys for a sink holding more receipts than any former per-sink count", function()
            local sink = "sink:" .. uuid.v7()
            local handle = db()
            test.eq(seed_committed(handle, sink, FORMER_RECEIPTS_PER_SINK, "2000-01-01T00:00:00Z"),
                FORMER_RECEIPTS_PER_SINK)
            local first, first_err = reserve(handle, sink, "fresh-1")
            test.is_nil(first_err)
            test.eq(first.state, "reserved")
            local second, second_err = reserve(handle, sink, "fresh-2")
            test.is_nil(second_err)
            test.eq(second.state, "reserved")
            test.eq(physical(handle, sink), FORMER_RECEIPTS_PER_SINK + 2)
            local cleared, clear_err = handle:execute("DELETE FROM kickside_write_receipt WHERE sink_id=$1", { sink })
            test.is_nil(clear_err)
            test.eq(tonumber(cleared.rows_affected), FORMER_RECEIPTS_PER_SINK + 2)
            handle:release()
        end)

        test.it("purges committed receipts past the window and keeps pending ones", function()
            local sink = "sink:" .. uuid.v7()
            local handle = db()
            test.eq(seed_committed(handle, sink, 600, "2000-01-01T00:00:00Z"), 600)
            local pending, pending_err = reserve(handle, sink, "pending")
            test.is_nil(pending_err)
            test.eq(pending.state, "reserved")
            local cutoff = time.now():utc():format(time.RFC3339)
            local total = 0
            while true do
                local purged, purge_err = receipt_purge.run(handle, cutoff, 500)
                test.is_nil(purge_err)
                if purged.deleted == 0 then break end
                total = total + purged.deleted
            end
            handle:release()
            local restarted = db()
            local remaining, read_err = restarted:query([[SELECT idempotency_key,status
                FROM kickside_write_receipt WHERE sink_id=$1]], { sink })
            restarted:release()
            test.is_nil(read_err)
            test.eq(#remaining, 1)
            test.eq(remaining[1].idempotency_key, "pending")
            test.eq(remaining[1].status, "pending")
        end)

        test.it("replays changed and repeated keys of one sink as separate rows without duplicates", function()
            local sink = "sink:" .. uuid.v7()
            local handle = db()
            local first, first_err = reserve(handle, sink, "rev-1")
            test.is_nil(first_err)
            test.eq(first.state, "reserved")
            local replay, replay_err = reserve(handle, sink, "rev-1")
            test.is_nil(replay_err)
            test.eq(replay.state, "pending")
            local changed, changed_err = reserve(handle, sink, "rev-2")
            test.is_nil(changed_err)
            test.eq(changed.state, "reserved")
            handle:release()
            local restarted = db()
            test.eq(physical(restarted, sink), 2)
            restarted:release()
        end)

        test.it("keeps ambiguous pending evidence until conclusive absence deletes it", function()
            local sink = "sink:" .. uuid.v7()
            local handle = db()
            local first, first_err = reserve(handle, sink, "orphan")
            test.is_nil(first_err)
            test.eq(first.state, "reserved")
            local unresolved, unresolved_err = receipts.resolve_pending({
                sink_id = sink, idempotency_key = "orphan", config = {},
                reconcile_binding = { lookup = function(): (table?, any)
                    return { state = "unresolved" }, nil
                end } })
            test.is_nil(unresolved_err)
            test.eq(unresolved.state, "unresolved")
            local failed, failed_err = receipts.resolve_pending({
                sink_id = sink, idempotency_key = "orphan", config = {},
                reconcile_binding = { lookup = function(): (table?, any)
                    return nil, errors.new({ message = "provider unavailable", kind = errors.UNAVAILABLE })
                end } })
            test.is_nil(failed)
            test.not_nil(failed_err)
            test.eq(physical(handle, sink), 1)
            local settled, settle_err = receipts.resolve_pending({
                sink_id = sink, idempotency_key = "orphan", config = {},
                reconcile_binding = { lookup = function(): (table?, any)
                    return { state = "settled_absent" }, nil
                end } })
            test.is_nil(settle_err)
            test.eq(settled.state, "absent")
            test.eq(physical(handle, sink), 0)
            handle:release()
        end)

        test.it("accepts concurrent new keys of one sink", function()
            local sink = "sink:" .. uuid.v7()
            local done = channel.new(2)
            for _, key in ipairs({ "second", "third" }) do
                coroutine.spawn(function()
                    local worker = db()
                    local result, err = reserve(worker, sink, key)
                    worker:release()
                    done:send({ result = result, err = err })
                end)
            end
            for _ = 1, 2 do
                local outcome = done:receive()
                test.is_nil(outcome.err)
                test.eq(outcome.result.state, "reserved")
            end
            local restarted = db()
            test.eq(physical(restarted, sink), 2)
            restarted:release()
        end)

        test.it("settles a concurrent same-key reservation to one row and one replay", function()
            local sink = "sink:" .. uuid.v7()
            local done = channel.new(2)
            for _ = 1, 2 do
                coroutine.spawn(function()
                    local worker = db()
                    local result, err = reserve(worker, sink, "shared-key")
                    worker:release()
                    done:send({ result = result, err = err })
                end)
            end
            local reserved, replayed = 0, 0
            for _ = 1, 2 do
                local outcome = done:receive()
                test.is_nil(outcome.err)
                if outcome.result.state == "reserved" then reserved = reserved + 1
                elseif outcome.result.state == "pending" then replayed = replayed + 1 end
            end
            test.eq(reserved, 1)
            test.eq(replayed, 1)
            local restarted = db()
            test.eq(physical(restarted, sink), 1)
            restarted:release()
        end)
    end)
end

return { run = test.run_cases(define_tests) }
