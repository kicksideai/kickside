-- Shared write receipts over kickside_write_receipt (core DB, lane U).
-- One reservation/commit implementation for writables without a durable
-- store of their own. Frozen contract: CONTRACTS sections 2 (signatures),
-- 4 (idempotency_conflict is a writable-only deterministic code), 11
-- (identity/hash semantics), 12 (reconciliation outcomes), 18-19
-- (retention); table and indexes: DDL core 08; semantics: v4 sections 4.6
-- (prepared output and declared delivery) and 5.6 (receipt table).
-- Every function returns (value, err). The tx variants run only on the
-- caller-provided executor and never acquire a connection or invoke
-- contract entries, funcs, processes or providers. resolve_pending
-- reconciles through the caller's reconcile binding outside every SQL
-- transaction.

local sql = require("sql")
local json = require("json")
local core_db = require("core_db")
local retention_policy = require("retention_policy")
local retention_notifier = require("retention_notifier")
local sql_boundary = require("sql_boundary")

local M = {}

local TABLE = "kickside_write_receipt"
local STATE_ABSENT = "absent"
local STATE_PENDING = "pending"
local STATE_COMMITTED = "committed"
local STATE_RESERVED = "reserved"
local STATE_UNRESOLVED = "unresolved"

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function invalid(message: string): any
    return (errors.new({ message = message, kind = errors.INVALID }) :: any)
end

local function internal(message: string): any
    return (errors.new({ message = message, kind = errors.INTERNAL }) :: any)
end

-- Same-key/different-hash (or different-identity) signal. This is a
-- classifier-first DataError table, not a typed error: errors.new returns
-- userdata that cannot carry the frozen code, and the classifier derives
-- kind and terminality from code=idempotency_conflict (CONTRACTS section 4).
-- Consumers match on .code; .kind mirrors the mapped CONFLICT kind.
local function conflict(sink_id: string, key: string, detail: string): table
    return {
        code = "idempotency_conflict",
        kind = errors.CONFLICT,
        message = "idempotency_conflict for sink " .. sink_id .. " key " .. key .. ": " .. detail,
    }
end

-- Always returns a string: the empty value on the error path is never used,
-- since every caller returns early on err. This keeps validated identifiers
-- statically strings without a cast at each call site.
local function clean(value: any, name: string): (string, any)
    local text = trim(value)
    if text == "" then return "", invalid(name .. " is required") end
    return text, nil
end

-- load_row reads one receipt. With lock, a PostgreSQL transaction holds the
-- row until it commits, so a concurrent commit or settlement of the same key
-- serializes behind it; SQLite serializes every write on its one connection.
local function load_row(exec: any, sink_id: string, key: string, lock: boolean?): (table?, any)
    local suffix = ""
    if lock then
        local dbtype, type_err = exec:db_type()
        if type_err then return nil, errors.wrap(type_err, "failed to resolve write receipt dialect") end
        if tostring(dbtype) == sql.type.POSTGRES then suffix = " FOR UPDATE" end
    end
    local rows, err = exec:query([[SELECT sink_id,idempotency_key,identity_key,payload_hash,status,
        dest_refs_json,outcome_json,created_at,completed_at FROM kickside_write_receipt
        WHERE sink_id=$1 AND idempotency_key=$2]] .. suffix, { sink_id, key })
    if err then
        return nil, errors.wrap(err, "failed to read write receipt")
    end
    if not rows or #rows == 0 then return nil, nil end
    return rows[1], nil
end

local function with_core_db(operation: (any) -> (any?, any)): (any?, any)
    local db, get_err = sql.get(core_db.id())
    if get_err then return nil, errors.wrap(get_err, "failed to open Core database") end
    if not db then return nil, internal("failed to open Core database") end
    local result, operation_err = operation(db)
    db:release()
    return result, operation_err
end

