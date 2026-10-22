local sql = require("sql")

local M = {}

local function internal(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause),
        kind = errors.INTERNAL, retryable = true }) :: error)
end

-- The same eligibility governs the page, its delete recheck and maintenance's
-- next deadline. A missing owner cannot prove a mapped receipt's source kind.
local function eligibility(dialect: string): (string?, error?)
    if dialect ~= sql.type.POSTGRES and dialect ~= sql.type.SQLITE then
        return nil, internal("unsupported receipt retention dialect", dialect)
    end
    local port = dialect == sql.type.POSTGRES and "(d.action_json::json ->> 'source_ref')"
        or "json_extract(d.action_json,'$.source_ref')"
    return [[NOT EXISTS (SELECT 1 FROM kickside_automation_command c
                WHERE c.automation_id=r.owner_id AND c.pending_request_id IS NOT NULL)
        AND ((r.dest_ref_json IS NULL
                AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=r.owner_id))
            OR (r.dest_ref_json IS NOT NULL AND r.pass_id IS NULL
                AND EXISTS (SELECT 1 FROM kickside_automation_drive d
                    WHERE d.automation_id=r.owner_id AND d.source_kind='event' AND ]] .. port .. [[=r.source_port)
                AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d
                    WHERE d.automation_id=r.owner_id AND
                        (d.round_token IS NOT NULL OR (d.admission_json IS NOT NULL AND d.admission_json <> '{}')
                         OR (d.source_kind <> 'event' AND ]] .. port .. [[=r.source_port)))
                AND NOT EXISTS (SELECT 1 FROM kickside_trigger_item_ledger l
                    WHERE l.owner_id=r.owner_id AND l.item_key=r.item_key
                      AND (l.source_port=r.source_port OR l.source_port='reconcile:' || r.source_port))
                AND NOT EXISTS (SELECT 1 FROM kickside_automation_prepared p WHERE p.automation_id=r.owner_id)))]], nil
end

function M.oldest_eligible(db: any): (string?, error?)
    local dialect, dialect_err = db:type()
    if dialect_err then return nil, internal("receipt retention dialect read failed", dialect_err) end
    local guard, guard_err = eligibility(tostring(dialect))
    if guard_err then return nil, guard_err end
    local rows, read_err = db:query("SELECT MIN(r.updated_at) AS at FROM kickside_automation_receipt r WHERE " .. guard)
    if read_err or type(rows) ~= "table" then
        return nil, internal("receipt retention deadline read failed", read_err or "missing result")
    end
    return rows[1].at, nil
end

function M.prune_orphans_tx(tx: any, cutoff: string, limit: integer): (integer?, error?)
    if type(cutoff) ~= "string" or cutoff == "" or type(limit) ~= "number"
        or limit ~= math.floor(limit) or limit < 1 or limit > 1000 then
        return nil, (errors.new({ message = "receipt retention cutoff and limit 1..1000 required",
            kind = errors.INVALID }) :: error)
    end
    local dialect, dialect_err = tx:db_type()
    if dialect_err then return nil, internal("receipt retention dialect read failed", dialect_err) end
    local guard, guard_err = eligibility(tostring(dialect))
    if guard_err then return nil, guard_err end
    local rows, read_err = tx:query([[SELECT r.owner_id,r.source_port,r.item_key,r.map_slot
        FROM kickside_automation_receipt r WHERE r.updated_at <= $1 AND ]] .. guard .. [[
        ORDER BY r.owner_id,r.updated_at,r.source_port,r.item_key,r.map_slot LIMIT $2]], { cutoff, limit })
    if read_err or type(rows) ~= "table" then
        return nil, internal("receipt orphan page read failed", read_err or "missing result")
    end
    local removed = 0
    for _, row in ipairs(rows) do
        local deleted, delete_err = tx:execute([[DELETE FROM kickside_automation_receipt AS r
            WHERE owner_id=$1 AND source_port=$2 AND item_key=$3 AND map_slot=$4
              AND updated_at <= $5 AND ]] .. guard,
            { row.owner_id, row.source_port, row.item_key, row.map_slot, cutoff })
        if delete_err or not deleted or tonumber(deleted.rows_affected) == nil then
            return nil, internal("receipt orphan delete failed", delete_err or "missing affected-row count")
        end
        if tonumber(deleted.rows_affected) == 1 then removed = removed + 1 end
    end
    return removed, nil
end

return M
