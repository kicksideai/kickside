local registry = require("registry")
local security = require("security")
local consts = require("security_consts")

local M = {}

local function failure(message: string, kind: string, code: string): error
    return (errors.new({message = message, kind = kind, retryable = false, details = {code = code}}) :: error)
end

local function walk(ids, read, authorize, retained, available)
    local out, seen, visiting = {}, {}, {}
    local function visit(id, root)
        if visiting[id] then return failure("policy composition cycle at " .. tostring(id), errors.INVALID, "policy_composition_cycle") end
        if seen[id] then return nil end
        local entry, err = read(id)
        if err then
            if available and root and errors.is(err, errors.NOT_FOUND) then return nil end
            return (errors.wrap(err, "policy unavailable " .. tostring(id)) :: error)
        end
        if not entry then
            if retained or (available and root) then return nil end
            return failure("policy unavailable " .. tostring(id) .. ": nil", errors.NOT_FOUND, "policy_not_found")
        end
        if tostring(entry.kind) ~= "security.policy" then return failure("not a security policy: " .. tostring(id), errors.INVALID, "policy_kind_invalid") end
        if not retained and type(entry.meta) == "table" and entry.meta.service_only == true then
            return failure("service-only policy cannot be composed into a member group: " .. tostring(id), errors.PERMISSION_DENIED, "policy_service_only")
        end
        if authorize then
            local authorization_err = authorize(entry)
            if authorization_err then return authorization_err end
        end
        visiting[id] = true
        seen[id] = true
        out[#out + 1] = id
        local includes = type(entry.meta) == "table" and entry.meta.includes or nil
        if includes ~= nil then
            if type(includes) ~= "table" then return failure("policy includes must be an array: " .. tostring(id), errors.INVALID, "policy_includes_invalid") end
            for _, included in ipairs(includes) do
                if type(included) ~= "string" or included == "" then
                    return failure("policy include must be a non-empty id: " .. tostring(id), errors.INVALID, "policy_include_invalid")
                end
                local include_err = visit(included, false)
                if include_err then return include_err end
            end
        end
        visiting[id] = nil
        return nil
    end
    for _, id in ipairs(ids or {}) do
        local err = visit(id, true)
        if err then return nil, err end
    end
    return out, nil
end

function M.group_ids(data: any, declaration_id: string): (any?, error?)
    if data.group_ids == nil then
        if type(data.group_id) ~= "string" or data.group_id == "" then
            return nil, failure("group composition requires group_id: " .. declaration_id,
                errors.INVALID, "group_composition_group_invalid")
        end
        return {data.group_id}, nil
    end
    if type(data.group_ids) ~= "table" then
        return nil, failure("group composition group_ids must be an array: " .. declaration_id,
            errors.INVALID, "group_composition_group_invalid")
    end
    local groups, seen = {}, {}
    local namespace = declaration_id:match("^([^:]+):")
    for _, group in ipairs(data.group_ids) do
        if type(group) ~= "string" then
            return nil, failure("group composition group must be a string: " .. declaration_id,
                errors.INVALID, "group_composition_group_invalid")
        end
        if group ~= "" then
            if not group:find(":", 1, true) then group = namespace .. ":" .. group end
            if not seen[group] then groups[#groups + 1] = group; seen[group] = true end
        end
    end
    return groups, nil
end

-- expand(ids, get?) resolves policy includes; get defaults to the live registry.
function M.expand(ids: any, get: ((string) -> (any?, any?))?): (any?, error?)
    return walk(ids, get or registry.get, nil, false)
end

-- expand_available resolves the currently installed top-level contributors of a
-- registry-owned group composition or a stored group selection. A policy that a
-- module or application update removed is absent from the next projection pass;
-- invalid present entries and missing transitive includes remain errors.
function M.expand_available(ids: any, get: ((string) -> (any?, any?))?): (any?, error?)
    return walk(ids, get or registry.get, nil, false, true)
end

function M.authorize_mutation(ids: any, gate: string, retained: boolean?): (any?, error?)
    local read = registry.get
    if retained then
        local snapshot, snapshot_err = registry.snapshot()
        if snapshot_err then return nil, (errors.wrap(snapshot_err, "prior scope authority snapshot failed") :: error) end
        if not snapshot then return nil, failure("prior scope authority snapshot unavailable", errors.UNAVAILABLE, "scope_snapshot_unavailable") end
        local entries, find_err = snapshot:find({[".kind"] = "security.policy"})
        if find_err then return nil, (errors.wrap(find_err, "prior scope policy read failed") :: error) end
        local by_id = {}
        for _, entry in ipairs(entries or {}) do by_id[tostring(entry.id)] = entry end
        read = function(id) return by_id[id], nil end
    end
    return walk(ids, read, function(entry)
        local meta = entry.meta or {}
        if meta.managed_by == "kickside.security" and meta.intent == "execution_delegation" then
            if not security.actor() or not security.can("access", gate) or not security.can("registry.apply", tostring(entry.id)) then
                return failure("managed delegation requires Security administration and policy-write authority",
                    errors.PERMISSION_DENIED, "delegation_policy_write_denied")
            end
        end
        return nil
    end, retained)
end

-- Plain rule policies are the only source kind whose bodies flow into
-- policy_groups and scope_projection. Security's delegation declarations are
-- source grants too, so only derived entries are excluded.
local function derived(policy: any): boolean
    local meta = policy.meta or {}
    return meta.managed_by == consts.MANAGED_BY
        and (meta.scope_metadata == true or meta.scope_projection_policy ~= nil)
end

function M.native_group_policies(snap)
    local effective = {}
    local native, read_err = snap:find({[".kind"] = consts.POLICY_KIND})
    if read_err then return nil, read_err end
    for _, policy in ipairs(native) do
        if not derived(policy) then
            local namespace = registry.parse_id(tostring(policy.id)).ns
            for _, group in ipairs((policy.data or {}).groups or {}) do
                local id = registry.parse_id(group)
                group = (id.ns ~= "" and id.ns or namespace) .. ":" .. id.name
                effective[group] = effective[group] or {}
                effective[group][tostring(policy.id)] = true
            end
        end
    end
    return effective, nil
end

-- native_runtime_policies(group) -> the source policy IDs of both native kinds
-- naming the group in the Runtime's own group index, or nil for a group no
-- policy names. Expression bodies never enter the rule-only projection paths.
function M.native_runtime_policies(group: string): (any?, error?)
    local scope, scope_err = security.named_scope(group)
    if scope_err then
        if errors.is(scope_err, errors.NOT_FOUND) then return nil, nil end
        return nil, scope_err
    end
    local effective
    for _, policy in ipairs(scope:policies()) do
        local id = policy:id()
        local entry, entry_err = registry.get(id)
        if entry_err and not errors.is(entry_err, errors.NOT_FOUND) then return nil, entry_err end
        if entry and not derived(entry) then
            effective = effective or {}
            effective[id] = true
        end
    end
    return effective, nil
end

-- composition_index(find) -> group -> the declarations composing it, unexpanded.
function M.composition_index(find: (any) -> (any?, any?)): (any?, error?)
    local index = {}
    local declarations, declarations_err = find({
        [".kind"] = "registry.entry", ["meta.type"] = "kickside.security.group_composition",
    })
    if declarations_err then return nil, declarations_err end
    for _, declaration in ipairs(declarations or {}) do
        local targets, target_err = M.group_ids(declaration.data, tostring(declaration.id))
        if target_err then return nil, target_err end
        for _, group in ipairs(targets) do
            index[group] = index[group] or {}
            index[group][#index[group] + 1] = declaration
        end
    end
    return index, nil
end

-- expand_composition(declarations, find, get?) -> the source groups and policies
-- one group's declarations compose; get defaults to the live registry.
function M.expand_composition(declarations: any, find: (any) -> (any?, any?), get: ((string) -> (any?, any?))?): (any?, any?, error?)
    local sources, included, policies = {}, {}, {}
    for _, declaration in ipairs(declarations) do
        local data = declaration.data
        local selected = {}
        for _, id in ipairs(data.policies or {}) do selected[#selected + 1] = id end
        if data.select ~= nil then
            if type(data.select) ~= "table" then
                return nil, nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group composition select must be a registry filter: " .. tostring(declaration.id)}) :: error)
            end
            local filter = {}
            for key, value in pairs(data.select) do filter[key] = value end
            filter[".kind"] = consts.POLICY_KIND
            local matches, matches_err = find(filter)
            if matches_err then return nil, nil, matches_err end
            for _, policy in ipairs(matches or {}) do selected[#selected + 1] = tostring(policy.id) end
        end
        local expanded, policy_err = M.expand_available(selected, get)
        if policy_err then return nil, nil, policy_err end
        for _, id in ipairs(expanded) do policies[#policies + 1] = id end
        for _, source in ipairs(data.groups or {}) do
            if not included[source] then
                sources[#sources + 1] = source
                included[source] = true
            end
        end
    end
    return sources, policies, nil
end

function M.group_compositions(snap)
    local function find(filter: any): (any?, any?) return snap:find(filter) end
    local function get(id: string): (any?, any?) return snap:get(id) end
    local index, index_err = M.composition_index(find)
    if index_err then return nil, index_err end
    local sources, policies_by_group = {}, {}
    for group, declarations in pairs(index) do
        local groups, policies, expand_err = M.expand_composition(declarations, find, get)
        if expand_err then return nil, expand_err end
        sources[group], policies_by_group[group] = groups, policies
    end
    return {groups = sources, policies = policies_by_group}, nil
end

return M
