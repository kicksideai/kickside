local subjects = require("scope_resolver")
local identity = require("execution_identity")
local component = require("component")

local function failure(kind: string, message: string): error
    return (errors.new({kind = kind, message = message, retryable = false}) :: error)
end

local function validate(args: any): (any?, error?)
    if type(args) ~= "table" then return nil, failure(errors.INVALID, "delegation target and root are required") end
    local principal, principal_err = identity.check_principal(args.principal, "principal")
    if principal_err then return nil, principal_err end
    if principal.kind ~= "user" then return nil, failure(errors.INVALID, "delegation target must be an ordinary user") end
    local root = args.root
    if type(root) ~= "string" or root == "" then return nil, failure(errors.INVALID, "delegation root is required") end
    local target, target_err = subjects.lookup_subject(principal.id, true)
    if target_err then return nil, target_err end
    if type(target.meta) ~= "table" or target.meta.user_id ~= principal.id then
        return nil, failure(errors.PERMISSION_DENIED, "delegation target must use its canonical user ID")
    end
    if root ~= "*" then
        local rows, root_err = component.list_system({component_ids = {root},
            include = {meta = false, private_context = false}, limit = 1})
        if root_err then return nil, root_err end
        if #rows == 0 then return nil, failure(errors.NOT_FOUND, "delegation root is absent") end
    end
    return {success = true}, nil
end

return {validate = validate}
