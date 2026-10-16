-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Projects DB-backed custom scopes into security.scope registry entries.
-- Owned by the projection service (the single registry writer for the custom-scope
-- namespace). Reconcile is idempotent: it creates/updates entries for enabled DB
-- rows and removes registry entries whose DB row is gone or disabled. The runtime
-- then resolves each scope via security.named_scope(id).

local registry = require("registry")
local logger = require("logger"):named("kickside.security.scope_projection")
local consts = require("security_consts")
local store = require("scope_store")
local policy_groups = require("policy_groups")
local composition = require("policy_composition")

local funcs = require("funcs")

local group_sets = require("group_sets")

local M = {}

local function fence_delegations(groups, allow_only, previous_group_rules)
    if #groups == 0 then return true, nil end
    local config, config_err = registry.get("kickside.security:composition_config")
    if config_err then return nil, config_err end
    if not config then return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "composition config unavailable"}) :: error) end
    local id = config.meta.delegation_fencer
    if type(id) ~= "string" or id == "" then return nil, (errors.new({kind = errors.UNAVAILABLE,
        retryable = true, message = "host delegation fencer is unconfigured"}) :: error) end
    local result, err = funcs.call(id, {group_ids = groups, allow_only = allow_only == true,
        previous_group_rules = previous_group_rules, reason = "group policy composition changes"})
    if err then return nil, err end
    if not result or result.success ~= true then
        return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
            message = "group delegation fencing failed: " .. tostring(result and result.error)}) :: error)
    end
    return true, nil
end

local function entry_id(slug: string): string
    return consts.CUSTOM_SCOPE_NS .. ":" .. slug
end

-- The registry id a row projects to: the built-in scope id it overlays (target),
-- else a new id in the custom-scope namespace. An overlay id (e.g.
-- app.security:user) is UNIONED onto the default scope by the runtime.
local function scope_entry_id(row: any): string
    local t = tostring((row :: any).target or "")
    if t ~= "" then return t end
    return entry_id(tostring((row :: any).slug))
end

local function native_group_policies(snap)
    local native, read_err = snap:find({[".kind"] = consts.POLICY_KIND})
    if read_err then return nil, read_err end
    local effective = {}
    for _, policy in ipairs(native) do
        if (policy.meta or {}).scope_metadata ~= true and (policy.meta or {}).scope_projection_policy == nil then
            for _, group in ipairs((policy.data or {}).groups or {}) do
                effective[group] = effective[group] or {}
                effective[group][tostring(policy.id)] = true
            end
        end
    end
    return effective, nil
end

local function desired_entry(row: any, policies: any): any
    return {
        id = scope_entry_id(row),
        kind = consts.SCOPE_KIND,
        meta = {
            comment = "Managed by kickside.security scope projection.",
            label = row.label,
            internal = row.internal == true,
            managed_by = consts.MANAGED_BY,
            target = tostring((row :: any).target or ""),
        },
        data = { policies = policies },
    }
end

local function policies_equal(a: any, b: any): boolean
    if type(a) ~= "table" or type(b) ~= "table" then return false end
    if #a ~= #b then return false end
    for i = 1, #a do if a[i] ~= b[i] then return false end end
    return true
end

