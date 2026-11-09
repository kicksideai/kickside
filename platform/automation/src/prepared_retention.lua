-- The dispatcher retires orphaned prepared output only with settled delivery proof.
-- A live drive may still need its sole replay-safe transform result, regardless
-- of age; a pending command may install the drive that will consume it.
local M = {}

-- Eligibility is shared by deletion and maintenance scheduling. Unsettled
-- prepared output must never rearm a maintenance pass that cannot remove it.
local function eligible(alias: string): string
    return [[ AND NOT EXISTS (SELECT 1 FROM kickside_automation_drive d WHERE d.automation_id=]] .. alias .. [[.automation_id)
        AND NOT EXISTS (SELECT 1 FROM kickside_automation_command c WHERE c.automation_id=]] .. alias .. [[.automation_id AND c.pending_request_id IS NOT NULL)
        AND NOT EXISTS (SELECT 1 FROM kickside_trigger_item_ledger l WHERE l.owner_id=]] .. alias .. [[.automation_id AND l.state NOT IN ('resolved','dead'))
        AND EXISTS (SELECT 1 FROM kickside_trigger_item_ledger settled WHERE settled.owner_id=]] .. alias .. [[.automation_id
                    AND settled.identity_key=]] .. alias .. [[.idempotency_key AND settled.state='resolved')]]
end

function M.oldest_eligible(db: any): (string?, error?)
    local rows, err = db:query("SELECT MIN(p.created_at) AS at FROM kickside_automation_prepared p WHERE 1=1" .. eligible("p"))
    if err then return nil, err end
    if type(rows) ~= "table" or not rows[1] then
        return nil, (errors.new({ message = "prepared retention deadline returned no result", kind = errors.INTERNAL, retryable = true }) :: error)
    end
    return rows[1].at, nil
end

function M.prune_orphans_tx(tx: any, cutoff: string, limit: integer): (integer?, error?)
    if type(cutoff) ~= "string" or cutoff == "" or type(limit) ~= "number"
        or limit ~= math.floor(limit) or limit < 1 or limit > 1000 then
        return nil, (errors.new({ message = "prepared retention cutoff and limit 1..1000 required",
            kind = errors.INVALID }) :: error)
    end
    local result, err = tx:execute([[WITH expired AS (
        SELECT p.automation_id,p.idempotency_key FROM kickside_automation_prepared p
        WHERE p.created_at <= $1]] .. eligible("p") .. [[
        ORDER BY p.created_at,p.automation_id,p.idempotency_key LIMIT $2
    ) DELETE FROM kickside_automation_prepared
      WHERE (automation_id,idempotency_key) IN (SELECT automation_id,idempotency_key FROM expired)
        AND created_at <= $1]] .. eligible("kickside_automation_prepared"), { cutoff, limit })
    if err then return nil, (errors.new({ message = "prepared orphan prune failed: " .. tostring(err),
        kind = errors.INTERNAL, retryable = true }) :: error) end
    local count = result and tonumber(result.rows_affected)
    if count == nil then return nil, (errors.new({ message = "prepared orphan prune returned no count",
        kind = errors.INTERNAL, retryable = true }) :: error) end
    return count :: integer, nil
end

return M
