local registry = require("registry")
local security = require("security")
local contract = require("contract")
local time = require("time")
local identity = require("execution_identity")
local catalog = require("scope_catalog")
local reconcile = require("trigger_reconcile")
local component = require("component")
local M = {}

local DIRECTORY = "kickside.contract:directory"

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

-- The target is a live ordinary user by its canonical id, as the principal
-- directory answers it, and a component root exists.
local function validate(request)
    local directory_def, def_err = contract.get(DIRECTORY)
    if def_err then return nil, def_err end
    local directory, open_err = directory_def:open()
    if open_err then return nil, open_err end
    local target, target_err = directory:groups({id = request.principal.id})
    if target_err then return nil, target_err end
    if type(target) ~= "table" or target.active ~= true then
        return nil, failure(errors.PERMISSION_DENIED, "delegation target must be an active user by its canonical user ID")
    end
    if request.root ~= "*" then
        local rows, root_err = component.list_system({component_ids = {request.root},
            include = {meta = false, private_context = false}, limit = 1})
        if root_err then return nil, root_err end
        if #rows == 0 then return nil, failure(errors.NOT_FOUND, "delegation root is absent") end
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

local ROOT_PAGE = 50

local function root_item(row)
    local meta = type(row.meta) == "table" and row.meta or {}
    return {id = row.component_id, label = type(meta.title) == "string" and meta.title or "",
        icon = type(meta.icon) == "string" and meta.icon or ""}
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
        local valid, validation_err = validate(request)
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
    local version, apply_err = changes:apply()
    if apply_err then return nil, apply_err end
    if not version then
        return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "delegation registry commit has no committed version"}) :: error)
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
    local ids, seen = table.create(1, 0), {}
    for _, row in ipairs(rows) do
        if row.root ~= "*" and not seen[row.root] then ids[#ids + 1] = row.root; seen[row.root] = true end
    end
    if #ids > 0 then
        -- Names come from the components the viewer can read; others keep their id.
        local named, query_err = component.query({component_ids = ids, include = {meta = true}, limit = #ids})
        if query_err then return nil, query_err end
        local labels = {}
        for _, named_row in ipairs(named) do
            local item = root_item(named_row)
            if item.label ~= "" then labels[item.id] = item.label end
        end
        for _, row in ipairs(rows) do row.root_label = labels[row.root] end
    end
    return {success = true, delegations = rows}, nil
end

-- One page of the components the caller administers, for choosing a grant root.
function M.roots(args)
    if not security.actor() or not security.can("access", "kickside.security.api:delegation_roots.endpoint") then
        return nil, failure(errors.PERMISSION_DENIED, "delegation root catalog requires Security administration")
    end
    local requested = type(args) == "table" and args.offset or 0
    if type(requested) ~= "number" or requested < 0 or requested % 1 ~= 0 then
        return nil, failure(errors.INVALID, "offset must be a non-negative integer")
    end
    local offset = math.floor(requested)
    local rows, query_err = component.query({access_mask = component.ACCESS.ADMIN,
        include = {meta = true}, limit = ROOT_PAGE + 1, offset = offset})
    if query_err then return nil, query_err end
    local items = table.create(math.min(#rows, ROOT_PAGE), 0)
    for index = 1, math.min(#rows, ROOT_PAGE) do items[#items + 1] = root_item(rows[index]) end
    return {success = true, items = items, next_offset = #rows > ROOT_PAGE and offset + ROOT_PAGE or nil}, nil
end
return M
