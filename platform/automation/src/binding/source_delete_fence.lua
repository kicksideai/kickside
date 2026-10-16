local sql = require("sql")
local automation_db = require("automation_db")

local M = {}

local function failure(message: string, cause: any): error
    return (errors.new({ message = message .. ": " .. tostring(cause), kind = errors.INTERNAL, retryable = true }) :: error)
end

-- Idempotent owner fence. A removed or moved drive no longer consumes this
-- source; a matching drive is made visibly blocked before core deletes events.
function M.fence(request: any): (any?, error?)
    local args = type(request) == "table" and request or {}
    local source = args.source_thread_id
    local key = args.consumer_key
    if type(source) ~= "string" or source == "" or type(key) ~= "string" then
        return nil, (errors.new({ message = "source_thread_id and consumer_key are required", kind = errors.INVALID }) :: error)
    end
    local owner, drive_key = key:match("^drive:([^:]+):(.+)$")
    if not owner or not drive_key then
        return nil, (errors.new({ message = "unrecognized retention consumer: " .. key, kind = errors.CONFLICT }) :: error)
    end
    return automation_db.in_tx(function(tx: any): (any?, error?)
        local dialect, dialect_err = tx:db_type()
        if dialect_err or not dialect then return nil, failure("source fence dialect unavailable", dialect_err) end
        local lock = tostring(dialect) == sql.type.SQLITE and "" or " FOR UPDATE"
        local command, command_err = tx:query("SELECT generation FROM kickside_automation_command WHERE automation_id=$1" .. lock, { owner })
        if command_err or type(command) ~= "table" then return nil, failure("source fence command lock failed", command_err or "missing result") end
        local rows, read_err = tx:query("SELECT source_thread_id,phase FROM kickside_automation_drive"
            .. " WHERE automation_id=$1 AND drive_key=$2" .. lock, { owner, drive_key })
        if read_err or type(rows) ~= "table" then return nil, failure("source fence drive lock failed", read_err or "missing result") end
        local row = rows[1]
        if not row or tostring(row.source_thread_id) ~= source then
            return { fenced = true, consumer_status = "source_released" }, nil
        end
        if row.phase == "blocked_source_deleted" then
            return { fenced = true, consumer_status = "blocked_source_deleted" }, nil
        end
        local result, update_err = tx:execute("UPDATE kickside_automation_drive SET phase='blocked_source_deleted',"
            .. " enabled=$1, revision=revision+1, round_token=NULL, round_until=NULL,"
            .. " last_error_json=$2 WHERE automation_id=$3 AND drive_key=$4 AND source_thread_id=$5",
            { tostring(dialect) == sql.type.SQLITE and 0 or false,
              '{"kind":"blocked_source_deleted","message":"source thread was deleted"}', owner, drive_key, source })
        if update_err or not result or tonumber(result.rows_affected) ~= 1 then
            return nil, failure("source fence drive update failed", update_err or "missing row proof")
        end
        return { fenced = true, consumer_status = "blocked_source_deleted" }, nil
    end)
end

return M
