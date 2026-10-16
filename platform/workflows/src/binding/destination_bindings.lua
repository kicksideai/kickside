-- Automations reach a Workflow through an exact published reference. The
-- reference cannot be repointed, so a removed Workflow takes every automation
-- addressed at it. Automation owns that relation and answers for it through one
-- contract call; Workflows never reads automation storage.

local contract = require("contract")

local M = {}

local OWNED_RESOURCE = "kickside.automation:owned_resource"

-- The resource kind is the destination reference's own kind, so no second
-- vocabulary exists for naming a Workflow to Automation.
M.RESOURCE_KIND = "flow"

M._open = function(): (any?, string?)
    local definition, definition_err = contract.get(OWNED_RESOURCE)
    if definition_err or not definition then
        return nil, "automation teardown unavailable: " .. tostring(definition_err or "not found")
    end
    local instance, open_err = (definition :: any):open()
    if open_err or not instance then
        return nil, "automation teardown open failed: " .. tostring(open_err or "not found")
    end
    return instance, nil
end

-- release removes every automation that addresses this Workflow. A failure is
-- returned so the Workflow delete stops rather than leaving automations pointed
-- at a destination that no longer exists.
function M.release(workflow_id: string): (boolean, string?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return false, "workflow id required" end
    local instance, open_err = M._open()
    if open_err or not instance then return false, open_err end
    local result, call_err = (instance :: any):teardown_owner({
        resource_kind = M.RESOURCE_KIND,
        resource_id = workflow_id,
    })
    if call_err then return false, tostring(call_err) end
    local out = type(result) == "table" and (result :: { [string]: any }) or {}
    if type(out.error) == "string" and out.error ~= "" then return false, tostring(out.error) end
    return true, nil
end

return M
