-- A mapped destination is retained until its delete/reconcile result is proven.
-- Only an orphan with no destination reference is safe for age-based cleanup.
local M = {}

local function internal(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause),
        kind = errors.INTERNAL, retryable = true }) :: error)
end

function M.prune_orphans_tx(tx: any, cutoff: string, limit: integer): (integer?, error?)
    if type(cutoff) ~= "string" or cutoff == "" or type(limit) ~= "number"
        or limit ~= math.floor(limit) or limit < 1 or limit > 1000 then
        return nil, (errors.new({ message = "receipt retention cutoff and limit 1..1000 required",
            kind = errors.INVALID }) :: error)
    end
    local rows, read_err = tx:query([[SELECT r.owner_id,r.source_port,r.item_key,r.map_slot
        FROM kickside_automation_receipt r WHERE r.updated_at <= $1 AND r.dest_ref_json IS NULL
          AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=r.owner_id)
          AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c
                          WHERE c.automation_id=r.owner_id AND c.pending_request_id IS NOT NULL)
        ORDER BY r.owner_id,r.updated_at,r.source_port,r.item_key,r.map_slot LIMIT $2]], { cutoff, limit })
    if read_err or type(rows) ~= "table" then
        return nil, internal("receipt orphan page read failed", read_err or "missing result")
    end
    local removed = 0
    for _, row in ipairs(rows) do
        local deleted, delete_err = tx:execute([[DELETE FROM kickside_automation_receipt
            WHERE owner_id=$1 AND source_port=$2 AND item_key=$3 AND map_slot=$4
              AND updated_at <= $5 AND dest_ref_json IS NULL
              AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d
                              WHERE d.automation_id=kickside_automation_receipt.owner_id)
              AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c
                              WHERE c.automation_id=kickside_automation_receipt.owner_id
                                AND c.pending_request_id IS NOT NULL)]],
            { row.owner_id, row.source_port, row.item_key, row.map_slot, cutoff })
        if delete_err or not deleted or tonumber(deleted.rows_affected) == nil then
            return nil, internal("receipt orphan delete failed", delete_err or "missing affected-row count")
        end
        if tonumber(deleted.rows_affected) == 1 then removed = removed + 1 end
    end
    return removed, nil
end

return M
