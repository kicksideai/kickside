-- Fresh process read of durable identity audits after its predecessor exits.
local sql = require("sql")

local M = {}

function M.run(args: any): (any?, error?)
    local id = type(args) == "table" and args.component_id or nil
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ message = "component_id required", kind = errors.INVALID }) :: error)
    end
    local db, open_err = sql.get("app:db")
    if open_err or not db then return nil, open_err end
    local rows, rows_err = db:query("SELECT COUNT(*) AS n FROM kickside_execution_identity_audit WHERE component_id=$1", { id })
    db:release()
    if rows_err or type(rows) ~= "table" then return nil, rows_err end
    return { physical = tonumber(rows[1] and rows[1].n) }, nil
end

return M
