-- The one resource-authority check for an automation declaration. Both the
-- installer preflight and the trusted writer call this against live execution
-- identities; only the writer supplies a deferred owner for its system frame.
local component = require("component")
local execution_identity = require("execution_identity")
local registry = require("registry")
local security = require("security")

local M = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false,
        details = { error_kind = "declaration" } }) :: error)
end

local function denied(message: string): error
    return (errors.new({ message = message, kind = errors.PERMISSION_DENIED, retryable = false,
        details = { error_kind = "access" } }) :: error)
end

local function infrastructure(message: string): error
    return (errors.new({ message = message, kind = errors.UNAVAILABLE, retryable = true,
        details = { error_kind = "infrastructure" } }) :: error)
end

local REGISTRY_REFERENCES = {
    agent = {type = "agent.gen1", actions = {"registry.get"}},
    trait = {type = "agent.trait", actions = {"registry.get"}},
    module = {kind = "ns.definition", actions = {"registry.get"}},
    ["function"] = {kind_prefix = "function.", actions = {"registry.get", "funcs.call"}},
    contract = {kind = "contract.definition", actions = {"registry.get", "contract.get", "contract.open", "contract.call"}},
}

function M.new(dependencies: any): any
local authority = {}
local component = dependencies.component
local execution_identity = dependencies.execution_identity
local registry = dependencies.registry
local security = dependencies.security

function authority.check(identity: any, actor_id: any, refs: { any }, owner: string?): (boolean, error?)
    if type(identity) ~= "table" or type(identity.principal) ~= "table"
        or execution_identity.actor_key(identity.principal) ~= actor_id then
        return false, invalid("recorded declaration principal does not match its actor")
    end
    if not owner then
        local valid, validation_err = execution_identity.validate(identity)
        if not valid then return false, invalid(tostring(validation_err)) end
        local actor = security.actor()
        if not actor or tostring(actor:id()) ~= execution_identity.actor_key(identity.authorized_by) then
            return false, denied("declaration preflight must use the authenticated actor")
        end
    end
    local resolved, resolve_err = execution_identity.authorize(identity, owner and { deferred_owner = owner } or nil)
    if resolve_err or not resolved then return false, resolve_err end
    local meta = resolved.meta
    if type(meta) ~= "table" then return false, denied("authorized execution principal has no live metadata") end
    for _, ref in ipairs(refs) do
        -- Workflows, user agents, threads and connections are component-backed. Registry
        -- agents and traits are public definitions checked by the registry.
        local resource_id = ref.id
        local definition = REGISTRY_REFERENCES[ref.kind]
        local registry_reference = definition ~= nil and (ref.kind ~= "agent"
            or (ref.id:find(":", 1, true) and ref.id:sub(1, 11) ~= "user_agent:"))
        if registry_reference then
            local entry, entry_err = registry.get(ref.id)
            if entry_err then return false, infrastructure("reference registry lookup failed: " .. tostring(entry_err)) end
            if type(entry) ~= "table" then return false, nil end
            if definition.type and (type(entry.meta) ~= "table" or entry.meta.type ~= definition.type) then return false, nil end
            if definition.kind and tostring(entry.kind) ~= definition.kind then return false, nil end
            if definition.kind_prefix and tostring(entry.kind):sub(1, #definition.kind_prefix) ~= definition.kind_prefix then
                return false, nil
            end
            for _, action in ipairs(definition.actions) do
                local decision, evaluation_err = execution_identity.evaluate_live_scope(resolved, action, {ref.id})
                if evaluation_err then return false, evaluation_err end
                if decision ~= "allow" then return false, nil end
            end
        else
            if ref.kind == "agent" and resource_id:sub(1, 11) == "user_agent:" then
                resource_id = resource_id:sub(12)
            end
            if ref.kind ~= "component" and ref.kind ~= "connection"
                and ref.kind ~= "thread" and ref.kind ~= "agent" and ref.kind ~= "flow" then
                return false, invalid("no owner access check is registered for " .. tostring(ref.kind))
            end
            local mask = component.ACCESS[ref.access]
            if type(mask) ~= "number" then
                return false, invalid("invalid component reference access " .. tostring(ref.access))
            end
            local allowed, access_err = component.validate_principal_access(resource_id, mask,
                resolved.principal, meta.security_groups, meta.access_filter)
            if access_err then return false, access_err end
            if not allowed then return false, nil end
        end
    end
    return true, nil
end

return authority
end

M.check = M.new({ component = component, execution_identity = execution_identity, registry = registry, security = security }).check

return M
