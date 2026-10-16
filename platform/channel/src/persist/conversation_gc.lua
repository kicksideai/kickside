-- Conversation-owned records are removed together after the backing sessions
-- are gone. Count unresolved reply evidence in the same serializable transaction
-- that discards it, so the owner callback can report exactly what it chose to lose.
local sql = require("sql")
local conversation = require("channel_conversation")

local M = {}
local PAGE = 100

local function failure(message: string, kind: string, cause: any?): error
    return (errors.new({ message = message .. (cause and ": " .. tostring(cause) or ""),
        kind = kind, retryable = kind ~= errors.INVALID }) :: error)
end

function M.remove_on_db(db: sql.DB, provider: string, external_id: string,
    proven_sessions: { string }, retain_counts: boolean?): (any?, error?)
    if type(proven_sessions) ~= "table" or #proven_sessions > PAGE then
        return nil, failure("conversation proven session page invalid", errors.INVALID)
    end
    for _, session_id in ipairs(proven_sessions) do
        if type(session_id) ~= "string" or session_id == "" then
            return nil, failure("conversation proven session id invalid", errors.INVALID)
        end
    end
    local dbtype, type_err = db:type()
    if type_err then return nil, failure("conversation database type failed", errors.INTERNAL, type_err) end
    local expr: string
    if dbtype == sql.type.POSTGRES then
        expr = "(route_json::jsonb ->> 'session_id')"
    elseif dbtype == sql.type.SQLITE then
        expr = "json_extract(route_json, '$.session_id')"
    else
        return nil, failure("conversation database dialect unsupported", errors.INTERNAL, dbtype)
    end
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then return nil, failure("conversation delete begin failed", errors.UNAVAILABLE, begin_err) end
    -- The conversation row is the outer owner lock: admission and cleanup use
    -- the same order before touching turn or session identities.
    local owner_row, lock_err = conversation.lock_tx(tx, dbtype, provider, external_id)
    if lock_err then tx:rollback(); return nil, lock_err end
    if tonumber(owner_row.deleting) ~= 1 then
        tx:rollback()
        return nil, failure("conversation owner delete requires a durable admission fence", errors.CONFLICT)
    end
    local inserted, insert_err = tx:execute([[INSERT INTO kickside_channel_cleanup_counts
        (provider,external_id) VALUES ($1,$2) ON CONFLICT(provider,external_id) DO NOTHING]],
        { provider, external_id })
    if insert_err or not inserted or tonumber(inserted.rows_affected) == nil then
        tx:rollback()
        return nil, failure("conversation count pointer insert failed", errors.INTERNAL,
            insert_err or "missing result")
    end
    if retain_counts then
        local retained, retain_err = tx:execute([[UPDATE kickside_channel_cleanup_counts
            SET link_pending=1 WHERE provider=$1 AND external_id=$2]], { provider, external_id })
        if retain_err or not retained or tonumber(retained.rows_affected) ~= 1 then
            tx:rollback()
            return nil, failure("conversation count pointer retain failed", errors.INTERNAL,
                retain_err or "missing row proof")
        end
    end
    local count_lock = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local count_rows, count_read_err = tx:query([[SELECT reply_uncertain,unappended,link_pending
        FROM kickside_channel_cleanup_counts WHERE provider=$1 AND external_id=$2]] .. count_lock,
        { provider, external_id })
    if count_read_err or type(count_rows) ~= "table" or not count_rows[1] then
        tx:rollback()
        return nil, failure("conversation count pointer read failed", errors.INTERNAL,
            count_read_err or "missing result")
    end
    local discarded = { reply_uncertain = tonumber(count_rows[1].reply_uncertain),
        unappended = tonumber(count_rows[1].unappended) }
    local link_pending = tonumber(count_rows[1].link_pending)
    if discarded.reply_uncertain == nil or discarded.unappended == nil or link_pending == nil then
        tx:rollback()
        return nil, failure("conversation count pointer corrupt", errors.INTERNAL)
    end
    local owner_sessions = "SELECT session_id FROM (" .. conversation.SESSION_OWNERS_SQL
        .. ") owners WHERE provider=$1 AND external_id=$2"
    local where_turn = "(owner_provider=$1 AND owner_external_id=$2) OR " .. expr
        .. " IN (" .. owner_sessions .. ")"
    local rows, count_err = tx:query([[SELECT turn_id,reply_state,appended_at,
        owner_provider,owner_external_id
        FROM kickside_channel_turns WHERE ]] .. where_turn .. " ORDER BY turn_id LIMIT $3",
        { provider, external_id, PAGE })
    if count_err or type(rows) ~= "table" then
        tx:rollback()
        return nil, failure("conversation turn page read failed", errors.INTERNAL, count_err or "missing result")
    end
    for _, row in ipairs(rows) do
        if row.reply_state == "reserved" then discarded.reply_uncertain = discarded.reply_uncertain + 1 end
        if row.appended_at == nil then discarded.unappended = discarded.unappended + 1 end
    end
    local removed = 0
    if #rows > 0 then
        local result, delete_err = tx:execute([[WITH doomed AS (
            SELECT turn_id FROM kickside_channel_turns WHERE ]] .. where_turn
            .. [[ ORDER BY turn_id LIMIT $3
        ) DELETE FROM kickside_channel_turns WHERE turn_id IN (SELECT turn_id FROM doomed)]],
            { provider, external_id, PAGE })
        local count = result and tonumber(result.rows_affected)
        if delete_err or count ~= #rows then
            tx:rollback()
            return nil, failure("conversation turn page delete failed", errors.INTERNAL,
                delete_err or "missing or changed affected-row count")
        end
        removed = count
        local stamped, stamp_err = tx:execute([[UPDATE kickside_channel_cleanup_counts
            SET reply_uncertain=$1,unappended=$2 WHERE provider=$3 AND external_id=$4]],
            { discarded.reply_uncertain, discarded.unappended, provider, external_id })
        if stamp_err or not stamped or tonumber(stamped.rows_affected) ~= 1 then
            tx:rollback()
            return nil, failure("conversation count pointer update failed", errors.INTERNAL,
                stamp_err or "missing row proof")
        end
    end
    for _, spec in ipairs({
        { "kickside_channel_admissions", "session_id" },
        { "kickside_channel_session_archives", "old_session_id" },
        { "kickside_channel_sessions", "session_id" },
        { "kickside_channel_session_owner", "session_id" },
    }) do
        if removed >= PAGE then break end
        if #proven_sessions == 0 then break end
        local args: { any } = { provider, external_id }
        local marks: { string } = {}
        for _, session_id in ipairs(proven_sessions) do
            args[#args + 1] = session_id
            marks[#marks + 1] = "$" .. tostring(#args)
        end
        args[#args + 1] = PAGE - removed
        local where_proven = spec[2] .. " IN (" .. table.concat(marks, ",") .. ")"
        local statement = "WITH doomed AS (SELECT " .. spec[2] .. " FROM " .. spec[1]
            .. " WHERE provider=$1 AND external_id=$2 AND " .. where_proven
            .. " ORDER BY " .. spec[2] .. " LIMIT $" .. tostring(#args) .. ")"
            .. " DELETE FROM " .. spec[1] .. " WHERE " .. spec[2] .. " IN (SELECT " .. spec[2]
            .. " FROM doomed) AND provider=$1 AND external_id=$2"
        local result, delete_err = tx:execute(statement, args)
        local count = result and tonumber(result.rows_affected)
        if delete_err or count == nil or count > PAGE - removed then
            tx:rollback()
            return nil, failure("conversation owner page delete failed for " .. spec[1], errors.INTERNAL,
                delete_err or "missing bounded affected-row count")
        end
        removed = removed + (count :: number)
    end
    local more = false
    local probes = {
        "SELECT turn_id FROM kickside_channel_turns WHERE " .. where_turn .. " LIMIT 1",
        "SELECT session_id FROM kickside_channel_admissions WHERE provider=$1 AND external_id=$2 LIMIT 1",
        "SELECT old_session_id FROM kickside_channel_session_archives WHERE provider=$1 AND external_id=$2 LIMIT 1",
        "SELECT session_id FROM kickside_channel_sessions WHERE provider=$1 AND external_id=$2 LIMIT 1",
        "SELECT session_id FROM kickside_channel_session_owner WHERE provider=$1 AND external_id=$2 LIMIT 1",
    }
    for _, probe in ipairs(probes) do
        local left, read_err = tx:query(probe, { provider, external_id })
        if read_err or type(left) ~= "table" then
            tx:rollback()
            return nil, failure("conversation continuation read failed", errors.INTERNAL,
                read_err or "missing result")
        end
        if left[1] then more = true; break end
    end
    if not more then
        local dropped, drop_err = tx:execute([[DELETE FROM kickside_channel_conversation
            WHERE provider=$1 AND external_id=$2 AND deleting=1]], { provider, external_id })
        if drop_err or not dropped or tonumber(dropped.rows_affected) ~= 1 then
            tx:rollback()
            return nil, failure("conversation owner close failed", errors.INTERNAL,
                drop_err or "deletion fence remains")
        end
        if link_pending == 0 then
            local cleared, clear_err = tx:execute([[DELETE FROM kickside_channel_cleanup_counts
                WHERE provider=$1 AND external_id=$2]], { provider, external_id })
            if clear_err or not cleared or tonumber(cleared.rows_affected) ~= 1 then
                tx:rollback()
                return nil, failure("conversation count pointer delete failed", errors.INTERNAL,
                    clear_err or "missing row proof")
            end
        end
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, failure("conversation delete commit failed", errors.UNAVAILABLE, commit_err) end
    if more then
        return nil, (errors.new({ message = "conversation owner cleanup has another bounded page",
            kind = errors.CONFLICT, retryable = true,
            details = { cleanup_pending = true, needs_continue = true, discarded = discarded, removed = removed } }) :: error)
    end
    return { discarded = discarded }, nil
end

-- Complete identity's unlink handoff after the identity owner has deleted its
-- link row. The count pointer stays here until this owner proves all channel
-- cleanup pages have settled.
function M.complete_unlink(db_id: string, provider: string, external_id: string): (any?, error?)
    if type(provider) ~= "string" or provider == "" or type(external_id) ~= "string" or external_id == "" then
        return nil, failure("conversation unlink key invalid", errors.INVALID)
    end
    local db, db_err = sql.get(db_id)
    if db_err or not db then
        return nil, failure("conversation unlink database unavailable", errors.UNAVAILABLE, db_err)
    end
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then
        db:release()
        return nil, failure("conversation unlink begin failed", errors.UNAVAILABLE, begin_err)
    end
    local dbtype, type_err = db:type()
    if type_err then
        tx:rollback(); db:release()
        return nil, failure("conversation unlink database type failed", errors.INTERNAL, type_err)
    end
    local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local counts, count_err = tx:query([[SELECT reply_uncertain,unappended,link_pending
        FROM kickside_channel_cleanup_counts WHERE provider=$1 AND external_id=$2]] .. lock,
        { provider, external_id })
    if count_err or type(counts) ~= "table" then
        tx:rollback(); db:release()
        return nil, failure("conversation unlink count read failed", errors.INTERNAL, count_err or "missing result")
    end
    if not counts[1] then
        local _, commit_err = tx:commit(); db:release()
        if commit_err then return nil, failure("conversation unlink commit failed", errors.UNAVAILABLE, commit_err) end
        return { discarded = { reply_uncertain = 0, unappended = 0 } }, nil
    end
    local discarded = { reply_uncertain = tonumber(counts[1].reply_uncertain),
        unappended = tonumber(counts[1].unappended) }
    if discarded.reply_uncertain == nil or discarded.unappended == nil
        or tonumber(counts[1].link_pending) ~= 1 then
        tx:rollback(); db:release()
        return nil, failure("conversation unlink count pointer is invalid", errors.INTERNAL)
    end
    local owner_rows, owner_err = tx:query([[SELECT deleting
        FROM kickside_channel_conversation WHERE provider=$1 AND external_id=$2]] .. lock,
        { provider, external_id })
    if owner_err or type(owner_rows) ~= "table" then
        tx:rollback(); db:release()
        return nil, failure("conversation unlink owner read failed", errors.INTERNAL, owner_err or "missing result")
    end
    if owner_rows[1] then
        tx:rollback(); db:release()
        return nil, failure("conversation unlink cleanup is not settled", errors.CONFLICT,
            "channel conversation owner remains")
    end
    local result, delete_err = tx:execute([[DELETE FROM kickside_channel_cleanup_counts
        WHERE provider=$1 AND external_id=$2 AND link_pending=1]], { provider, external_id })
    if delete_err or not result or tonumber(result.rows_affected) ~= 1 then
        tx:rollback(); db:release()
        return nil, failure("conversation unlink count finalization failed", errors.INTERNAL,
            delete_err or "missing row proof")
    end
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, failure("conversation unlink commit failed", errors.UNAVAILABLE, commit_err) end
    return { discarded = discarded }, nil
end

return M
