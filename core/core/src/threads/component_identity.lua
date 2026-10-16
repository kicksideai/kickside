-- The execution identity stored on a component (its private _execution_identity),
-- read through the trusted component tier: the owner loader for a thread's
-- declared projections and for converge (IDENTITY-1 §4 T row). Kept apart from
-- threads_component, which sits on the component lifecycle import path.
local component_client = require("component_client")
local execution_identity = require("execution_identity")
local error_envelope = require("error_envelope")

local M = {}

-- Answers (identity?, err): nil when the component carries none (a
-- framework-created component); a stored value that is not a valid v2 identity
-- is a declaration error, never a fallback to the framework identity.
function M.execution_identity_of(component_id: string): (any?, error?)
    local context, read_err = component_client.get_private_context(component_id)
    context, read_err = error_envelope.binding(context, read_err, nil, "read component private context", "component_identity_context_missing")
    if read_err then return nil, read_err end
    local stored = (context :: { [string]: any })[execution_identity.CONTEXT_KEY]
    if stored == nil then return nil, nil end
    local ok, invalid = execution_identity.validate(stored)
    if invalid then return nil, errors.wrap(invalid, "component " .. component_id .. " has no valid execution identity") end
    if ok ~= true then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "component identity validation returns no successful proof", details = {code = "component_identity_validation_missing"}})
    end
    return stored, nil
end

return M
