-- Verify that a workflow writable is being invoked as its automation's
-- stored execution principal before admitting the run.
local automation = require("automation")
local execution_identity = require("execution_identity")
local security = require("security")

local M = {}

function M.load(automation_id: string): (any?, any?)
    local runtime, runtime_err = automation.get_runtime({ id = automation_id })
    if runtime_err or type(runtime) ~= "table" then return nil, runtime_err end
    local identity = runtime.execution_identity
    local valid, validate_err = execution_identity.validate(identity)
    if not valid then return nil, validate_err end
    local actor = security.actor()
    local actor_id = actor and actor:id() or nil
    if actor_id ~= execution_identity.actor_key(identity.principal) then
        return nil, "invoking actor differs from the automation execution principal"
    end
    return identity, nil
end

return M
