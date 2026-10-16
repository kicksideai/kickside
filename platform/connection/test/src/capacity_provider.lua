local sql = require("sql")
local M = {}

local function invoke(args: any, method: string): (any?, error?)
    local config = args.config or {}
    local db, db_err = sql.get("app:db")
    if db_err then return nil, db_err end
    local _, write_err = db:execute("INSERT INTO connection_capacity_calls (connection_id, method) VALUES ($1,$2)",
        { config.connection_id, method })
    db:release()
    if write_err then return nil, write_err end
    if config.limited == true then
        return nil, (errors.new({ kind = errors.RATE_LIMITED, retryable = true,
            message = "connection capacity", details = { code = "provider_capacity", scope = "capacity",
                retry_at_ms = config.retry_at_ms } }) :: error)
    end
    return { success = true, items = {}, keys = {}, next_cursor = "", has_more = false }, nil
end

function M.pull(args: any): (any?, error?) return invoke(args, "pull") end
function M.keys(args: any): (any?, error?) return invoke(args, "keys") end
function M.write(args: any): (any?, error?) return invoke(args, "write") end
return M
