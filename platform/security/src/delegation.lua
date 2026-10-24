local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local time = require("time")
local identity = require("execution_identity")
local catalog = require("scope_catalog")
local reconcile = require("trigger_reconcile")
local M = {}

local function failure(kind, message, retryable)
    return errors.new({kind = kind, message = message, retryable = retryable == true})
end

local function normalize(args, operation)
    if type(args) ~= "table" then return nil, failure(errors.INVALID, "request is required") end
    local principal, principal_err = identity.check_principal(args.principal, "principal")
    if principal_err then return nil, principal_err end
    if principal.kind ~= "user" then return nil, failure(errors.INVALID, "delegation target must be an ordinary user") end
    if type(args.root) ~= "string" or args.root == "" then return nil, failure(errors.INVALID, "root is required") end
    local groups, seen = table.create(1, 0), {}
    if operation == "save" then
        if type(args.groups) ~= "table" or #args.groups == 0 then return nil, failure(errors.INVALID, "operator groups are required") end
        for key, value in pairs(args.groups) do
            if type(key) ~= "number" or key < 1 or key > #args.groups or key % 1 ~= 0
                or type(value) ~= "string" or value == "" then
                return nil, failure(errors.INVALID, "operator groups must be a dense string array")
            end
            if not seen[value] then groups[#groups + 1] = value; seen[value] = true end
        end
        table.sort(groups)
    end
    return {operation = operation, principal = principal, root = args.root, groups = groups}, nil
end

local function validate_host(request)
    local config, config_err = registry.get("kickside.security:delegation_config")
    if config_err then return nil, config_err end
    local validator = config and config.meta and config.meta.validator
    if type(validator) ~= "string" or validator == "" then
        return nil, failure(errors.UNAVAILABLE, "host delegation validation is unconfigured", true)
    end
    local result, call_err = funcs.call(validator, {principal = request.principal, root = request.root})
    if call_err then return nil, call_err end
    if type(result) ~= "table" or result.success ~= true then
        return nil, failure(errors.PERMISSION_DENIED, "host delegation validation refuses target or root")
    end
    local available, catalog_err = catalog.scopes()
    if catalog_err then return nil, catalog_err end
    local assignable = {}
    for _, group in ipairs(available) do
        if group.enabled and not group.internal then assignable[group.id] = true end
    end
    for _, group in ipairs(request.groups) do
        if not assignable[group] then return nil, failure(errors.PERMISSION_DENIED, "operator group is not assignable") end
    end
    return true, nil
end

local function owned(entry, request)
    return entry and tostring(entry.kind) == "security.policy" and entry.meta
        and entry.meta.managed_by == "kickside.security" and entry.meta.intent == "execution_delegation"
        and entry.meta.target_id == request.principal.id and entry.meta.root == request.root
end

local function mutate(args, operation)
    local request, input_err = normalize(args, operation)
    if input_err then return nil, input_err end
    local policy_id = identity.delegation_policy_id(request.principal.kind, request.principal.id, request.root)
    local actor = security.actor()
    if not actor or actor:id() == "" or not security.can("access", "kickside.security.api:delegation_" .. operation .. ".endpoint")
        or not security.can("registry.apply", policy_id) then
        return nil, failure(errors.PERMISSION_DENIED, "delegation mutation requires Security administration and native policy-write authority")
    end
    local resource = identity.delegation_bytes(request.principal.kind, request.principal.id, request.root)
    local snap, snapshot_err = registry.snapshot()
    if snapshot_err then return nil, snapshot_err end
    if operation == "save" then
        local valid, validation_err = validate_host(request)
        if validation_err or not valid then return nil, validation_err end
    end
    local current, current_err = snap:get(policy_id)
    if current_err and not errors.is(current_err, errors.NOT_FOUND) then return nil, current_err end
    if current and not owned(current, request) then return nil, failure(errors.CONFLICT, "canonical policy ID belongs to another declaration") end
    if operation == "revoke" and not current then return nil, failure(errors.NOT_FOUND, "delegation policy is absent") end
    local fence_groups = {}
    for _, group in ipairs(current and current.data.groups or {}) do fence_groups[#fence_groups + 1] = group end
    local conditions = {{field = "resource", operator = "eq", value = resource}}
    -- A retained revoked declaration cannot match, including through composed scopes.
    if operation == "revoke" then conditions[#conditions + 1] = {field = "resource", operator = "eq", value = ""} end
    local desired = {id = policy_id, kind = "security.policy", meta = {managed_by = "kickside.security",
        intent = "execution_delegation", target_id = request.principal.id, root = request.root,
        grantor = actor:id(), created_at = time.now():utc():format_rfc3339(), active = operation == "save"},
        data = {groups = request.groups, policy = {actions = "security.actor.delegate",
            resources = "*", effect = "allow", conditions = conditions}}}
    local changes = snap:changes()
    if current then changes:update(desired) else changes:create(desired) end
    local _, apply_err = changes:apply()
    if apply_err then return nil, apply_err end
    local version, version_err = registry.current_version()
    if version_err then return nil, version_err end
    if not version then
        return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "delegation registry commit has no current version"}) :: error)
    end
    local reconciled, reconcile_err = reconcile.trigger({source = "security.delegation",
        observed_registry_version = tostring(version:id()), fence_groups = fence_groups})
    if reconcile_err or not reconciled then return nil, reconcile_err end
    return {success = true, policy_id = policy_id, resource = resource}, nil
end

function M.save(args) return mutate(args, "save") end
function M.revoke(args) return mutate(args, "revoke") end

function M.list()
    if not security.actor() or not security.can("access", "kickside.security.api:delegation_list.endpoint") then
        return nil, failure(errors.PERMISSION_DENIED, "delegation catalog requires Security administration")
    end
    local entries, read_err = registry.find({[".kind"] = "security.policy",
        ["meta.managed_by"] = "kickside.security", ["meta.intent"] = "execution_delegation"})
    if read_err then return nil, read_err end
    local rows = table.create(1, 0)
    for _, entry in ipairs(entries) do
        rows[#rows + 1] = {policy_id = tostring(entry.id), principal = {kind = "user", id = entry.meta.target_id},
            root = entry.meta.root, groups = entry.data.groups, grantor = entry.meta.grantor,
            active = entry.meta.active, created_at = entry.meta.created_at}
    end
    table.sort(rows, function(left, right) return left.policy_id < right.policy_id end)
    return {success = true, delegations = rows}, nil
end
return M
