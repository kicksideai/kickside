-- One principal-cleanup page. The caller's durable lifecycle event retries a
-- partial page; the component deletable also preserves its component row on it.
local sql = require("sql")
local resources = require("uploads_resources")
local upload_types = require("types")

local M = {}
local PAGE = 100

local function failure(message: string, kind: string, cause: any?): error
    return (errors.new({ message = message .. (cause and ": " .. tostring(cause) or ""),
        kind = kind, retryable = kind ~= errors.INVALID }) :: error)
end

function M.delete_for_actor(actor_id: string): (integer?, error?)
    if type(actor_id) ~= "string" or actor_id == "" then
        return nil, failure("actor_id is required", errors.INVALID)
    end
    local component_id = upload_types.component_id_for_owner(actor_id)
    if not component_id then return nil, failure("upload actor has no uploads component id", errors.INVALID) end
    local db, db_err = resources.get_db()
    if db_err or not db then return nil, failure("upload database unavailable", errors.UNAVAILABLE, db_err) end
    local tx, begin_err = db:begin({ isolation = sql.isolation.SERIALIZABLE })
    if begin_err or not tx then db:release(); return nil, failure("upload model delete begin failed", errors.UNAVAILABLE, begin_err) end
    local result, delete_err = tx:execute([[WITH page AS (
        SELECT upload_id FROM kickside_upload_read_model WHERE component_id=$1
        ORDER BY upload_id LIMIT $2)
        DELETE FROM kickside_upload_read_model WHERE upload_id IN (SELECT upload_id FROM page)]],
        { component_id, PAGE })
    if delete_err or not result or tonumber(result.rows_affected) == nil then
        tx:rollback(); db:release()
        return nil, failure("upload read-model owner delete failed", errors.INTERNAL,
            delete_err or "missing affected-row count")
    end
    local remaining, read_err = tx:query(
        "SELECT upload_id FROM kickside_upload_read_model WHERE component_id=$1 LIMIT 1", { component_id })
    if read_err or type(remaining) ~= "table" then
        tx:rollback(); db:release()
        return nil, failure("upload read-model continuation read failed", errors.INTERNAL,
            read_err or "missing rows")
    end
    local more = remaining[1] ~= nil
    local count = tonumber(result.rows_affected) :: integer
    local _, commit_err = tx:commit()
    db:release()
    if commit_err then return nil, failure("upload read-model page commit failed", errors.UNAVAILABLE, commit_err) end
    if more then return nil, failure("upload read-model cleanup needs another page", errors.CONFLICT) end
    return count, nil
end

return M
