-- Kept under its historical registry id because installed Sync/OAuth kinds
-- address it here. The component deletable owns the automation's full teardown.

local ctx = require("ctx")
local owner_gc = require("owner_gc")

local M = {}

function M.handle(request: any?): ({ [string]: any }, any)
    local id, id_err = ctx.get("component_id")
    if type(id) ~= "string" or id == "" then
        return { success = false, error = errors.new({ message = "automation component id unavailable: " .. tostring(id_err),
            kind = errors.INTERNAL, retryable = true }) }, nil
    end
    local rollback = ctx.get("_rollback")
    local options = type(request) == "table" and (request :: any).options or nil
    local result, err = owner_gc.delete(id, rollback, options)
    if err then return { success = false, error = err }, nil end
    return { success = true, replayed = result.replayed, removed = result.removed,
        discarded = result.discarded }, nil
end

return M
