-- Retain accepted routes until their append is durable and any 24-hour reply
-- proof has expired. A reserved reply is uncertain and remains for resolution.
local sql = require("sql")
local conversation = require("channel_conversation")

local M = {}

function M.prune_settled(db_id: string, cutoff: string, limit: integer): (integer?, error?)
    if type(db_id) ~= "string" or db_id == "" or type(cutoff) ~= "string" or cutoff == ""
        or type(limit) ~= "number" or limit < 1 or limit ~= math.floor(limit) then
        return nil, (errors.new({ message = "valid retention database, cutoff and limit are required",
            kind = errors.INVALID }) :: error)
    end
    local db, open_err = sql.get(db_id)
    if open_err or not db then
        return nil, (errors.new({ message = "channel retention database unavailable: " .. tostring(open_err),
            kind = errors.UNAVAILABLE, retryable = true }) :: error)
    end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return nil, (errors.new({ message = tostring(type_err),
        kind = errors.INTERNAL, retryable = true }) :: error) end
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then db:release(); return nil, (errors.new({
        message = "channel retention begin failed: " .. tostring(begin_err),
        kind = errors.UNAVAILABLE, retryable = true }) :: error) end
    local rows, read_err = tx:query([[SELECT turn_id,owner_provider,owner_external_id
        FROM kickside_channel_turns
        WHERE accepted_at <= $1 AND appended_at IS NOT NULL
          AND (reply_state IS NULL OR reply_state = 'sent')
        ORDER BY accepted_at, turn_id LIMIT $2]], { cutoff, limit })
    if read_err or type(rows) ~= "table" then
        tx:rollback(); db:release()
        return nil, (errors.new({ message = "channel retention read failed: " .. tostring(read_err),
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    for _, row in ipairs(rows) do
        local owner, owner_err = conversation.turn_owner_tx(tx, dbtype, row.turn_id)
        if owner_err then tx:rollback(); db:release(); return nil, owner_err end
        if owner then
            row.owner_provider, row.owner_external_id = owner.provider, owner.external_id
            row.deleting = owner.deleting
        end
    end
    table.sort(rows, function(a, b)
        local ak = tostring(a.owner_provider or "") .. ":" .. tostring(a.owner_external_id or "")
        local bk = tostring(b.owner_provider or "") .. ":" .. tostring(b.owner_external_id or "")
        return ak == bk and tostring(a.turn_id) < tostring(b.turn_id) or ak < bk
    end)
    local deleted = 0
    local locked = ""
    local deleting = false
    for _, row in ipairs(rows) do
        local provider: string? = row.owner_provider :: string?
        local external_id: string? = row.owner_external_id :: string?
        local fenced = tonumber(row.deleting) == 1
        if not fenced and provider and external_id then
            local key = provider .. ":" .. external_id
            if key ~= locked then
                local owner, lock_err = conversation.lock_tx(tx, dbtype, provider, external_id)
                if lock_err then tx:rollback(); db:release(); return nil, lock_err end
                deleting = tonumber(owner.deleting) == 1
                locked = key
            end
            fenced = deleting
        end
        if not fenced then
            local result, delete_err = tx:execute([[DELETE FROM kickside_channel_turns
                WHERE turn_id=$1 AND accepted_at<=$2 AND appended_at IS NOT NULL
                  AND (reply_state IS NULL OR reply_state='sent')]], { row.turn_id, cutoff })
            local count = result and tonumber(result.rows_affected)
            if delete_err or count == nil or count > 1 then
                tx:rollback(); db:release()
                return nil, (errors.new({ message = "channel accepted-turn prune failed: "
                    .. tostring(delete_err or "missing affected-row count"),
                    kind = errors.INTERNAL, retryable = true }) :: error)
            end
            if count == 1 then deleted = deleted + 1 end
        end
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, (errors.new({ message = "channel retention commit failed: "
        .. tostring(commit_err), kind = errors.UNAVAILABLE, retryable = true }) :: error) end
    return deleted, nil
end

return M
