local execution_identity = require("execution_identity")

local M = {}

-- The harness users resolver (IDENTITY-1): a principal answers with its
-- runtime actor key, the harness scope and group.
function M.resolve(args: any): any
    local principal = type(args) == "table" and (args :: any).principal or nil
    if type(principal) ~= "table" or type(principal.id) ~= "string" then
        return nil, "principal is required"
    end
    return {
        principal = { kind = principal.kind, id = principal.id },
        actor_id = execution_identity.actor_key(principal),
        groups = { "oauth_test" },
        scope_name = "wippy.security:process",
        meta = { user_id = principal.kind == "user" and principal.id or nil, status = "active",
            security_groups = { "oauth_test" } },
    }
end

return M
