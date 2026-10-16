-- MCP owns bearer admission and tool surface. The protected credential row is
-- loaded here, then core execution owns the only live actor/scope resolution.
local production_identity = require("execution_identity")
local production_funcs = require("funcs")
local production_repo = require("mcp_repo")
local consts = require("mcp_consts")
local public_url = require("public_url")

local function construct(dependencies: any): any
local execution_identity = dependencies.execution_identity
local repo = dependencies.repo
local funcs = dependencies.funcs
local M = {}

local function bind_failure(message: string, cause: any, infrastructure: boolean): error
    if type(cause) == "userdata" then return cause :: error end
    return (errors.new({ message = message .. ": " .. tostring(cause),
        kind = infrastructure and errors.UNAVAILABLE or errors.PERMISSION_DENIED,
        retryable = infrastructure,
        details = { error_kind = infrastructure and "infrastructure" or "access" },
    }) :: error)
end

function M.authorize(principal: any): (any?, any)
    local credential_id = type(principal) == "table" and (principal :: any).credential_id or nil
    if type(credential_id) ~= "string" or credential_id == "" then
        return nil, errors.new({ message = "credential reference is required", kind = errors.PERMISSION_DENIED,
            retryable = false, details = { error_kind = "subject" } })
    end
    local stored, load_err = repo.restriction_get(credential_id)
    if load_err or not stored then
        return nil, load_err or errors.new({ message = "credential is unavailable",
            kind = errors.UNAVAILABLE, retryable = true, details = { error_kind = "infrastructure" } })
    end
    if stored.actor_id ~= principal.actor_id then
        return nil, errors.new({ message = "credential owner mismatch", kind = errors.PERMISSION_DENIED,
            retryable = false, details = { error_kind = "subject" } })
    end
    if stored.oauth_resource ~= nil and not public_url.same_resource(stored.oauth_resource, public_url.mcp_url()) then
        return nil, errors.new({ message = "credential resource mismatch", kind = errors.PERMISSION_DENIED,
            retryable = false, details = { error_kind = "subject" } })
    end
    local frame, resolve_err = execution_identity.resolve(stored.execution_identity,
        { deferred_owner = consts.DEFERRED_OWNER })
    if resolve_err or not frame then return nil, resolve_err end
    frame.credential_id = credential_id
    return frame, nil
end

function M.can_invoke(tool_id: string, frame: any): boolean
    return frame.scope:evaluate(frame.actor, "funcs.call", tool_id) == "allow"
end

function M.invoke(tool_id: string, args: any, principal: any, context: any, authorized: any?): (any?, any)
    local frame = authorized
    if frame == nil then
        local resolved, resolve_err = M.authorize(principal)
        if resolve_err or not resolved then return nil, resolve_err end
        frame = resolved
    end
    if type(frame) ~= "table" or type(principal) ~= "table"
        or frame.credential_id ~= principal.credential_id then
        return nil, errors.new({ message = "MCP frame does not match its credential", kind = errors.PERMISSION_DENIED,
            retryable = false, details = { error_kind = "subject" } })
    end
    if not M.can_invoke(tool_id, frame) then
        return nil, errors.new({ message = "function access denied: " .. tool_id, kind = errors.PERMISSION_DENIED,
            retryable = false, details = { error_kind = "access" } })
    end
    local builder, builder_err = funcs.new()
    if builder_err or not builder then return nil, bind_failure("MCP function builder unavailable", builder_err, true) end
    local with_actor, actor_err = builder:with_actor(frame.actor)
    if actor_err or not with_actor then return nil, bind_failure("MCP actor binding denied", actor_err, false) end
    local with_scope, scope_err = with_actor:with_scope(frame.scope)
    if scope_err or not with_scope then return nil, bind_failure("MCP scope binding denied", scope_err, false) end
    builder = with_scope
    if type(context) == "table" then
        local with_context, context_err = builder:with_context(context)
        if context_err or not with_context then
            return nil, bind_failure("MCP context binding denied", context_err, false)
        end
        builder = with_context
    end
    return builder:call(tool_id, args or {})
end

M.new = construct
return M
end

return construct({ execution_identity = production_identity, repo = production_repo, funcs = production_funcs })