-- Same key always names one delivery of one destination record: a hash or
-- identity mismatch is idempotency_conflict, never a replay (CONTRACTS 11).
local function match_row(row: table, sink_id: string, key: string, identity_key: string, payload_hash: string): any
    if row.payload_hash ~= payload_hash then
        return conflict(sink_id, key, "payload hash mismatch; never a replay")
    end
    if row.identity_key ~= identity_key then
        return conflict(sink_id, key, "identity key mismatch for one delivery")
    end
    return nil
end

local function decode_pair(row: table, sink_id: string, key: string): (table?, table?, any)
    local refs, refs_err = json.decode(row.dest_refs_json :: string)
    if refs_err ~= nil or type(refs) ~= "table" then
        return nil, nil, internal("corrupt dest_refs for sink " .. sink_id .. " key " .. key)
    end
    local outcome, outcome_err = json.decode(row.outcome_json :: string)
    if outcome_err ~= nil or type(outcome) ~= "table" then
        return nil, nil, internal("corrupt outcome for sink " .. sink_id .. " key " .. key)
    end
    return refs, outcome, nil
end

local function encode_field(value: any, name: string): (string?, any)
    if type(value) ~= "table" then return nil, invalid(name .. " must be a table") end
    local text, err = json.encode(value)
    if err ~= nil or type(text) ~= "string" then
        return nil, invalid(name .. " is not JSON-encodable: " .. tostring(err))
    end
    return text, nil
end

-- Shared read of one row as a replay-shaped value: committed rows decode
-- their refs, pending rows report identity only, absent rows report absent.
local function describe_row(row: table?, sink_id: string, key: string): (table?, any)
    if row == nil then return { state = STATE_ABSENT }, nil end
    if row.status ~= STATE_COMMITTED then
        return { state = STATE_PENDING, identity_key = row.identity_key }, nil
    end
    local refs, outcome, err = decode_pair(row, sink_id, key)
    if err then return nil, err end
    return { state = STATE_COMMITTED, identity_key = row.identity_key, dest_refs = refs, outcome = outcome }, nil
end

local function same_reservation(row: table, expected: table): boolean
    return row.identity_key == expected.identity_key and row.payload_hash == expected.payload_hash
        and row.created_at == expected.created_at
end

-- replay(sink_id, key, hash): read-only same-key lookup on Core's own executor.
-- A hash mismatch is idempotency_conflict, never a replay of stored refs.
function M.replay(sink_id: string, idempotency_key: string, payload_hash: string): (table?, any)
    local sink, err = clean(sink_id, "sink_id")
    if err then return nil, err end
    local key, key_err = clean(idempotency_key, "idempotency_key")
    if key_err then return nil, key_err end
    local hash, hash_err = clean(payload_hash, "payload_hash")
    if hash_err then return nil, hash_err end
    local row, load_err = with_core_db(function(db)
        return load_row(db, sink :: string, key :: string)
    end)
    if load_err then return nil, load_err end
    if row ~= nil and row.payload_hash ~= hash then
        return nil, conflict(sink, key, "payload hash mismatch; never a replay")
    end
    return describe_row(row, sink, key)
end

