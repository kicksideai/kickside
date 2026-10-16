local sql = require("sql")

local M = {}

function M.handle(args: any): (any?, error?)
    local id = type(args) == "table" and (args :: any).component_id or nil
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ message = "rollback probe needs component_id", kind = errors.INVALID }) :: error)
    end
    local options = (args :: any)._delete_options
    local keep = type(options) == "table" and options.keep_thread == true and "yes" or "no"
    local db, db_err = sql.get("app:db")
    if db_err or not db then
        return nil, (errors.new({ message = "rollback probe database unavailable: " .. tostring(db_err),
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    local _, write_err = db:execute("INSERT INTO owner_gc_rollback_log (component_id,keep_thread) VALUES ($1,$2)",
        { id, keep })
    db:release()
    if write_err then
        return nil, (errors.new({ message = "rollback probe write failed: " .. tostring(write_err),
            kind = errors.INTERNAL, retryable = true }) :: error)
    end
    return { success = true }, nil
end

return M
