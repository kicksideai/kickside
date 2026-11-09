-- Retain accepted routes until their append is durable and any 24-hour reply
-- proof has expired. A reserved reply is uncertain and remains for resolution.
local sql = require("sql")
local conversation = require("channel_conversation")

local M = {}

function M.prune_settled(db_id: string, cutoff: string, limit: integer): (integer?, error?, any?)
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
    local session_expr = dbtype == sql.type.POSTGRES and "(t.route_json::jsonb ->> 'session_id')"
        or "json_extract(t.route_json, '$.session_id')"
    local eligible = [[t.appended_at IS NOT NULL AND (t.reply_state IS NULL OR t.reply_state='sent')
        AND NOT EXISTS (SELECT 1 FROM kickside_channel_conversation c
            WHERE c.provider=t.owner_provider AND c.external_id=t.owner_external_id AND c.deleting=1)
        AND NOT EXISTS (SELECT 1 FROM (]] .. conversation.SESSION_OWNERS_SQL .. [[) o
            JOIN kickside_channel_conversation c ON c.provider=o.provider AND c.external_id=o.external_id
            WHERE (t.owner_provider IS NULL OR t.owner_external_id IS NULL)
              AND o.session_id=]] .. session_expr .. [[ AND c.deleting=1)]]
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then db:release(); return nil, (errors.new({
        message = "channel retention begin failed: " .. tostring(begin_err),
        kind = errors.UNAVAILABLE, retryable = true }) :: error) end
    local rows, read_err = tx:query("SELECT t.turn_id,t.owner_provider,t.owner_external_id"
        .. " FROM kickside_channel_turns t WHERE t.accepted_at <= $1 AND " .. eligible
        .. " ORDER BY t.accepted_at,t.turn_id LIMIT $2", { cutoff, limit })
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
    table.sort(rows, function(a,b)
        local ap,bp = tostring(a.owner_provider or ""),tostring(b.owner_provider or "")
        if ap ~= bp then return ap < bp end
        local ae,be = tostring(a.owner_external_id or ""),tostring(b.owner_external_id or "")
        if ae ~= be then return ae < be end
        return tostring(a.turn_id) < tostring(b.turn_id)
    end)
    local deleted = 0
    local locked_provider,locked_external_id = "",""
    local deleting = false
    for _, row in ipairs(rows) do
        local provider: string? = row.owner_provider :: string?
        local external_id: string? = row.owner_external_id :: string?
        local fenced = tonumber(row.deleting) == 1
        if not fenced and provider and external_id then
            if provider ~= locked_provider or external_id ~= locked_external_id then
                local owner, lock_err = conversation.lock_tx(tx, dbtype, provider, external_id)
                if lock_err then tx:rollback(); db:release(); return nil, lock_err end
                deleting = tonumber(owner.deleting) == 1
                locked_provider,locked_external_id = provider,external_id
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
    if commit_err then db:release(); return nil, (errors.new({ message = "channel retention commit failed: "
        .. tostring(commit_err), kind = errors.UNAVAILABLE, retryable = true }) :: error) end
    local remaining, remaining_err = db:query("SELECT t.accepted_at FROM kickside_channel_turns t WHERE "
        .. eligible .. " ORDER BY t.accepted_at,t.turn_id LIMIT 1")
    db:release()
    if remaining_err or type(remaining) ~= "table" then
        return nil, (errors.new({message = "channel turn deadline read failed: " .. tostring(remaining_err),
            kind = errors.INTERNAL, retryable = true}) :: error)
    end
    return deleted, nil, {needs_continue = #rows >= limit,
        next_at = remaining[1] and remaining[1].accepted_at or nil}
end

return M