-- reserve(tx, params): insert the pending row, or replay the existing one
-- when key, hash and identity all agree. params carries sink_id,
-- idempotency_key, identity_key, payload_hash and created_at.
function M.reserve(tx: any, params: table): (table?, any)
    params = type(params) == "table" and params or {}
    local sink, err = clean(params.sink_id, "sink_id")
    if err then return nil, err end
    local key, key_err = clean(params.idempotency_key, "idempotency_key")
    if key_err then return nil, key_err end
    local identity, identity_err = clean(params.identity_key, "identity_key")
    if identity_err then return nil, identity_err end
    local hash, hash_err = clean(params.payload_hash, "payload_hash")
    if hash_err then return nil, hash_err end
    local created_at, created_err = clean(params.created_at, "created_at")
    if created_err then return nil, created_err end
    local function replay_row(row: table): (table?, any)
        local mismatch = match_row(row, sink, key, identity, hash)
        if mismatch then return nil, mismatch end
        local seen, seen_err = describe_row(row, sink, key)
        if seen_err then return nil, seen_err end
        if seen.state == STATE_COMMITTED then return seen, nil end
        return { state = STATE_PENDING, identity_key = row.identity_key }, nil
    end
    local row, load_err = load_row(tx, sink, key, true)
    if load_err then return nil, load_err end
    if row ~= nil then return replay_row(row) end
    local size_err = retention_policy.check_row(sink .. ":" .. key,
        #sink + #key + #identity + #hash + #created_at + 11, "reserve_write_receipt")
    if size_err then return nil, size_err end
    -- A concurrent first reservation of the same key waits on the unique key
    -- and inserts nothing once it commits; the stored row then answers as a
    -- replay or an idempotency conflict.
    local inserted, insert_err = tx:execute([[INSERT INTO kickside_write_receipt
        (sink_id,idempotency_key,identity_key,payload_hash,status,dest_refs_json,outcome_json,created_at)
        VALUES ($1,$2,$3,$4,'pending','{}','{}',$5)
        ON CONFLICT(sink_id,idempotency_key) DO NOTHING]], { sink, key, identity, hash, created_at })
    if insert_err then
        return nil, errors.wrap(insert_err, "failed to reserve write receipt")
    end
    local count = inserted and tonumber(inserted.rows_affected)
    if count == nil then return nil, internal("write receipt reservation returned no row proof") end
    if count == 1 then return { state = STATE_RESERVED, identity_key = identity }, nil end
    local raced, raced_err = load_row(tx, sink, key, true)
    if raced_err then return nil, raced_err end
    if raced == nil then return nil, internal("write receipt vanished after a concurrent reservation") end
    return replay_row(raced)
end

-- commit(tx, params): move a pending row to committed under the same hash,
-- or replay an already committed row. params adds dest_refs, outcome and
-- completed_at to the reserve shape. Committing under a different hash is
-- idempotency_conflict and leaves the row untouched.
function M.commit(tx: any, params: table): (table?, any)
    params = type(params) == "table" and params or {}
    local sink, err = clean(params.sink_id, "sink_id")
    if err then return nil, err end
    local key, key_err = clean(params.idempotency_key, "idempotency_key")
    if key_err then return nil, key_err end
    local identity, identity_err = clean(params.identity_key, "identity_key")
    if identity_err then return nil, identity_err end
    local hash, hash_err = clean(params.payload_hash, "payload_hash")
    if hash_err then return nil, hash_err end
    local completed_at, completed_err = clean(params.completed_at, "completed_at")
    if completed_err then return nil, completed_err end
    local refs_json, refs_err = encode_field(params.dest_refs, "dest_refs")
    if refs_err then return nil, refs_err end
    local outcome_json, outcome_err = encode_field(params.outcome, "outcome")
    if outcome_err then return nil, outcome_err end
    local row, load_err = load_row(tx, sink, key, true)
    if load_err then return nil, load_err end
    if row == nil then
        return nil, (errors.new({ message = "no write reservation for sink " .. sink .. " key " .. key, kind = errors.NOT_FOUND }) :: any)
    end
    local mismatch = match_row(row, sink, key, identity, hash)
    if mismatch then return nil, mismatch end
    if row.status == STATE_COMMITTED then return describe_row(row, sink, key) end
    local row_size_err = retention_policy.check_row(sink .. ":" .. key,
        #sink + #key + #identity + #hash + #(refs_json :: string) + #(outcome_json :: string)
            + #row.created_at + #completed_at + 9, "commit_write_receipt")
    if row_size_err then return nil, row_size_err end
    local _, update_err = sql.builder.update(TABLE)
        :set("status", STATE_COMMITTED)
        :set("dest_refs_json", refs_json)
        :set("outcome_json", outcome_json)
        :set("completed_at", completed_at)
        :where(sql.builder.eq({ sink_id = sink, idempotency_key = key }))
        :run_with(tx)
        :exec()
    if update_err then
        return nil, errors.wrap(update_err, "failed to commit write receipt")
    end
    return { state = STATE_COMMITTED, identity_key = identity, dest_refs = params.dest_refs, outcome = params.outcome }, nil
end

local function abandon_settlement(tx: any, value: any?, primary: error?): (any?, error?)
    local err = sql_boundary.rollback(tx, primary, "failed to rollback settle transaction")
    if err then return nil, err end
    return value, nil
end

local function settle_committed(db: any, sink: string, key: string, expected: table,
    refs: table, outcome: table, completed_at: string): (table?, any)
    local prior, prior_err = load_row(db, sink, key)
    if prior_err then return nil, prior_err end
    if prior == nil then return { state = STATE_ABSENT }, nil end
    local tx, begin_err = db:begin()
    if begin_err then return nil, errors.wrap(begin_err, "failed to begin settle transaction") end
    local row, load_err = load_row(tx, sink, key, true)
    if load_err then return abandon_settlement(tx, nil, load_err) end
    if row == nil then return abandon_settlement(tx, {state = STATE_ABSENT}, nil) end
    if not same_reservation(row, expected) then
        return abandon_settlement(tx, nil, errors.new({message = "write receipt reservation changed during reconciliation",
            kind = errors.CONFLICT, retryable = true}))
    end
    if row.status == STATE_COMMITTED then
        local seen, seen_err = describe_row(row, sink, key)
        return abandon_settlement(tx, seen, seen_err)
    end
    local refs_json, refs_err = encode_field(refs, "dest_refs")
    if refs_err then return abandon_settlement(tx, nil, refs_err) end
    local outcome_json, outcome_err = encode_field(outcome, "outcome")
    if outcome_err then return abandon_settlement(tx, nil, outcome_err) end
    local row_size_err = retention_policy.check_row(sink .. ":" .. key,
        #sink + #key + #row.identity_key + #row.payload_hash + #(refs_json :: string)
            + #(outcome_json :: string) + #row.created_at + #completed_at + 9, "resolve_write_receipt")
    if row_size_err then return abandon_settlement(tx, nil, row_size_err) end
    local _, update_err = sql.builder.update(TABLE)
        :set("status", STATE_COMMITTED)
        :set("dest_refs_json", refs_json)
        :set("outcome_json", outcome_json)
        :set("completed_at", completed_at)
        :where(sql.builder.eq({ sink_id = sink, idempotency_key = key }))
        :run_with(tx)
        :exec()
    if update_err then return abandon_settlement(tx, nil, errors.wrap(update_err, "failed to settle write receipt")) end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "failed to commit settle transaction") end
    return { state = STATE_COMMITTED, identity_key = row.identity_key, dest_refs = refs, outcome = outcome }, nil
end

local function settle_absent(db: any, sink: string, key: string, expected: table): (table?, any)
    local prior, prior_err = load_row(db, sink, key)
    if prior_err then return nil, prior_err end
    if prior == nil then return { state = STATE_ABSENT }, nil end
    local tx, begin_err = db:begin()
    if begin_err then return nil, errors.wrap(begin_err, "failed to begin settle transaction") end
    local row, load_err = load_row(tx, sink, key, true)
    if load_err then return abandon_settlement(tx, nil, load_err) end
    if row == nil then return abandon_settlement(tx, {state = STATE_ABSENT}, nil) end
    if not same_reservation(row, expected) then
        return abandon_settlement(tx, nil, errors.new({message = "write receipt reservation changed during reconciliation",
            kind = errors.CONFLICT, retryable = true}))
    end
    if row.status == STATE_COMMITTED then
        local seen, seen_err = describe_row(row, sink, key)
        return abandon_settlement(tx, seen, seen_err)
    end
    local deleted, delete_err = sql.builder.delete(TABLE)
        :where(sql.builder.eq({ sink_id = sink, idempotency_key = key }))
        :run_with(tx)
        :exec()
    if delete_err then return abandon_settlement(tx, nil, errors.wrap(delete_err, "failed to clear write receipt")) end
    if not deleted or tonumber(deleted.rows_affected) ~= 1 then
        return abandon_settlement(tx, nil, internal("write receipt settlement returned no deletion proof"))
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "failed to commit settle transaction") end
    return { state = STATE_ABSENT }, nil
end

-- resolve_pending(params): reconcile one pending row against conclusive
-- provider evidence. params carries sink_id, idempotency_key, config,
-- reconcile_binding ({lookup} per CONTRACTS section 2) and, for the
-- settled-committed path, completed_at. Locally conclusive rows (absent or
-- committed) return without a provider call; a pending row calls lookup
-- with no SQL transaction open. settled_committed commits the row,
-- settled_absent deletes it so delivery may be retried, unresolved and
-- provider failures leave it pending and visible. Unknown lookup states
-- are INVALID: an ordinary miss is unresolved, never settled_absent.
function M.resolve_pending(params: table): (table?, any)
    params = type(params) == "table" and params or {}
    local sink, err = clean(params.sink_id, "sink_id")
    if err then return nil, err end
    local key, key_err = clean(params.idempotency_key, "idempotency_key")
    if key_err then return nil, key_err end
    if type(params.config) ~= "table" then return nil, invalid("config is required") end
    local binding = params.reconcile_binding
    if type(binding) ~= "table" or type(binding.lookup) ~= "function" then
        return nil, invalid("reconcile_binding.lookup is required")
    end
    local row, load_err = with_core_db(function(db)
        return load_row(db, sink :: string, key :: string)
    end)
    if load_err then return nil, load_err end
    if row == nil then return { state = STATE_ABSENT }, nil end
    if row.status == STATE_COMMITTED then return describe_row(row, sink, key) end
    local identity = row.identity_key :: string
    local found, lookup_err = binding.lookup({ config = params.config, idempotency_key = key, identity_key = identity })
    if lookup_err ~= nil then return nil, lookup_err end
    if type(found) ~= "table" or type(found.state) ~= "string" then
        return nil, invalid("reconcile lookup returned no settlement state")
    end
    if found.state == "settled_committed" then
        local completed_at, completed_err = clean(params.completed_at, "completed_at")
        if completed_err then return nil, completed_err end
        local refs = found.dest_refs
        if refs == nil then refs = {} end
        if type(refs) ~= "table" then return nil, invalid("settled dest_refs must be a table") end
        local outcome = found.outcome
        if outcome == nil then outcome = {} end
        if type(outcome) ~= "table" then return nil, invalid("settled outcome must be a table") end
        local settled, settle_err = with_core_db(function(db)
            return settle_committed(db, sink :: string, key :: string, row :: table,
                refs :: table, outcome :: table, completed_at :: string)
        end)
        if not settle_err then
            local _, notify_err = retention_notifier.notify({ kind = "receipt_resolution" })
            if notify_err then return nil, notify_err end
        end
        return settled, settle_err
    end
    if found.state == "settled_absent" then
        local settled, settle_err = with_core_db(function(db)
            return settle_absent(db, sink :: string, key :: string, row :: table)
        end)
        if not settle_err then
            local _, notify_err = retention_notifier.notify({ kind = "receipt_resolution" })
            if notify_err then return nil, notify_err end
        end
        return settled, settle_err
    end
    if found.state == STATE_UNRESOLVED then
        return { state = STATE_UNRESOLVED, evidence = found.evidence }, nil
    end
    return nil, invalid("unknown reconciliation state: " .. found.state)
end

return M
