-- Round commit (design v5 §4.2, §14 round lock path): one automation-DB
-- transaction locks the drive and requires that it still holds this round's
-- token, the captured revision, rewind and command generations, and no pending
-- command. Only then does it advance the acquisition position past the whole
-- page, consume a timer occurrence, record the ledger outcomes of the items it
-- did not deliver (they retry from the ledger in their record's order) and the
-- receipts of destinations that changed, settle prepared output, set phase,
-- next_run_at and the scheduled pass count, and release the token. A control that moved any fence discards the whole commit
-- (committed = false). The transaction calls no provider.
--
--   commit_tx(tx, round, result) -- a round that delivered its page
--   settle_tx(tx, round, failure) -- a round that failed before commit: the
--                                   drive keeps its position and occurrence,
--                                   records the failure and phase, and releases
--                                   its token
--   release_tx(tx, round)          -- an attempt with nothing to do releases its
--                                   token

local sql = require("sql")
local json = require("json")
local drive = require("drive")
local ledger = require("round_ledger")
local reconcile = require("round_reconcile")
local row_limit = require("row_limit")
local history = require("round_history")

local M = {}

type Map = { [string]: any }

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

-- fence_tx(tx, automation_id, drive_key, captured) -> the locked drive when it
-- still holds the round's fence (its round token and unexpired deadline,
-- revision, rewind and command generations, and no pending command), else
-- nil. The one round fence every round-owned write takes: commit, settlement,
-- release, and the pre-effect persistence of prepared output and uncertain
-- reservations. The round's job lease is read before each provider send
-- (round_write), outside any automation transaction (§14).
function M.fence_tx(tx: any, automation_id: string, drive_key: string, captured: Map): (Map?, error?)
    local locked, lock_err = drive.lock_tx(tx, automation_id, { drive_key })
    if lock_err then
        if errors.is(lock_err, errors.NOT_FOUND) then return nil, nil end
        return nil, lock_err
    end
    local d = (locked :: { [string]: Map })[drive_key]
    if not M.holds(d, captured) then return nil, nil end
    return d, nil
end

-- holds(d, captured) -> whether drive d still holds the round's fence: its
-- round token under the deadline the round was stamped with, not yet passed,
-- and the captured revision and generations with no pending command. The one
-- fence predicate fence_tx locks under and a pre-send check reads.
function M.holds(d: Map?, captured: Map): boolean
    if d == nil then return false end
    local r = d :: Map
    return r.round_token == captured.round_token and type(captured.round_until) == "string"
        and r.round_until == captured.round_until and captured.round_until > drive.utc_now()
        and r.revision == captured.revision
        and r.rewind_generation == captured.rewind_generation and r.command_generation == captured.command_generation
        and r.pending_command_id == nil
end

local function fenced_drive(tx: any, round: Map): (Map?, error?)
    return M.fence_tx(tx, round.automation_id, round.drive_key, round.captured :: Map)
end

local function write(tx: any, round: Map, fields: Map): error?
    local ok, err = drive.update_cas_tx(tx, round.automation_id, round.drive_key, { round_token = (round.captured :: Map).round_token }, fields)
    if err then return err end
    if not ok then return internal("drive fence moved under its lock", round.automation_id .. "/" .. round.drive_key) end
    return nil
end

-- The most rows one receipt or prepared statement writes.
local CHUNK = 100