-- project makes the security.scope registry entries in CUSTOM_SCOPE_NS match the
-- enabled DB rows and group sets, planned against one registry snapshot: every
-- scope, composition and policy read comes from snap and the changes apply onto
-- it. Returns { created, updated, deleted } counts and the resulting version.
local function project(snap: any): (any, error?, any?)
    local function snapshot_get(id: string): (any?, any?)
        return snap:get(id)
    end
    local rows, rerr = store.list_enabled()
    if rerr then return nil, rerr end

    local existing, existing_err = snap:find({ [".kind"] = consts.SCOPE_KIND })
    if existing_err then return nil, existing_err end

    -- Index the scope entries this service owns (stamped with managed_by), so we
    -- never touch platform- or other-module-declared security.scope entries.
    local by_id: { [string]: any } = {}
    for _, entry in ipairs(existing or {}) do
        local m = (type((entry :: any).meta) == "table") and (entry :: any).meta or {}
        if m.managed_by == consts.MANAGED_BY then by_id[tostring((entry :: any).id)] = entry end
    end

    -- Diff DB rows against the pass snapshot's managed scope entries.
    local creates: { any } = {}
    local updates: { any } = {}
    local deletes: { string } = {}
    local desired_ids: { [string]: boolean } = {}
    local group_policies = {}
    local group_rows = {}
    local group_sources = {}

    local declarations, declarations_err = snap:find({
        [".kind"] = "registry.entry", ["meta.type"] = "kickside.security.group_composition",
    })
    if declarations_err then return nil, declarations_err end
    for _, declaration in ipairs(declarations or {}) do
        local data = declaration.data
        local targets, target_err = composition.group_ids(data, tostring(declaration.id))
        if target_err then return nil, target_err end
        local selected = {}
        for _, id in ipairs(data.policies or {}) do selected[#selected + 1] = id end
        if data.select ~= nil then
            if type(data.select) ~= "table" then
                return nil, (errors.new({kind = errors.INVALID, retryable = false, message = "group composition select must be a registry filter: " .. tostring(declaration.id)}) :: error)
            end
            local filter = {}
            for key, value in pairs(data.select) do filter[key] = value end
            filter[".kind"] = consts.POLICY_KIND
            local matches, matches_err = snap:find(filter)
            if matches_err then return nil, matches_err end
            for _, policy in ipairs(matches or {}) do selected[#selected + 1] = tostring(policy.id) end
        end
        local policies, policy_err = composition.expand_available(selected, snapshot_get)
        if policy_err then return nil, policy_err end
        for _, group in ipairs(targets) do
            group_sources[group] = data.groups or {}
            group_policies[group] = group_policies[group] or {}
            for _, id in ipairs(policies) do group_policies[group][#group_policies[group] + 1] = id end
        end
    end

    for _, row in ipairs(rows :: { any }) do
        local policies, policy_err = composition.expand_available((row :: any).policies, snapshot_get)
        if policy_err then return nil, policy_err end
        local id = scope_entry_id(row)
        group_rows[id] = row
        group_policies[id] = group_policies[id] or {}
        local already = {}
        for _, policy_id in ipairs(group_policies[id]) do already[policy_id] = true end
        for _, policy_id in ipairs(policies) do
            if not already[policy_id] then group_policies[id][#group_policies[id] + 1] = policy_id end
        end
    end
    local effective, effective_err = native_group_policies(snap)
    if not effective then return nil, effective_err end
    for group, policies in pairs(group_policies) do
        effective[group] = effective[group] or {}
        for _, id in ipairs(policies) do effective[group][id] = true end
    end
    local completed, visiting = {}, {}
    local function include_groups(group)
        if completed[group] then return nil end
        if visiting[group] then return (errors.new({kind = errors.INVALID, retryable = false, message = "group composition cycle at " .. group}) :: error) end
        visiting[group] = true
        effective[group] = effective[group] or {}
        for _, source in ipairs(group_sources[group] or {}) do
            local source_err = include_groups(source)
            if source_err then return source_err end
            for id in pairs(effective[source]) do effective[group][id] = true end
        end
        visiting[group] = nil
        completed[group] = true
        return nil
    end
    local sets, sets_err = group_sets.list()
    if sets_err then return nil, sets_err end
    local set_names = {}
    for _, set in ipairs(sets) do
        set_names[#set_names + 1] = set.scope_name
        group_sources[set.scope_name] = set.groups
        group_rows[set.scope_name] = {slug = set.scope_name:match(":(.+)$"), internal = true,
            label = "Group set", groups = set.groups}
    end
    for group in pairs(group_sources) do
        local source_err = include_groups(group)
        if source_err then return nil, source_err end
        local ids = {}
        for id in pairs(effective[group]) do ids[#ids + 1] = id end
        table.sort(ids)
        group_policies[group] = ids
    end
    for group, policies in pairs(group_policies) do
        local canonical, seen = {}, {}
        for _, id in ipairs(policies) do
            if not seen[id] then canonical[#canonical + 1] = id; seen[id] = true end
        end
        table.sort(canonical)
        group_policies[group] = canonical
    end
    for id, row in pairs(group_rows) do
        local policies = group_policies[id]
        desired_ids[id] = true
        local have = by_id[id]
        if not have then
            creates[#creates + 1] = desired_entry(row, policies)
        else
            local hd = have.data
            local hm = (type(have.meta) == "table") and have.meta or {}
            if not policies_equal(hd.policies, policies)
                or hm.internal ~= ((row :: any).internal == true)
                or hm.label ~= (row :: any).label then
                updates[#updates + 1] = desired_entry(row, policies)
            end
        end
    end

    -- Registry entries with no enabled DB row are removed.
    for id, _ in pairs(by_id) do
        if not desired_ids[id] then
            deletes[#deletes + 1] = id
        end
    end

    local created, updated, deleted = #creates, #updates, #deletes
    local bindings, bindings_err = policy_groups.plan(group_policies, effective, snap)
    if bindings_err then return nil, bindings_err end
    if created + updated + deleted + #bindings.creates + #bindings.updates + #bindings.deletes == 0 then
        local marked, mark_err = group_sets.mark_materialized(set_names, tostring(snap:version():id()))
        if not marked then return nil, mark_err end
        return { created = 0, updated = 0, deleted = 0 }, nil, snap:version()
    end

    local changes = snap:changes()
    for _, want in ipairs(creates) do changes:create(want) end
    for _, want in ipairs(updates) do changes:update(want) end
    for _, id in ipairs(deletes) do changes:delete(id) end
    for _, entry in ipairs(bindings.creates) do changes:create(entry) end
    for _, entry in ipairs(bindings.updates) do changes:update(entry) end
    for _, id in ipairs(bindings.deletes) do changes:delete(id) end

    local applied, aerr = changes:apply()
    if aerr then return nil, aerr end
    local fenced, fence_err = fence_delegations(bindings.reduced_groups, bindings.allow_only, bindings.previous_group_rules)
    if not fenced then return nil, fence_err end
    local marked, mark_err = group_sets.mark_materialized(set_names, tostring(applied:id()))
    if not marked then return nil, mark_err end
    logger:info("scopes reconciled", { created = created, updated = updated, deleted = deleted })
    return { created = created, updated = updated, deleted = deleted }, nil, applied
end

-- reconcile runs one projection pass against the current registry snapshot and
-- returns its statistics and the registry version it leaves. A registry commit
-- landing between the snapshot and the apply fails the pass with the registry
-- conflict; that commit's own event starts the next pass.
function M.reconcile(): (any, error?, any?)
    local snap, serr = registry.snapshot()
    if serr then return nil, serr end
    if not snap then return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "registry snapshot failed"}) :: error) end
    return project(snap)
end

-- fence(groups) closes the delegated authority of groups whose rules a caller
-- reduced with its own registry write.
function M.fence(groups)
    return fence_delegations(groups, false)
end

local function validate_groups(groups)
    local snap, snapshot_err = registry.snapshot()
    if snapshot_err then return nil, snapshot_err end
    if not snap then return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "group validation snapshot unavailable"}) :: error) end
    local known, known_err = native_group_policies(snap)
    if known_err then return nil, known_err end
    local declarations, declaration_err = snap:find({[".kind"] = "registry.entry",
        ["meta.type"] = "kickside.security.group_composition"})
    if declaration_err then return nil, declaration_err end
    for _, declaration in ipairs(declarations or {}) do
        local targets, target_err = composition.group_ids(declaration.data, tostring(declaration.id))
        if target_err then return nil, target_err end
        for _, id in ipairs(targets) do known[id] = known[id] or {} end
    end
    local rows, rows_err = store.list_enabled()
    if rows_err then return nil, rows_err end
    for _, row in ipairs(rows) do known[scope_entry_id(row)] = known[scope_entry_id(row)] or {} end
    for _, group in ipairs(groups) do
        if not known[group] then
            return nil, (errors.new({kind = errors.NOT_FOUND, retryable = false,
                message = "group unavailable " .. group, details = {code = "group_not_found", group_id = group}}) :: error)
        end
    end
    return snap, nil
end

-- group_set(groups) validates a principal's groups and returns the name of the
-- scope that unions them and whether a projection pass of the current registry
-- revision materialized it, so its bindings reflect every policy as it stands.
function M.group_set(groups)
    local name, sorted_or_err = group_sets.name_for(groups)
    if not name then return nil, sorted_or_err end
    local snap, valid_err = validate_groups(groups)
    if not snap then return nil, valid_err end
    local entry, entry_err = snap:get(name)
    if entry_err and not errors.is(entry_err, errors.NOT_FOUND) then return nil, entry_err end
    local meta = type(entry) == "table" and type(entry.meta) == "table" and entry.meta or {}
    local materialized, materialized_err = group_sets.current(name, tostring(snap:version():id()))
    if materialized_err then return nil, materialized_err end
    return {scope_name = name, current = materialized == true and entry ~= nil
        and entry.kind == consts.SCOPE_KIND and meta.managed_by == consts.MANAGED_BY}, nil
end

-- materialize(groups) returns the scope that unions a principal's groups,
-- projecting the registry first unless the set is current.
function M.materialize(groups)
    local set, set_err = M.group_set(groups)
    if not set then return nil, set_err end
    if set.current then return {created = 0, updated = 0, deleted = 0, scope_name = set.scope_name}, nil end
    local _, save_err = group_sets.save(groups)
    if save_err then return nil, save_err end
    local result, reconcile_err = M.reconcile()
    if reconcile_err then return nil, reconcile_err end
    result.scope_name = set.scope_name
    return result, nil
end

return M
