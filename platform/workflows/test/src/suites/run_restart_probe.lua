local store = require("store")

local M = {}

function M.run(args: any): (any?, error?)
    local id = type(args) == "table" and args.workflow_id or nil
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({ message = "workflow_id required", kind = errors.INVALID }) :: error)
    end
    local db, open_err = store.open_db()
    if open_err or not db then return nil, open_err end
    local physical, physical_err = db:query("SELECT COUNT(*) AS n FROM workflow_runs WHERE workflow_id=$1", { id })
    db:release()
    if physical_err then return nil, physical_err end
    return { physical = tonumber(physical[1] and physical[1].n) }, nil
end

return M