-- placeholders(first, count) -> "$first, ..., $(first+count-1)".
local function placeholders(first: integer, count: integer): string
    local marks: { string } = {}
    for index = first, first + count - 1 do marks[#marks + 1] = "$" .. tostring(index) end
    return table.concat(marks, ", ")
end

-- record_receipts_tx writes the destinations the delivered items' receipts
-- name, rewriting a slot only when its destination, version or identity
-- changed or the running reconcile pass has not stamped it yet, and deletes
-- the slots a delivered delete removed (design v5 §5.3), then
-- deletes the items' prepared output, which the delivery settled (§5.4), in
-- the §14 round lock order: receipts, then prepared. Each is a bounded batch
-- statement per CHUNK rows, never a statement per destination.
local function record_receipts_tx(tx: any, round: Map, delivered: { Map }, pass_id: any): error?
    local upserts: { { any } } = {}
    local removals: { { any } } = {}
    local prepared: { string } = {}
    local seen_prepared: { [string]: boolean } = {}
    local receipt_keys: { string } = {}
    local seen_receipt: { [string]: boolean } = {}
    -- One round writes each (item_key, map_slot) at most once; two delivery
    -- identities of one item naming the same slot have no defined order.
    local seen_slots: { [string]: boolean } = {}
    local function add_prepared(key: any): ()
        if type(key) == "string" and key ~= "" and not seen_prepared[key] then
            seen_prepared[key] = true
            prepared[#prepared + 1] = key
        end
    end
    for _, entry in ipairs(delivered) do
        local item = entry.item :: Map
        add_prepared(entry.prepared_key)
        add_prepared(entry.original_prepared_key)
        for _, r in ipairs((entry.receipts or {}) :: { Map }) do
            local slot_key = tostring(item.item_key) .. "\n" .. tostring(r.map_slot or "")
            if seen_slots[slot_key] then return internal("duplicate receipt slot in one round", slot_key) end
            seen_slots[slot_key] = true
            if r.removed == true then
                removals[#removals + 1] = { item.item_key, r.map_slot or "" }
            elseif r.dest_ref ~= nil and type(r.identity_key) == "string" then
                local dest_ref, enc_err = json.encode(r.dest_ref)
                if enc_err then return internal("failed to encode a destination ref", enc_err) end
                local stored_row, row_err = json.encode({ owner_id = round.automation_id,
                    source_port = round.receipt_port, item_key = item.item_key,
                    map_slot = r.map_slot or "", identity_key = r.identity_key,
                    dest_ref_json = dest_ref, dest_version = r.dest_version,
                    updated_at = round.now, pass_id = type(pass_id) == "string" and pass_id or nil })
                if row_err then return internal("failed to encode a receipt row", row_err) end
                local row_bound = row_limit.check(stored_row, "destination_receipt", round.automation_id)
                if row_bound then return row_bound end
                upserts[#upserts + 1] = { item.item_key, r.map_slot or "", r.identity_key, dest_ref,
                    r.dest_version == nil and sql.NULL or r.dest_version }
            end
            if not seen_receipt[item.item_key] then
                seen_receipt[item.item_key] = true
                receipt_keys[#receipt_keys + 1] = item.item_key
            end
        end
    end
    table.sort(receipt_keys)
    table.sort(upserts, function(a: { any }, b: { any }): boolean
        if a[1] ~= b[1] then return a[1] < b[1] end
        return a[2] < b[2]
    end)
    table.sort(removals, function(a: { any }, b: { any }): boolean
        if a[1] ~= b[1] then return a[1] < b[1] end
        return a[2] < b[2]
    end)
    local dbtype, type_err = tx:db_type()
    if type_err then return internal("failed to resolve receipt dialect", type_err) end
    if dbtype ~= sql.type.POSTGRES and dbtype ~= sql.type.SQLITE then
        return internal("unsupported receipt dialect", dbtype)
    end
    if dbtype == sql.type.POSTGRES then
        for first = 1, #receipt_keys, CHUNK do
            local params: { any } = { round.automation_id, round.receipt_port }
            for index = first, math.min(#receipt_keys, first + CHUNK - 1) do
                params[#params + 1] = receipt_keys[index]
            end
            local _, lock_err = tx:query("SELECT item_key, map_slot FROM kickside_automation_receipt"
                .. " WHERE owner_id=$1 AND source_port=$2 AND item_key IN ("
                .. placeholders(3, #params - 2) .. ")"
                .. " ORDER BY owner_id, source_port, item_key, map_slot FOR UPDATE", params)
            if lock_err then return internal("failed to lock receipts", lock_err) end
        end
    end
    -- A slot is rewritten only when what it maps changed, or when a running
    -- reconcile pass must stamp it; an unchanged destination keeps its row.
    local differs = dbtype == sql.type.POSTGRES and " IS DISTINCT FROM " or " IS NOT "
    local receipt = "kickside_automation_receipt."
    local changed = "(" .. receipt .. "identity_key" .. differs .. "excluded.identity_key"
        .. " OR " .. receipt .. "dest_ref_json" .. differs .. "excluded.dest_ref_json"
        .. " OR " .. receipt .. "dest_version" .. differs .. "excluded.dest_version"
        .. " OR (excluded.pass_id IS NOT NULL AND " .. receipt .. "pass_id" .. differs .. "excluded.pass_id))"
    -- SQLite binds placeholders in order of appearance, so every row names
    -- its own consecutive placeholders.
    for first = 1, #upserts, CHUNK do
        local params: { any } = {}
        local rows: { string } = {}
        for index = first, math.min(#upserts, first + CHUNK - 1) do
            local row = upserts[index]
            local values: { any } = { round.automation_id, round.receipt_port, row[1], row[2], row[3], row[4], row[5],
                round.now, pass_id }
            local marks: { string } = {}
            for _, value in ipairs(values) do
                params[#params + 1] = value
                marks[#marks + 1] = "$" .. tostring(#params)
            end
            rows[#rows + 1] = "(" .. table.concat(marks, ", ") .. ")"
        end
        local inserted, err = tx:execute("INSERT INTO kickside_automation_receipt (owner_id, source_port, item_key, map_slot,"
            .. " identity_key, dest_ref_json, dest_version, updated_at, pass_id)"
            .. " SELECT * FROM (VALUES " .. table.concat(rows, ", ")
            .. ") AS input WHERE true ORDER BY 1, 2, 3, 4"
            .. " ON CONFLICT (owner_id, source_port, item_key, map_slot) DO UPDATE SET identity_key = excluded.identity_key,"
            .. " dest_ref_json = excluded.dest_ref_json, dest_version = excluded.dest_version,"
            .. " updated_at = excluded.updated_at, pass_id = COALESCE(excluded.pass_id, " .. receipt .. "pass_id)"
            .. " WHERE " .. changed, params)
        if err or not inserted or tonumber(inserted.rows_affected) == nil then
            return internal("failed to record receipts", err or "missing affected-row count") end
    end
    for first = 1, #removals, CHUNK do
        local params: { any } = { round.automation_id, round.receipt_port }
        local slots: { string } = {}
        for index = first, math.min(#removals, first + CHUNK - 1) do
            params[#params + 1] = removals[index][1]
            params[#params + 1] = removals[index][2]
            slots[#slots + 1] = "(item_key = $" .. tostring(#params - 1) .. " AND map_slot = $" .. tostring(#params) .. ")"
        end
        local deleted, err = tx:execute("DELETE FROM kickside_automation_receipt WHERE owner_id = $1 AND source_port = $2 AND ("
            .. table.concat(slots, " OR ") .. ")", params)
        if err or not deleted or tonumber(deleted.rows_affected) == nil then
            return internal("failed to remove receipts", err or "missing affected-row count") end
    end
    table.sort(prepared)
    if dbtype == sql.type.POSTGRES then
        for first = 1, #prepared, CHUNK do
            local count = math.min(#prepared, first + CHUNK - 1) - first + 1
            local params: { any } = { round.automation_id }
            for index = first, first + count - 1 do params[#params + 1] = prepared[index] end
            local _, lock_err = tx:query("SELECT idempotency_key FROM kickside_automation_prepared"
                .. " WHERE automation_id=$1 AND idempotency_key IN (" .. placeholders(2, count) .. ")"
                .. " ORDER BY automation_id, idempotency_key FOR UPDATE", params)
            if lock_err then return internal("failed to lock prepared output for settlement", lock_err) end
        end
    end
    for first = 1, #prepared, CHUNK do
        local count = math.min(#prepared, first + CHUNK - 1) - first + 1
        local params: { any } = { round.automation_id }
        for index = first, first + count - 1 do params[#params + 1] = prepared[index] end
        local _, err = tx:execute("DELETE FROM kickside_automation_prepared WHERE automation_id = $1 AND idempotency_key IN ("
            .. placeholders(2, count) .. ")", params)
        if err then return internal("failed to settle prepared output", err) end
    end
    return nil
end

-- commit_tx(tx, round, result) -> { committed, unresolved_count }. round = {
-- automation_id, drive_key, captured, source_port, now, resolved_expires_at }.
-- result = { acquired, event_seq?, cursor?, consume_occurrence?, next_run_at?,
-- pass?, backpressure?, outcomes: [ledger outcome], receipts: [{ item, receipts, prepared_key? }] }.
-- pass = { pages, items } is the scheduled pass count after this round. A
-- round that did not acquire (drain-only or backpressure) keeps the drive's
-- due time; a backpressure round shows backpressure.
function M.commit_tx(tx: any, round: Map, result: Map): (Map?, error?)
    local has_receipts = #(result.receipts or {}) > 0
    local keys = { round.drive_key }
    if has_receipts and round.drive_key ~= "reconcile" then
        local rows, read_err = tx:query("SELECT 1 FROM kickside_automation_drive"
            .. " WHERE automation_id=$1 AND drive_key='reconcile'", { round.automation_id })
        if read_err or type(rows) ~= "table" then return nil, internal("reconcile drive lookup failed", read_err or "missing result") end
        if rows[1] then keys[#keys + 1] = "reconcile" end
    end
    -- A command prelocks all affected drive keys in ascending order. The
    -- round's optional reconcile-pass read takes the same order before ledger.
    local locked, lock_err = drive.lock_tx(tx, round.automation_id, keys)
    if lock_err then
        if errors.is(lock_err, errors.NOT_FOUND) then return { committed = false }, nil end
        return nil, lock_err
    end
    local d = (locked :: Map)[round.drive_key]
    if not M.holds(d, round.captured :: Map) then return { committed = false }, nil end
    local pass_id: any = sql.NULL
    if has_receipts then
        local r = (locked :: Map)["reconcile"]
        if r and r.reconcile_pass_id ~= nil and ledger.receipt_port(r) == round.receipt_port then pass_id = r.reconcile_pass_id end
    end
    local journal: Map=d.admission or {}
    local receipt_of: Map={}
    for _,receipt in ipairs(result.receipts or {}) do receipt_of[receipt.item.delivery_key]=receipt end
    for _,entry in ipairs(result.outcomes or {}) do
        local key=tostring(entry.item.delivery_key)
        if journal[key] ~= nil then
            local encoded,encode_err=json.encode(journal[key])
            if encode_err then return nil,internal("delivery provenance encoding fails",encode_err) end
            entry.execution_identity_json=encoded
            local receipt=receipt_of[key]
            if receipt and type(receipt.prepared_key) == "string" then receipt.original_prepared_key=journal[key].prepared_key end
            journal[key]=nil
        end
    end
    local admission_json,admission_err=json.encode(journal)
    if admission_err then return nil,internal("admission settlement encoding fails",admission_err) end
    local delta, ledger_err, retention_work = ledger.record_tx(tx, round.automation_id, round.source_port, result.outcomes or {},
        round.now, round.resolved_expires_at)
    if ledger_err then return nil, ledger_err end
    local history_err=history.record_tx(tx,round,result.outcomes or {})
    if history_err then return nil,history_err end
    local receipt_err = record_receipts_tx(tx, round, result.receipts or {}, pass_id)
    if receipt_err then return nil, receipt_err end
    local fields: Map = {
        round_token = sql.NULL, round_until = sql.NULL, admission_json=admission_json,
        phase = result.backpressure and drive.PHASE.BACKPRESSURE or drive.PHASE.ACTIVE,
        last_error_json = sql.NULL, last_round_at = round.now,
        unresolved_count = math.max(0, (d.unresolved_count :: integer) + (delta :: integer)),
        -- The wake demand the round was stamped under is served by this round.
        wake_applied_generation = math.max(d.wake_applied_generation :: integer, (round.captured :: Map).wake_generation or 0),
    }
    if result.acquired then fields.next_run_at = result.next_run_at or sql.NULL end
    if type(result.pass) == "table" then
        fields.pass_pages = (result.pass :: Map).pages
        fields.pass_items = (result.pass :: Map).items
    end
    if result.event_seq ~= nil then
        fields.event_seq = result.event_seq
        if d.pin_generation ~= nil and type(d.source_thread_id) == "string" then
            fields.pin_advance_cursor = result.event_seq
            fields.pin_next_at = round.now
            fields.pin_error_json = sql.NULL
        end
    end
    if result.cursor ~= nil then
        local encoded, enc_err = json.encode(result.cursor)
        if enc_err then return nil, internal("failed to encode the source cursor", enc_err) end
        fields.cursor = encoded
    end
    if type(result.reconcile) == "table" then
        local pass_err = reconcile.apply_tx(tx, round, result.reconcile :: Map, fields, sql.NULL)
        if pass_err then return nil, pass_err end
    end
    if result.consume_occurrence then
        fields.last_committed_occurrence_seq = d.occurrence_seq
        fields.occurrence_seq = sql.NULL
        fields.occurrence_due_at = sql.NULL
        fields.occurrence_key = sql.NULL
        fields.occurrence_payload_json = sql.NULL
    end
    if type(result.failure) == "table" then
        local failure = result.failure
        local encoded, enc_err = json.encode({kind=failure.error.kind,message=failure.error.message,
            error_kind=failure.error_kind,attempts=failure.attempts,at=round.now,next_attempt_at=failure.next_run_at})
        if enc_err then return nil, internal("failed to encode interrupted round",enc_err) end
        fields.phase=failure.phase
        fields.last_error_json=encoded
        fields.next_run_at=failure.next_run_at or sql.NULL
    end
    local write_err = write(tx, round, fields)
    if write_err then return nil, write_err end
    return { committed = true, unresolved_count = fields.unresolved_count,
        retention_work = retention_work or #(result.outcomes or {}) > 0 }, nil
end

-- settle_tx(tx, round, failure) -> { committed }. failure = { phase, error =
-- { kind, message }, attempts, next_run_at? }.
function M.settle_tx(tx: any, round: Map, failure: Map): (Map?, error?)
    local d, fence_err = fenced_drive(tx, round)
    if fence_err then return nil, fence_err end
    if not d then return { committed = false }, nil end
    local encoded, enc_err = json.encode({
        kind = (failure.error :: Map).kind, message = (failure.error :: Map).message,
        error_kind = failure.error_kind or (type(failure.error.details) == "table" and failure.error.details.error_kind or nil),
        attempts = failure.attempts, at = round.now, next_attempt_at = failure.next_run_at,
    })
    if enc_err then return nil, internal("failed to encode the round failure", enc_err) end
    local write_err = write(tx, round, {
        round_token = sql.NULL, round_until = sql.NULL,
        phase = failure.phase, last_error_json = encoded, last_round_at = round.now,
        next_run_at = failure.next_run_at or sql.NULL,
    })
    if write_err then return nil, write_err end
    return { committed = true }, nil
end

-- release_tx(tx, round) -> { committed }: releases the round's token and
-- changes nothing else, for an attempt that had nothing to do.
function M.release_tx(tx: any, round: Map): (Map?, error?)
    local d, fence_err = fenced_drive(tx, round)
    if fence_err then return nil, fence_err end
    if not d then return { committed = false }, nil end
    local write_err = write(tx, round, { round_token = sql.NULL, round_until = sql.NULL })
    if write_err then return nil, write_err end
    return { committed = true }, nil
end

return M
