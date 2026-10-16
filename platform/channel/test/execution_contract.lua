local test_state = require("test_state")
local M = {}

function M.get(id)
    if id ~= "kickside.contract:scope_resolver" then return nil, "unknown resolver" end
    local resolver = {
        resolve = function(_self, args)
            test_state.state.resolve_request = args
            if test_state.state.witness_identity_err then
                return nil, errors.new({ message = test_state.state.witness_identity_err,
                    kind = errors.PERMISSION_DENIED, retryable = false,
                    details = { error_kind = "subject" } })
            end
            return { principal = args.principal, actor_id = args.principal.id,
                scope_name = "app:member", groups = {}, meta = {} }, nil
        end,
    }
    local bound = { with_actor = function()
        return { with_scope = function()
            return { open = function() return resolver, nil end }, nil
        end }, nil
    end }
    return bound, nil
end

return M
