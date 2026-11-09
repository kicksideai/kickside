-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local refresh_schedule = require("refresh_schedule")
local pending_delete = require("pending_delete")
local M = { removed = 0 }
local component_id: string = ""

function M.configure(id: string)
    component_id = id
    M.removed = 0
end

function M.get(key: string): (any, any)
    if key ~= "component_id" then error("unexpected context key: " .. key) end
    return component_id, nil
end

function M.cancel_for_component(id: string): any
    local cancelled = refresh_schedule.cancel_for_component(id)
    if not cancelled.success then return cancelled end
    local removed, sweep_err = pending_delete.run(1, id)
    if sweep_err then error(tostring(sweep_err)) end
    M.removed = removed
    return cancelled
end

return M
