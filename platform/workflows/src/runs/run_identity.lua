-- Preserve the admitted delivery identity across adoption; direct callers
-- select the automation identity before admission.
local automation = require("automation")
local execution_identity = require("execution_identity")
local security = require("security")

local M = {}

function M.load(automation_id: string): (any?, any?)
    local actor = security.actor()
    local metadata = actor and actor:meta() or {}
    local identity = metadata.execution_identity
    if type(identity) ~= "table" or identity.component_id ~= automation_id then
        local runtime, runtime_err = automation.get_runtime({ id = automation_id })
        if runtime_err or type(runtime) ~= "table" then return nil, runtime_err end
        identity = runtime.execution_identity
    end
    local valid, validate_err = execution_identity.validate(identity)
    if not valid then return nil, validate_err end
    local actor_id = actor and actor:id() or nil
    if actor_id ~= execution_identity.actor_key(identity.principal) then
        return nil, "invoking actor differs from the automation execution principal"
    end
    return identity, nil
end

return M
