-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Projects DB-backed custom scopes into security.scope registry entries.
-- Owned by the projection service (the single registry writer for the custom-scope
-- namespace). Reconcile is idempotent: it creates/updates entries for enabled DB
-- rows and removes registry entries whose DB row is gone or disabled. The
-- catalog retains the source policy IDs; sessions compose native scopes directly.

local registry = require("registry")
local logger = require("logger"):named("kickside.security.scope_projection")
local consts = require("security_consts")
local store = require("scope_store")
local funcs = require("funcs")
local composition = require("policy_composition")
local key = require("scope_key")
local group_resolver = require("group_resolver")

local M = {}

local function entry_id(slug: string): string
    return consts.CUSTOM_SCOPE_NS .. ":" .. slug
end

-- The registry id a row projects to: the built-in scope id it overlays (target),
-- else a new id in the custom-scope namespace. An overlay id (e.g.
-- app.security:user) contributes its DB selection alongside the native group.
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
        for _, group in ipairs((policy.data or {}).groups or {}) do
            effective[group] = effective[group] or {}
            effective[group][tostring(policy.id)] = true
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

local function equal(left, right)
    if type(left) ~= type(right) then return false end
    if type(left) ~= "table" then return left == right end
    for key, value in pairs(left) do if not equal(value, right[key]) then return false end end
    for key in pairs(right) do if left[key] == nil then return false end end
    return true
end

