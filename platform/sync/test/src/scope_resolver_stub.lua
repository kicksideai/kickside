local security = require("security")
local execution_identity = require("execution_identity")

local M = {}

function M.resolve(args: any): any
    local principal = type(args) == "table" and args.principal or nil
    if type(principal) ~= "table" or type(principal.id) ~= "string" then
        return nil, "principal is required"
    end
    return {
        principal = principal,
        actor_id = execution_identity.actor_key(principal),
        groups = { "automation_test" },
        scope_name = "wippy.security:process",
        meta = { user_id = principal.id, status = "active" },
    }
end

return M
