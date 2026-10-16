-- Live credential and external-link restrictions for execution identity.
-- This owns protected owner reads; the resolver calls it directly on each run.
local authority_snapshot = require("authority_snapshot")
local M = {}
type Map = { [string]: any }
type ExecutionIdentity = { principal: { kind: string, id: string }, credential_id: string?, link_id: string? }
local CREDENTIAL_RESTRICTION = "kickside.mcp:credential_restriction"
local LINK_GET = "kickside.identity:link_get"
local MCP_SCOPE = "kickside.mcp.security:session"
local function failure(message: string, kind: string, error_kind: string?, retryable: boolean?): error
    return (errors.new({ message = message, kind = kind, retryable = retryable,
        details = error_kind and { code = error_kind, error_kind = error_kind } or nil }) :: error)
end

local function dependency_failure(err: any, context: string): error
    if type(err) == "userdata" then return err :: error end
    return failure(context .. ": " .. tostring(err), errors.UNAVAILABLE, "infrastructure", true)
end

local function owner_read(funcs_mod: any, fn_id: string, args: Map): (any?, error?)
    local builder, builder_err = funcs_mod.new()
    if builder_err or not builder then
        return nil, dependency_failure(builder_err, "restriction reader unavailable")
    end
    local result, read_err = builder:call(fn_id, args)
    if read_err then
        return nil, dependency_failure(read_err, "restriction read failed")
    end
    return result, nil
end

function M.load(id: ExecutionIdentity, funcs_mod: any): (Map?, error?)
    local restrictions: Map = {}
    if id.credential_id ~= nil then
        if id.principal.kind ~= "user" then
            return nil, failure("MCP credential requires a user principal", errors.PERMISSION_DENIED, "subject", false)
        end
        local credential, credential_err = owner_read(funcs_mod, CREDENTIAL_RESTRICTION, { credential_id = id.credential_id })
        if credential_err then return nil, credential_err end
        if type(credential) ~= "table" or credential.credential_id ~= id.credential_id
            or credential.actor_id ~= id.principal.id or credential.status ~= "active" then
            return nil, failure("stored credential is revoked or belongs to another principal",
                errors.PERMISSION_DENIED, "subject", false)
        end
        if type(credential.whitelist_component_ids) ~= "table" then
            return nil, failure("stored credential has no authoritative whitelist", errors.PERMISSION_DENIED, "subject", false)
        end
        if #credential.whitelist_component_ids > 0 then
            if type(credential.whitelist_prefixes) ~= "table" then
                return nil, failure("credential subtree restriction was not resolved", errors.PERMISSION_DENIED, "subject", false)
            end
            restrictions.access_filter = { prefixes = credential.whitelist_prefixes }
        end
        if credential.authority ~= nil then
            local valid, authority_err = authority_snapshot.validate(credential.authority)
            if not valid then return nil, authority_err end
            restrictions.authority = credential.authority
        end
        restrictions.credential_id = id.credential_id
        if credential.scope_policy_ids ~= nil then
            if type(credential.scope_policy_ids) ~= "table" then
                return nil, failure("credential restriction policies must be an array",
                    errors.PERMISSION_DENIED, "subject", false)
            end
            restrictions.scope_policy_ids = credential.scope_policy_ids
        end
        restrictions.scope_name = MCP_SCOPE
    end
    if id.link_id ~= nil then
        if id.principal.kind ~= "user" then
            return nil, failure("external link requires a user principal", errors.PERMISSION_DENIED, "subject", false)
        end
        local link, link_err = owner_read(funcs_mod, LINK_GET, { link_id = id.link_id })
        if link_err then return nil, link_err end
        if type(link) ~= "table" or link.link_id ~= id.link_id or link.user_id ~= id.principal.id
            or type(link.provider) ~= "string" or link.provider == ""
            or type(link.external_id) ~= "string" or link.external_id == "" then
            return nil, failure("stored external link is missing or belongs to another principal",
                errors.PERMISSION_DENIED, "subject", false)
        end
        restrictions.link_id = id.link_id
    end
    return restrictions, nil
end

return M