-- project makes the security.scope registry entries in CUSTOM_SCOPE_NS match the
-- enabled DB rows and declarations, planned against one registry snapshot: every
-- scope, composition and policy read comes from snap and the changes apply onto
-- it. Returns { created, updated, deleted } counts and the resulting version.
local function project(snap: any, fence_groups: any?): (any, error?, any?)
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
    local owned = {}
    for _, entry in ipairs(existing or {}) do
        local m = (type((entry :: any).meta) == "table") and (entry :: any).meta or {}
        by_id[tostring(entry.id)] = entry
        if m.managed_by == consts.MANAGED_BY then owned[tostring(entry.id)] = true end
    end

    -- Diff DB rows against the pass snapshot's managed scope entries.
    local creates: { any } = {}
    local updates: { any } = {}
    local deletes: { string } = {}
    local desired_ids: { [string]: boolean } = {}
    local group_policies = {}
    local group_rows = {}
    local group_sources = {}
    local direct_policies = {}
    local scope_sources = {}

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

    for group, policies in pairs(group_policies) do
        direct_policies[group] = {}
        for _, id in ipairs(policies) do direct_policies[group][#direct_policies[group] + 1] = id end
    end

    for _, row in ipairs(rows :: { any }) do
        local policies, policy_err = composition.expand_available((row :: any).policies, snapshot_get)
        if policy_err then return nil, policy_err end
        local id = scope_entry_id(row)
        group_rows[id] = row
        scope_sources[id] = scope_sources[id] or {}
        scope_sources[id][row.slug] = id
        group_policies[id] = group_policies[id] or {}
        local already = {}
        for _, policy_id in ipairs(group_policies[id]) do already[policy_id] = true end
        for _, policy_id in ipairs(policies) do
            if not already[policy_id] then group_policies[id][#group_policies[id] + 1] = policy_id end
        end
    end
    local native, native_err = native_group_policies(snap)
    if not native then return nil, native_err end
    local effective, native_sets, direct_sets, slug_sets = {}, {}, {}, {}
    local affected = {}
    for _, group in ipairs(fence_groups or {}) do affected[group] = true end
    local completed, visiting = {}, {}
    local function include_groups(group)
        if completed[group] then return nil end
        if visiting[group] then return (errors.new({kind = errors.INVALID, retryable = false,
            message = "group composition cycle at " .. group}) :: error) end
        visiting[group] = true
        effective[group], native_sets[group], direct_sets[group], slug_sets[group] = {}, {}, {}, {}
        if native[group] then
            native_sets[group][group] = true
            for id in pairs(native[group]) do effective[group][id] = true end
        end
        for _, id in ipairs(group_policies[group] or {}) do effective[group][id] = true end
        for _, id in ipairs(direct_policies[group] or {}) do direct_sets[group][id] = true end
        for slug, source in pairs(scope_sources[group] or {}) do slug_sets[group][slug] = source end
        for _, source in ipairs(group_sources[group] or {}) do
            local source_err = include_groups(source)
            if source_err then return source_err end
            if affected[source] then affected[group] = true end
            for _, sets in ipairs({effective, native_sets, direct_sets, slug_sets}) do
                for id, value in pairs(sets[source]) do sets[group][id] = value end
            end
        end
        visiting[group], completed[group] = nil, true
        return nil
    end
    local function ids(selected)
        local out = {}
        for id in pairs(selected) do out[#out + 1] = id end
        table.sort(out)
        return out
    end
    for group in pairs(group_sources) do group_policies[group] = group_policies[group] or {} end
    local function ordered(values)
        local set = {}
        for _, value in ipairs(values or {}) do set[value] = true end
        return ids(set)
    end
    -- Runtime routes retain only each target's own source IDs. The resolver
    -- follows group references live; authored descriptors are never snapshotted.
    local routes = {}
    for group in pairs(group_policies) do
        local sources = {}
        for slug, target in pairs(scope_sources[group] or {}) do
            sources[#sources + 1] = {slug = slug, group_id = target}
        end
        table.sort(sources, function(left, right) return left.slug < right.slug end)
        routes[group] = {native_groups = native[group] and {group} or {},
            groups = ordered(group_sources[group]), scope_sources = sources,
            direct_policies = ordered(direct_policies[group])}
    end
    local native_groups_by_id = {}
    for group in pairs(group_policies) do
        local source_err = include_groups(group)
        if source_err then return nil, source_err end
        group_policies[group] = ids(effective[group])
        native_groups_by_id[group] = ids(native_sets[group])
        scope_sources[group] = {}
        for slug, source in pairs(slug_sets[group]) do
            scope_sources[group][#scope_sources[group] + 1] = {slug = slug, group_id = source}
        end
        table.sort(scope_sources[group], function(left, right) return left.slug < right.slug end)
        -- Keep native group policies in their groups; only other declaration
        -- selections travel as individual IDs during live validation.
        for native_group in pairs(native_sets[group]) do
            for id in pairs(native[native_group]) do direct_sets[group][id] = nil end
        end
        direct_policies[group] = ids(direct_sets[group])
    end
    for id in pairs(group_policies) do
        group_rows[id] = group_rows[id] or {label = id, internal = false}
    end
    local projected, projected_err = snap:find({[".kind"] = "registry.entry", ["meta.type"] = key.META_TYPE})
    if projected_err then return nil, projected_err end
    local owned_projections = {}
    for _, entry in ipairs(projected or {}) do
        if (entry.meta or {}).managed_by == consts.MANAGED_BY then owned_projections[tostring(entry.id)] = entry end
    end
    for id, row in pairs(group_rows) do
        local route_id, route_err = key.id(id)
        if route_err then return nil, route_err end
        desired_ids[route_id] = true
        local data = routes[id]
        data.has_scope_sources = next(slug_sets[id] or {}) ~= nil
        -- Catalog-only projection. Runtime resolves local routes and live DB
        -- rows instead of authorizing from this derived policy list.
        data.policies = group_policies[id]
        local want = {id = route_id, kind = "registry.entry",
            meta = {type = key.META_TYPE, managed_by = consts.MANAGED_BY, target = id}, data = data}
        local have, read_err = snap:get(route_id)
        if read_err and not errors.is(read_err, errors.NOT_FOUND) then return nil, read_err end
        if have and not owned_projections[route_id] then
            return nil, errors.new({kind = errors.INVALID, message = "scope projection id is owned by another declaration: " .. route_id})
        end
        if not have then creates[#creates + 1] = want
        elseif not equal(have.meta, want.meta) or not equal(have.data, want.data) then updates[#updates + 1] = want end

        -- Custom scope descriptors are Security-owned. Overlays and group
        -- compositions never update or replace another owner's scope entry.
        if row.slug and tostring(row.target or "") == "" then
            desired_ids[id] = true
            have = by_id[id]
            if have and not owned[id] then
                return nil, errors.new({kind = errors.INVALID, message = "custom scope id is owned by another declaration: " .. id})
            end
            want = desired_entry(row, group_policies[id])
            if not have then creates[#creates + 1] = want
            elseif not equal(have.meta, want.meta) or not equal(have.data, want.data) then updates[#updates + 1] = want end
        end
    end
    for id in pairs(owned) do if not desired_ids[id] then deletes[#deletes + 1] = id end end
    for id in pairs(owned_projections) do if not desired_ids[id] then deletes[#deletes + 1] = id end end

    local fences = {}
    for group in pairs(affected) do fences[#fences + 1] = group end
    table.sort(fences)

    local created, updated, deleted = #creates, #updates, #deletes
    local applied = snap:version()
    if created + updated + deleted > 0 then
        local changes = snap:changes()
        for _, want in ipairs(creates) do changes:create(want) end
        for _, want in ipairs(updates) do changes:update(want) end
        for _, id in ipairs(deletes) do changes:delete(id) end
        local result, apply_err = changes:apply()
        if apply_err then return nil, apply_err end
        applied = result
        logger:info("scopes reconciled", { created = created, updated = updated, deleted = deleted })
    end
    local fenced, fence_err = M.fence(fences)
    if not fenced then return nil, fence_err, applied end
    return { created = created, updated = updated, deleted = deleted }, nil, applied
end

-- reconcile runs one projection pass against the current registry snapshot and
-- returns its statistics and the registry version it leaves. A registry commit
-- landing between the snapshot and the apply fails the pass with the registry
-- conflict; that commit's own event starts the next pass.
function M.reconcile(fence_groups: any?): (any, error?, any?)
    local snap, serr = registry.snapshot()
    if serr then return nil, serr end
    if not snap then return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
        message = "registry snapshot failed"}) :: error) end
    return project(snap, fence_groups)
end

-- fence(groups) closes the delegated authority of groups whose rules a caller
-- reduced with its own registry write.
function M.fence(groups)
    if #groups == 0 then return true, nil end
    local config, config_err = registry.get("kickside.security:composition_config")
    if config_err then return nil, config_err end
    local id = config and config.meta and config.meta.delegation_fencer
    if type(id) ~= "string" or id == "" then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "host delegation fencer is unconfigured"})
    end
    local result, err = funcs.call(id, {group_ids = groups, allow_only = false,
        reason = "scope authority changes"})
    if err then return nil, err end
    if not result or result.success ~= true then
        return nil, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "group delegation fencing failed: " .. tostring(result and result.error)})
    end
    return true, nil
end

function M.group_set(groups)
    if type(groups) ~= "table" or #groups == 0 then
        return nil, errors.new({kind = errors.INVALID, retryable = false, message = "group set requires groups"})
    end
    for _, group in ipairs(groups) do
        if type(group) ~= "string" or group == "" then
            return nil, errors.new({kind = errors.INVALID, retryable = false, message = "group must be a non-empty id"})
        end
    end
    local resolved, err = group_resolver.resolve(groups)
    if not resolved then return nil, err end
    return {scope_name = groups[#groups], current = true}, nil
end

return M
