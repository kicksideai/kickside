-- Shared write receipt suite (lane U).
-- Same-key replay, hash conflict, pending ambiguity, conclusive
-- reconciliation and safe retention (PLAN row U; CONTRACTS 2, 4, 11, 12,
-- 18-19; DDL core 08). The kickside_write_receipt table is created by the
-- core 08 migration; the suite relies on it and asserts its conformance.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local write_receipt = require("write_receipt")
local receipt_purge = require("receipt_purge")

local function get_db()
    local db, err = sql.get("app:db")
    if err then error("sql.get(app:db) failed: " .. tostring(err)) end
    return db
end
local function fresh(prefix: string): string return prefix .. uuid.v7() end
local function in_tx(db: any, fn: (any) -> (any, any)): (any, any)
    local tx, begin_err = db:begin()
    if begin_err then error("begin failed: " .. tostring(begin_err)) end
    local value, err = fn(tx)
    if err then tx:rollback() return nil, err end
    local _, commit_err = tx:commit()
    if commit_err then error("commit failed: " .. tostring(commit_err)) end
    return value, nil
end
local function reserve(db: any, params: table): (any, any)
    return in_tx(db, function(tx) return write_receipt.reserve(tx, params) end)
end
local function commit(db: any, params: table): (any, any)
    return in_tx(db, function(tx) return write_receipt.commit(tx, params) end)
end
local function row_count(db: any, sink: string, key: string): number
    local rows, err = db:query("SELECT COUNT(*) AS n FROM kickside_write_receipt WHERE sink_id = $1 AND idempotency_key = $2", { sink, key })
    if err then error("count failed: " .. tostring(err)) end
    return tonumber(rows[1].n) or 0
end
local function stored_row(db: any, sink: string, key: string): table?
    local rows, err = db:query("SELECT * FROM kickside_write_receipt WHERE sink_id = $1 AND idempotency_key = $2", { sink, key })
    if err then error("read failed: " .. tostring(err)) end
    local row = rows[1] :: table?
    return row
