-- Reclaim rotated session history only after it is old enough and no turn can
-- still need its route or reply receipt. The backing session is deleted before
-- its SQL owner pointer, so a failure leaves a durable retry target.
local sql = require("sql")
local session_service = require("session_service")
local session_delete_proof = require("session_delete_proof")
local conversation = require("channel_conversation")

local M = {}
local TURN_PAGE = 500

local function failure(message: string, cause: any, kind: string): error
    return (errors.new({ message = message .. ": " .. tostring(cause),
        kind = kind, retryable = kind ~= errors.INVALID }) :: error)
end

local function session_expr(dbtype: any): (string?, error?)
    if dbtype == sql.type.POSTGRES then return "(t.route_json::jsonb ->> 'session_id')", nil end
    if dbtype == sql.type.SQLITE then return "json_extract(t.route_json, '$.session_id')", nil end
    return nil, failure("channel archive database dialect unsupported", dbtype, errors.INTERNAL)
end

local function eligible(expr: string): string
    return [[a.rotated_at <= $1
          AND NOT EXISTS (SELECT 1 FROM kickside_channel_conversation c
              WHERE c.provider=a.provider AND c.external_id=a.external_id AND c.deleting=1)
          AND NOT EXISTS (SELECT 1 FROM kickside_channel_sessions s
              WHERE s.provider = a.provider AND s.external_id = a.external_id
                AND s.session_id = a.old_session_id)
          AND NOT EXISTS (SELECT 1 FROM kickside_channel_turns t
              WHERE ]] .. expr .. [[ = a.old_session_id
                AND (t.accepted_at > $2 OR t.appended_at IS NULL
                    OR t.reply_state NOT IN ('sent')))]]
end

local function candidate_query(expr: string): string
    return "SELECT a.old_session_id,a.provider,a.external_id FROM kickside_channel_session_archives a WHERE " .. eligible(expr)
        .. " ORDER BY a.rotated_at, a.old_session_id LIMIT $3"
end

function M._scan_candidates(db: any, expr: string, archive_cutoff: string,
    turn_cutoff: string, limit: integer): (any?, error?)
    local rows, scan_err = db:query(candidate_query(expr), { archive_cutoff, turn_cutoff, limit })
    if scan_err then return nil, failure("channel archive scan failed", scan_err, errors.INTERNAL) end
    if type(rows) ~= "table" then
        return nil, failure("channel archive scan returned no result", "missing rows", errors.INTERNAL)
    end
    return rows, nil
end

