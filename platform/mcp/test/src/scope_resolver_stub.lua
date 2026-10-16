local security = require("security")
local subjects = require("subjects")

-- V2 Users contract double: answers live owner membership, with no actor or
-- scope construction. Core execution performs that construction in this suite.
local M = {}
local USER_SCOPE = "app:mcp_suite_policy"

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED,
        retryable = false, details = { error_kind = "subject" } }) :: error)
end

function M.resolve(args: any): (any?, error?)
    if type(args) ~= "table" or type(args.principal) ~= "table"
        or args.principal.kind ~= "user" or type(args.principal.id) ~= "string" then
        return nil, denied("a user principal is required")
    end
    local owner = args.deferred_owner
    if owner ~= nil and security.can("kickside.execution.defer", owner) ~= true then
        return nil, denied("deferred owner is not trusted")
    end
    local authorizer = args.authorized_by
    if type(authorizer) ~= "table" or authorizer.kind ~= "user" then
        return nil, denied("recorded user authorizer is required")
    end
    local auth_row, auth_err = subjects.get(authorizer.id)
    if auth_err then return nil, denied(tostring(auth_err)) end
    if not auth_row or auth_row.status ~= subjects.STATUS.ACTIVE then
        return nil, denied("authorizer is inactive")
    end
    local subject, lookup_err = subjects.get(args.principal.id)
    if lookup_err then return nil, denied(tostring(lookup_err)) end
    if not subject or subject.status ~= subjects.STATUS.ACTIVE then
        return nil, denied("principal is inactive")
    end
    local initial = nil
    if subject.authority_epochs then
        initial = table.create(0, 1)
        for key in pairs(subject.authority_epochs) do initial[key] = 0 end
    end
    return {
        authority_epochs = subject.authority_epochs, initial_authority_epochs = initial,
        principal = { kind = "user", id = args.principal.id },
        actor_id = args.principal.id,
        groups = subject.groups,
        scope_name = subject.scope_name or USER_SCOPE,
        scope_groups = subject.scope_name and subject.groups or nil,
        meta = { user_id = args.principal.id, status = subject.status },
    }, nil
end

return M
