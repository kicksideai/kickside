-- Deletable teardown: release the automations addressed at this workflow, then
-- purge the five definition-plane tables for it. Invoked by the component
-- service during delete, before the component row is unregistered.

local ctx = require("ctx")
local workflow = require("workflow")
local destination_bindings = require("destination_bindings")

local function delete()
    local id = ctx.get("component_id")
    if id and id ~= "" then
        local released, release_err = destination_bindings.release(tostring(id))
        if not released then return { success = false, error = release_err } end
        local ok, err = workflow.purge(tostring(id))
        if not ok then return { success = false, error = err } end
    end
    return { success = true }
end

return { delete = delete }