local function remove_archived(db: sql.DB, dbtype: any, expr: string, old_id: string,
    provider: string, external_id: string,
    archive_cutoff: string, turn_cutoff: string): (boolean?, error?)
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then return nil, failure("channel archive transaction failed", begin_err, errors.UNAVAILABLE) end
    local owner, lock_err = conversation.lock_tx(tx, dbtype, provider, external_id)
    if lock_err then tx:rollback(); return nil, lock_err end
    if tonumber(owner.deleting) == 1 then tx:rollback(); return false, nil end
    local rows, check_err = tx:query("SELECT a.old_session_id FROM kickside_channel_session_archives a"
        .. " WHERE " .. eligible(expr) .. " AND a.old_session_id = $3",
        { archive_cutoff, turn_cutoff, old_id })
    if check_err or type(rows) ~= "table" then
        tx:rollback(); return nil, failure("channel archive recheck failed", check_err or "missing rows", errors.INTERNAL)
    end
    if not rows[1] then tx:rollback(); return false, nil end
    local turn_rows, turn_read_err = tx:query([[SELECT t.turn_id,t.owner_provider,t.owner_external_id
        FROM kickside_channel_turns t WHERE ]] .. expr .. [[=$1 ORDER BY t.turn_id LIMIT $2]],
        { old_id, TURN_PAGE })
    if turn_read_err or type(turn_rows) ~= "table" then
        tx:rollback(); return nil, failure("channel archive turns read failed",
            turn_read_err or "missing rows", errors.INTERNAL)
    end
    for _, turn in ipairs(turn_rows) do
        local result, turn_err = tx:execute([[DELETE FROM kickside_channel_turns WHERE turn_id=$1]],
            { turn.turn_id })
        if turn_err or not result or tonumber(result.rows_affected) ~= 1 then
            tx:rollback(); return nil, failure("channel archive turns delete failed",
                turn_err or "missing affected-row count", errors.INTERNAL)
        end
        if turn.owner_provider and turn.owner_external_id
            and (turn.owner_provider ~= provider or turn.owner_external_id ~= external_id) then
            tx:rollback(); return nil, failure("channel archive turn owner mismatch", turn.turn_id, errors.INTERNAL)
        end
    end
    local remaining, remaining_err = tx:query("SELECT t.turn_id FROM kickside_channel_turns AS t WHERE "
        .. expr .. "=$1 LIMIT 1", { old_id })
    if remaining_err or type(remaining) ~= "table" then
        tx:rollback(); return nil, failure("channel archive turn continuation read failed",
            remaining_err or "missing rows", errors.INTERNAL)
    end
    if remaining[1] then
        local _, partial_err = tx:commit()
        if partial_err then return nil, failure("channel archive turn page commit failed", partial_err, errors.UNAVAILABLE) end
        return false, nil
    end
    local admission, admission_err = tx:execute("DELETE FROM kickside_channel_admissions WHERE session_id = $1", { old_id })
    if admission_err or not admission or tonumber(admission.rows_affected) == nil then
        tx:rollback(); return nil, failure("channel archive admission delete failed",
            admission_err or "missing affected-row count", errors.INTERNAL)
    end
    local result, archive_err = tx:execute(
        "DELETE FROM kickside_channel_session_archives WHERE old_session_id = $1", { old_id })
    if archive_err then tx:rollback(); return nil, failure("channel archive pointer delete failed", archive_err, errors.INTERNAL) end
    local count = result and tonumber(result.rows_affected)
    if count ~= 1 then tx:rollback(); return nil, failure("channel archive pointer delete affected no row", count, errors.INTERNAL) end
    local owned, owner_err = tx:execute([[DELETE FROM kickside_channel_session_owner
        WHERE session_id=$1 AND provider=$2 AND external_id=$3]], { old_id, provider, external_id })
    if owner_err or not owned or tonumber(owned.rows_affected) == nil then
        tx:rollback(); return nil, failure("channel archive session owner delete failed",
            owner_err or "missing affected-row count", errors.INTERNAL)
    end
    local _, commit_err = tx:commit()
    if commit_err then return nil, failure("channel archive commit failed", commit_err, errors.UNAVAILABLE) end
    return true, nil
end

function M.prune_archives(db_id: string, archive_cutoff: string, turn_cutoff: string,
    limit: integer): (integer?, error?)
    if type(db_id) ~= "string" or db_id == "" or type(archive_cutoff) ~= "string" or archive_cutoff == ""
        or type(turn_cutoff) ~= "string" or turn_cutoff == "" or type(limit) ~= "number"
        or limit < 1 or limit > 50 or limit ~= math.floor(limit) then
        return nil, failure("channel archive retention arguments invalid", "db_id, cutoffs and limit 1..50 required", errors.INVALID)
    end
    local db, open_err = sql.get(db_id)
    if open_err or not db then return nil, failure("channel archive database unavailable", open_err, errors.UNAVAILABLE) end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return nil, failure("channel archive database type failed", type_err, errors.INTERNAL) end
    local expr, expr_err = session_expr(dbtype)
    if expr_err or not expr then db:release(); return nil, expr_err end
    local rows, scan_err = M._scan_candidates(db, expr :: string, archive_cutoff, turn_cutoff, limit)
    if scan_err then db:release(); return nil, scan_err end
    local deleted = 0
    for _, row in ipairs(rows :: { any }) do
        local old_id = tostring(row.old_session_id)
        if type(row.provider) ~= "string" or type(row.external_id) ~= "string" then
            db:release(); return nil, failure("channel archive owner is invalid", old_id, errors.INTERNAL)
        end
        local session_err = session_delete_proof.delete(session_service, old_id, "channel archived")
        if session_err then db:release(); return nil, session_err end
        local removed, remove_err = remove_archived(db, dbtype, expr :: string, old_id,
            row.provider :: string, row.external_id :: string, archive_cutoff, turn_cutoff)
        if remove_err then db:release(); return nil, remove_err end
        if removed then deleted = deleted + 1 end
    end
    db:release()
    return deleted, nil
end

return M
