-- Reconciliation over receipts (design v5 §5.3, §9 #2; A33). A reconcile drive
-- runs passes: it enumerates its source's keys through the declared pull_keys
-- into its cursor, stamping each page's receipts with the pass id; a
-- destination delivered while the pass runs is receipted under the pass id by
-- its own commit (record_receipts_tx reads the pass under the reconcile
-- drive's lock). When the enumeration ends the drive sweeps the receipts left
-- unstamped as delete items through the ordinary delivery path, whose commit
-- removes their receipts. A stale item whose delete is already in the drive's
-- ledger is left to its redelivery, so a pass ends when nothing else is
-- stale; the next pass is due one reconcile interval later.
--
--   delete_items(keys)                  -- the sweep's delete items
--   stale(db, round, d, limit)          -- item keys of stale receipts
--   after(d, page, stale_count, now, next_pass_at) -> (spec, continues)
--   apply_tx(tx, round, spec, fields)   -- the commit's pass writes
--
-- Every function runs on the caller's executor and calls no provider.

local uuid = require("uuid")
local ledger = require("round_ledger")

local M = {}

type Map = { [string]: any }

local CHUNK = 100

local function internal(message: string, err: any): error
    return (errors.new({ message = message .. ": " .. tostring(err), kind = errors.INTERNAL, retryable = true }) :: error)
end

-- delete_items(keys) -> one delete item per stale item key; its dedup key
-- keeps its ledger identity apart from the source item's.
function M.delete_items(keys: { string }): { Map }
    local items: { Map } = {}
    for _, key in ipairs(keys) do
        items[#items + 1] = { item_key = key, dedup_key = "reconcile:" .. key, op = "delete", payload = {} }
    end
    return items
end

-- stale(db, round, d, limit) -> the item keys whose receipts the drive's pass
-- left unstamped, without a delete already in the drive's ledger.
function M.stale(db: any, round: Map, d: Map, limit: integer): ({ string }?, error?)
    local rows, err = db:query("SELECT DISTINCT r.item_key FROM kickside_automation_receipt r"
        .. " WHERE r.owner_id = $1 AND r.source_port = $2 AND (r.pass_id IS NULL OR r.pass_id <> $3)"
        .. " AND NOT EXISTS (SELECT 1 FROM " .. ledger.TABLE .. " l WHERE l.owner_id = $4 AND l.source_port = $5"
        .. " AND l.item_key = r.item_key AND l.state <> 'resolved')"
        .. " ORDER BY r.item_key LIMIT $6",
        { round.automation_id, round.receipt_port, d.reconcile_pass_id, round.automation_id, round.source_port, limit })
    if err then return nil, internal("failed to read stale receipts", err) end
    local keys: { string } = {}
    for _, row in ipairs(rows :: { Map }) do keys[#keys + 1] = tostring(row.item_key) end
    return keys, nil
end

-- after(d, page, stale_count, now, next_pass_at) -> the pass spec the commit
-- applies and whether the drive continues at once. stale_count is nil while
-- the pass enumerates.
function M.after(d: Map, page: Map, stale_count: integer?, now: string, next_pass_at: string): (Map, boolean)
    if stale_count == nil then
        return {
            pass_id = d.reconcile_pass_id or uuid.v7(),
            keys = page.keys or {},
            cursor = page.next_cursor,
            sweep = page.has_more ~= true,
            next_at = now,
        }, true
    end
    if stale_count > 0 then return { sweeping = true, next_at = now }, true end
    return { complete = true, next_at = next_pass_at }, false
end

-- apply_tx(tx, round, spec, fields) stamps an enumerated page's receipts with
-- the pass id (one statement per CHUNK keys) and sets the drive's pass fields.
function M.apply_tx(tx: any, round: Map, spec: Map, fields: Map, null: any): error?
    fields.reconcile_next_at = spec.next_at
    if spec.complete then
        fields.reconcile_pass_id = null
        fields.sweep_pending = false
        fields.cursor = null
        return nil
    end
    if spec.sweeping then return nil end
    fields.reconcile_pass_id = spec.pass_id
    fields.sweep_pending = spec.sweep == true
    -- The enumeration's cursor restarts once the pass sweeps.
    if spec.sweep == true then fields.cursor = null end
    local keys = spec.keys :: { string }
    for first = 1, #keys, CHUNK do
        local params: { any } = { spec.pass_id, round.automation_id, round.receipt_port }
        local marks: { string } = {}
        for index = first, math.min(#keys, first + CHUNK - 1) do
            params[#params + 1] = keys[index]
            marks[#marks + 1] = "$" .. tostring(#params)
        end
        local _, err = tx:execute("UPDATE kickside_automation_receipt SET pass_id = $1 WHERE owner_id = $2 AND source_port = $3"
            .. " AND item_key IN (" .. table.concat(marks, ", ") .. ")", params)
        if err then return internal("failed to stamp receipts with the reconcile pass", err) end
    end
    return nil
end

return M
