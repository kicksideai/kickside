-- Detach an idle conversation's active mapping without losing the pointer to
-- its backing session. Archive retention deletes that session only after its
-- turn/reply proof window is over. A new inbound turn creates a new mapping.
local sql = require("sql")
local time = require("time")
local conversation = require("channel_conversation")

local M = {}

local function failure(message: string, cause: any, kind: string): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = kind,
        retryable = kind ~= errors.INVALID }) :: error)
end

local function retire_one(db: sql.DB, dbtype: any, candidate: any, cutoff: string): (boolean?, error?)
    if type(candidate.provider) ~= "string" or type(candidate.external_id) ~= "string" then
        return nil, failure("idle session owner is invalid", candidate, errors.INTERNAL)
    end
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then return nil, failure("idle session transaction failed", begin_err, errors.UNAVAILABLE) end
    local owner, usage_err = conversation.lock_tx(tx, dbtype, candidate.provider :: string,
        candidate.external_id :: string)
    if usage_err then tx:rollback(); return nil, usage_err end
    if tonumber(owner.deleting) == 1 then tx:rollback(); return false, nil end
    local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE" or ""
    local rows, read_err = tx:query([[SELECT session_id FROM kickside_channel_sessions
        WHERE provider=$1 AND external_id=$2 AND session_id=$3 AND updated_at<=$4]] .. lock,
        { candidate.provider, candidate.external_id, candidate.session_id, cutoff })
    if read_err then tx:rollback(); return nil, failure("idle session recheck failed", read_err, errors.INTERNAL) end
    if type(rows) ~= "table" then
        tx:rollback(); return nil, failure("idle session recheck returned no rows result", "missing result", errors.INTERNAL)
    end
    if not rows[1] then tx:rollback(); return false, nil end

    local removed, remove_err = tx:execute([[DELETE FROM kickside_channel_sessions
        WHERE provider=$1 AND external_id=$2 AND session_id=$3 AND updated_at<=$4]],
        { candidate.provider, candidate.external_id, candidate.session_id, cutoff })
    if remove_err then tx:rollback(); return nil, failure("idle session detach failed", remove_err, errors.INTERNAL) end
    if not removed or tonumber(removed.rows_affected) ~= 1 then
        tx:rollback(); return nil, failure("idle session detach affected no mapping", removed, errors.INTERNAL)
    end

    -- An idle retirement has no successor: the required new_session_id field
    -- repeats the old id. The reason distinguishes it from a real rotation.
    local _, archive_err = tx:execute([[INSERT INTO kickside_channel_session_archives
        (old_session_id,new_session_id,provider,external_id,reason,rotated_at)
        VALUES ($1,$1,$2,$3,'idle_retirement',$4)]],
        { candidate.session_id, candidate.provider, candidate.external_id,
            time.now():utc():format_rfc3339() })
    if archive_err then tx:rollback(); return nil, failure("idle session archive failed", archive_err, errors.INTERNAL) end
    local _, commit_err = tx:commit()
    if commit_err then return nil, failure("idle session commit failed", commit_err, errors.UNAVAILABLE) end
    return true, nil
end

function M.retire_idle(db_id: string, cutoff: string, limit: integer): (integer?, error?)
    if type(db_id) ~= "string" or db_id == "" or type(cutoff) ~= "string" or cutoff == ""
        or type(limit) ~= "number" or limit ~= math.floor(limit) or limit < 1 or limit > 50 then
        return nil, failure("idle session retention arguments invalid", "db_id, cutoff and limit 1..50 required", errors.INVALID)
    end
    local db, open_err = sql.get(db_id)
    if open_err or not db then return nil, failure("idle session database unavailable", open_err, errors.UNAVAILABLE) end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return nil, failure("idle session database type failed", type_err, errors.INTERNAL) end
    if dbtype ~= sql.type.POSTGRES and dbtype ~= sql.type.SQLITE then
        db:release(); return nil, failure("idle session dialect unsupported", dbtype, errors.INTERNAL)
    end
    local rows, scan_err = db:query([[SELECT provider,external_id,session_id
        FROM kickside_channel_sessions WHERE updated_at<=$1
        ORDER BY updated_at,provider,external_id LIMIT $2]], { cutoff, limit })
    if scan_err then db:release(); return nil, failure("idle session scan failed", scan_err, errors.INTERNAL) end
    if type(rows) ~= "table" then
        db:release(); return nil, failure("idle session scan returned no rows result", "missing result", errors.INTERNAL)
    end
    local count = 0
    for _, candidate in ipairs(rows) do
        local retired, retire_err = retire_one(db, dbtype, candidate, cutoff)
        if retire_err then db:release(); return nil, retire_err end
        if retired then count = count + 1 end
    end
    db:release()
    return count, nil
end

return M