end
-- Conflict errors are classifier-first DataError tables (CONTRACTS section 4):
-- .code plus a .kind string field, never a typed error :kind() call.
local function assert_conflict(err: any)
    test.not_nil(err)
    test.eq(type(err), "table")
    test.eq(err.code, "idempotency_conflict")
    test.eq(err.kind, errors.CONFLICT)
    test.is_true(type(err.message) == "string" and #err.message > 0)
end
-- Scripted provider settlement lookup double.
local function scripted_lookup(steps: { table }): (table, { table })
    local calls: { table } = {}
    local double = {}
    function double.lookup(req: table): (table?, any)
        calls[#calls + 1] = req
        local step = steps[#calls]
        if step == nil then error("lookup called more times than scripted") end
        if step.err ~= nil then return nil, step.err end
        local result = step.result :: table?
        return result, nil
    end
    return double, calls
end
local T0 = "2026-09-25T10:00:00.000000Z"
local T1 = "2026-09-25T10:00:01.000000Z"
local T2 = "2026-09-25T11:00:00.000000Z"
local function define_tests()
    test.describe("write receipt DDL conformance", function()
        test.it("enforces the frozen status and completion CHECKs", function()
            local db = get_db()
            local sink = fresh("sink:")
            local _, bad_status = db:query("INSERT INTO kickside_write_receipt(sink_id,idempotency_key,identity_key,payload_hash,status,created_at) VALUES ($1,$2,$3,$4,$5,$6)", { sink, "k", "id", "h", "bogus", T0 })
            test.not_nil(bad_status)
            local _, committed_open = db:query("INSERT INTO kickside_write_receipt(sink_id,idempotency_key,identity_key,payload_hash,status,created_at) VALUES ($1,$2,$3,$4,$5,$6)", { sink, "k2", "id", "h", "committed", T0 })
            test.not_nil(committed_open)
            local _, pending_closed = db:query("INSERT INTO kickside_write_receipt(sink_id,idempotency_key,identity_key,payload_hash,status,created_at,completed_at) VALUES ($1,$2,$3,$4,$5,$6,$7)", { sink, "k3", "id", "h", "pending", T0, T1 })
            test.not_nil(pending_closed)
            test.eq(row_count(db, sink, "k"), 0)
            db:release()
        end)
        test.it("creates both frozen partial indexes", function()
            local db = get_db()
            local names: { [string]: boolean } = {}
            if tostring(db:type()) == sql.type.SQLITE then
                local rows, err = db:query("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'kickside_write_receipt'")
                if err then error(tostring(err)) end
                for _, r in ipairs(rows) do names[r.name] = true end
            else
                local rows, err = db:query("SELECT indexname AS name FROM pg_indexes WHERE tablename = 'kickside_write_receipt'")
                if err then error(tostring(err)) end
                for _, r in ipairs(rows) do names[r.name] = true end
            end
            test.is_true(names["idx_write_receipt_committed"] == true)
            test.is_true(names["idx_write_receipt_pending"] == true)
            db:release()
        end)
    end)
    test.describe("replay", function()
        test.it("reports absent for an unknown key", function()
            local db = get_db()
            local found, err = write_receipt.replay(fresh("sink:"), "nope", "h")
            test.is_nil(err)
            test.eq(found.state, "absent")
            db:release()
        end)
        test.it("rejects empty identifiers", function()
            local db = get_db()
            local _, err = write_receipt.replay("", "k", "h")
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            local _, err2 = write_receipt.replay("s", "  ", "h")
            test.eq(err2:kind(), errors.INVALID)
            db:release()
        end)
    end)
    test.describe("reserve (same-key replay)", function()
        test.it("reserves a new key as pending", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            local res, err = reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            test.is_nil(err)
            test.eq(res.state, "reserved")
            local row = stored_row(db, sink, key)
            test.eq(row.status, "pending")
            test.eq(row.identity_key, "order-1")
            test.eq(row.payload_hash, "h1")
            test.is_nil(row.completed_at)
            db:release()
        end)
        test.it("replays a pending key with the same hash", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local seen, err = write_receipt.replay(sink, key, "h1")
            test.is_nil(err)
            test.eq(seen.state, "pending")
            test.eq(seen.identity_key, "order-1")
            local again, err2 = reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            test.is_nil(err2)
            test.eq(again.state, "pending")
            test.eq(row_count(db, sink, key), 1)
            db:release()
        end)
        test.it("conflicts when the same key carries a different hash", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local _, err = reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h2", created_at = T0 })
            assert_conflict(err)
            local row = stored_row(db, sink, key)
            test.eq(row.status, "pending")
            test.eq(row.payload_hash, "h1")
            local _, replay_err = write_receipt.replay(sink, key, "h2")
            assert_conflict(replay_err)
            db:release()
        end)
        test.it("conflicts when the same key names a different identity", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local _, err = reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-2", payload_hash = "h1", created_at = T0 })
            assert_conflict(err)
            test.eq(row_count(db, sink, key), 1)
            db:release()
        end)
        test.it("rejects reservations with missing fields", function()
            local db = get_db()
            local _, err = reserve(db, { sink_id = "", idempotency_key = "k", identity_key = "id", payload_hash = "h", created_at = T0 })
            test.eq(err:kind(), errors.INVALID)
            local _, err2 = reserve(db, { sink_id = "s", idempotency_key = "k", identity_key = "id", payload_hash = "h" })
            test.eq(err2:kind(), errors.INVALID)
            db:release()
        end)
        test.it("reserves and commits a local effect in one transaction", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            local done, err = in_tx(db, function(tx)
                local res, res_err = write_receipt.reserve(tx, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
                if res_err then return nil, res_err end
                test.eq(res.state, "reserved")
                return write_receipt.commit(tx, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "r1" }, outcome = { ok = true }, completed_at = T1 })
            end)
            test.is_nil(err)
            test.eq(done.state, "committed")
            test.eq(done.dest_refs.ref, "r1")
            db:release()
        end)
    end)
    test.describe("commit", function()
        test.it("commits a pending key with the same hash", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local done, err = commit(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "r1" }, outcome = { ok = true }, completed_at = T1 })
            test.is_nil(err)
            test.eq(done.state, "committed")
            test.eq(done.dest_refs.ref, "r1")
            test.eq(done.outcome.ok, true)
            local seen, seen_err = write_receipt.replay(sink, key, "h1")
            test.is_nil(seen_err)
            test.eq(seen.state, "committed")
            test.eq(seen.identity_key, "order-1")
            test.eq(seen.dest_refs.ref, "r1")
            test.eq(seen.outcome.ok, true)
            db:release()
        end)
        test.it("refuses to commit under a different hash and keeps the row pending", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local _, err = commit(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h2", dest_refs = { ref = "rx" }, outcome = {}, completed_at = T1 })
            assert_conflict(err)
            test.eq(stored_row(db, sink, key).status, "pending")
            db:release()
        end)
        test.it("replays a commit idempotently after a crash retry", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            commit(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "r1" }, outcome = { ok = true }, completed_at = T1 })
            local done, err = commit(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "r1" }, outcome = { ok = true }, completed_at = T1 })
            test.is_nil(err)
            test.eq(done.state, "committed")
            test.eq(done.dest_refs.ref, "r1")
            db:release()
        end)
        test.it("fails a commit with no reservation", function()
            local db = get_db()
            local _, err = commit(db, { sink_id = fresh("sink:"), idempotency_key = "ghost", identity_key = "order-9", payload_hash = "h", dest_refs = {}, outcome = {}, completed_at = T1 })
            test.not_nil(err)
            test.eq(err:kind(), errors.NOT_FOUND)
            db:release()
        end)
        test.it("requires completion evidence on commit", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local base = { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "r1" }, outcome = { ok = true } }
            local _, no_time = commit(db, base)
            test.eq(no_time:kind(), errors.INVALID)
            base.completed_at = T1
            base.dest_refs = nil
            local _, no_refs = commit(db, base)
            test.eq(no_refs:kind(), errors.INVALID)
            test.eq(stored_row(db, sink, key).status, "pending")
            db:release()
        end)
    end)
    test.describe("resolve_pending", function()
        test.it("reports absent without calling the provider", function()
            local db = get_db()
            local double, calls = scripted_lookup({})
            local res, err = write_receipt.resolve_pending({ sink_id = fresh("sink:"), idempotency_key = "ghost", config = { scope = "s" }, reconcile_binding = double })
            test.is_nil(err)
            test.eq(res.state, "absent")
            test.eq(#calls, 0)
            db:release()
        end)
        test.it("reports committed without calling the provider", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            commit(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "r1" }, outcome = { ok = true }, completed_at = T1 })
            local double, calls = scripted_lookup({})
            local res, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = double })
            test.is_nil(err)
            test.eq(res.state, "committed")
            test.eq(res.dest_refs.ref, "r1")
            test.eq(#calls, 0)
            db:release()
        end)
        test.it("settles a pending key as committed on conclusive evidence", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local double, calls = scripted_lookup({ { result = { state = "settled_committed", dest_refs = { ref = "remote-1" }, outcome = { ok = true }, evidence = { found = true } } } })
            local res, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = double, completed_at = T2 })
            test.is_nil(err)
            test.eq(res.state, "committed")
            test.eq(res.dest_refs.ref, "remote-1")
            test.eq(#calls, 1)
            test.eq(calls[1].idempotency_key, key)
            test.eq(calls[1].identity_key, "order-1")
            test.eq(calls[1].config.scope, "s")
            local row = stored_row(db, sink, key)
            test.eq(row.status, "committed")
            test.eq(row.completed_at, T2)
            db:release()
        end)
        test.it("clears a pending key as absent on conclusive absence", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local double, _ = scripted_lookup({ { result = { state = "settled_absent", evidence = { searched = true } } } })
            local res, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = double })
            test.is_nil(err)
            test.eq(res.state, "absent")
            test.eq(row_count(db, sink, key), 0)
            local retry, retry_err = reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T2 })
            test.is_nil(retry_err)
            test.eq(retry.state, "reserved")
            db:release()
        end)
        test.it("keeps a pending key visible when evidence is inconclusive", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local double, _ = scripted_lookup({ { result = { state = "unresolved", evidence = { in_flight = true } } } })
            local res, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = double })
            test.is_nil(err)
            test.eq(res.state, "unresolved")
            test.eq(stored_row(db, sink, key).status, "pending")
            db:release()
        end)
        test.it("propagates a provider failure and keeps the row pending", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local double, _ = scripted_lookup({ { err = "connection refused" } })
            local res, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = double })
            test.is_nil(res)
            test.not_nil(err)
            test.eq(stored_row(db, sink, key).status, "pending")
            db:release()
        end)
        test.it("never overwrites a commit that landed during lookup", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local racing = {}
            function racing.lookup(_: table): (table?, any)
                commit(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "winner" }, outcome = {}, completed_at = T1 })
                return { state = "settled_committed", dest_refs = { ref = "loser" }, outcome = {} }, nil
            end
            local res, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = racing, completed_at = T2 })
            test.is_nil(err)
            test.eq(res.state, "committed")
            test.eq(res.dest_refs.ref, "winner")
            db:release()
        end)
        test.it("never deletes a commit that landed during lookup", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local racing = {}
            function racing.lookup(_: table): (table?, any)
                commit(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", dest_refs = { ref = "r1" }, outcome = {}, completed_at = T1 })
                return { state = "settled_absent" }, nil
            end
            local res, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = racing })
            test.is_nil(err)
            test.eq(res.state, "committed")
            test.eq(row_count(db, sink, key), 1)
            db:release()
        end)
        test.it("never settles a replacement reservation using earlier provider evidence", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "replacement"
            local initial, initial_err = reserve(db, { sink_id = sink,
                idempotency_key = key, identity_key = "record", payload_hash = "h1", created_at = T0 })
            test.is_nil(initial_err)
            test.eq(initial.state, "reserved")
            local racing = {}
            function racing.lookup(_: table): (table?, any)
                local cleared, clear_err = write_receipt.resolve_pending({
                    sink_id = sink, idempotency_key = key, config = {},
                    reconcile_binding = { lookup = function(): (table?, any)
                        return { state = "settled_absent" }, nil
                    end } })
                test.is_nil(clear_err)
                test.eq(cleared.state, "absent")
                local next_row, next_err = reserve(db, { sink_id = sink,
                    idempotency_key = key, identity_key = "record", payload_hash = "h1", created_at = T2 })
                test.is_nil(next_err)
                test.eq(next_row.state, "reserved")
                return { state = "settled_absent" }, nil
            end
            local result, err = write_receipt.resolve_pending({
                sink_id = sink, idempotency_key = key, config = {}, reconcile_binding = racing })
            test.is_nil(result)
            test.eq(err:kind(), errors.CONFLICT)
            test.eq(stored_row(db, sink, key).status, "pending")
            db:release()
        end)
        test.it("rejects an unknown reconciliation state without mutating", function()
            local db = get_db()
            local sink, key = fresh("sink:"), "k1"
            reserve(db, { sink_id = sink, idempotency_key = key, identity_key = "order-1", payload_hash = "h1", created_at = T0 })
            local double, _ = scripted_lookup({ { result = { state = "settled_maybe" } } })
            local _, err = write_receipt.resolve_pending({ sink_id = sink, idempotency_key = key, config = { scope = "s" }, reconcile_binding = double })
            test.eq(err:kind(), errors.INVALID)
            test.eq(stored_row(db, sink, key).status, "pending")
            db:release()
        end)
    end)
    test.describe("retention", function()
        test.it("keeps purge behind the core retention implementation", function()
            test.is_nil(write_receipt.purge)
        end)
        test.it("rejects a missing delete result instead of acknowledging cleanup", function()
            local executor = { execute = function(): (any, any) return nil, nil end }
            local result, err = receipt_purge.run(executor, T1, 500)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INTERNAL)
        end)
        test.it("purges only aged committed receipts and protects pending ones", function()
            local db = get_db()
            local sink = fresh("sink:")
            reserve(db, { sink_id = sink, idempotency_key = "old", identity_key = "a", payload_hash = "h", created_at = T0 })
            commit(db, { sink_id = sink, idempotency_key = "old", identity_key = "a", payload_hash = "h", dest_refs = {}, outcome = {}, completed_at = T0 })
            reserve(db, { sink_id = sink, idempotency_key = "fresh", identity_key = "b", payload_hash = "h", created_at = T2 })
            commit(db, { sink_id = sink, idempotency_key = "fresh", identity_key = "b", payload_hash = "h", dest_refs = {}, outcome = {}, completed_at = T2 })
            reserve(db, { sink_id = sink, idempotency_key = "stuck", identity_key = "c", payload_hash = "h", created_at = T0 })
            local purged, err = receipt_purge.run(db, T1, 500)
            test.is_nil(err)
            test.eq(purged.deleted, 1)
            test.eq(row_count(db, sink, "old"), 0)
            test.eq(row_count(db, sink, "fresh"), 1)
            test.eq(stored_row(db, sink, "stuck").status, "pending")
            db:release()
        end)
        test.it("requires a purge cutoff", function()
            local db = get_db()
            test.is_nil(write_receipt.purge)
            local _, missing_err = receipt_purge.run(db, "", 500)
            test.not_nil(missing_err)
            test.eq(missing_err:kind(), errors.INVALID)
            local _, unbounded_err = receipt_purge.run(db, T1, 501)
            test.not_nil(unbounded_err)
            test.eq(unbounded_err:kind(), errors.INVALID)
            db:release()
        end)
        test.it("purges at most the requested batch and drains on later passes", function()
            local db = get_db()
            local sink = fresh("sink:")
            local old, cutoff = "1980-01-01T00:00:00Z", "1990-01-01T00:00:00Z"
            for _, key in ipairs({ "one", "two", "three" }) do
                reserve(db, { sink_id = sink, idempotency_key = key, identity_key = key,
                    payload_hash = "h", created_at = old })
                commit(db, { sink_id = sink, idempotency_key = key, identity_key = key,
                    payload_hash = "h", dest_refs = {}, outcome = {}, completed_at = old })
            end
            local first, first_err = receipt_purge.run(db, cutoff, 2)
            test.is_nil(first_err)
            test.eq(first.deleted, 2)
            local remaining = 0
            for _, key in ipairs({ "one", "two", "three" }) do remaining = remaining + row_count(db, sink, key) end
            test.eq(remaining, 1)
            local second, second_err = receipt_purge.run(db, cutoff, 2)
            test.is_nil(second_err)
            test.is_true(second.deleted >= 1)
            for _, key in ipairs({ "one", "two", "three" }) do test.eq(row_count(db, sink, key), 0) end
            db:release()
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options)
    return run_cases(options)
end }
