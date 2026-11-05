-- Projection bodies use the thread's committed event read level.
local sql = require("sql")
local component = require("component")
local core_types = require("core_types")
local M = {}
function M.has_access(db: sql.DB, owner_id: string): (boolean, error?)
    local rows, query_err = db:query("SELECT component_id,event_read FROM kickside_thread WHERE id=$1", {owner_id})
    if query_err then return false, errors.wrap(query_err, "failed to read projection owner") end
    local thread = rows and rows[1]
    if thread and thread.event_read == "admin" then
        return component.has_access(thread.component_id, (core_types.ACCESS.ADMIN :: integer))
    end
    return true, nil
end
return M
