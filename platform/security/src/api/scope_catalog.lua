-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The read model for the scopes admin. Merges the three authorization
-- surfaces into one catalog:
--   * policies  — every security.policy (the grants a scope can include)
--   * scopes    — built-in implicit groups (app.security:*), registry-shipped
--                 security.scope entries, and DB-backed custom scopes
-- Internal/system scopes (ingress + meta.internal) are classified so the UI can
-- hide them. DB custom scopes are the source of truth for their own rows; their
-- projected security.scope registry entries are owned by the projection service.

local registry = require("registry")
local consts = require("security_consts")
local store = require("scope_store")
local stypes = require("security_types")
local scope_key = require("scope_key")

local M = {}

local function meta_of(entry: any): { [string]: any }
    return (type(entry) == "table" and type(entry.meta) == "table") and (entry.meta :: { [string]: any }) or {}
end

-- All security.policy entries, normalized to PolicySummary. A policy is private
-- (meta.private = true) when it is an internal/system grant that must not be
-- offered when composing a scope; only public policies are selectable.
local function policy_index(): (any?, error?)
    local entries, read_err = registry.find({ [".kind"] = consts.POLICY_KIND })
    if read_err then return nil, read_err end
    local by_id: { [string]: stypes.PolicySummary } = {}
    local list: { stypes.PolicySummary } = {}
    local group_policies = {}
    for _, entry in ipairs(entries :: { any }) do
        local data = entry.data
        local meta = meta_of(entry)
        local policy = (type(data.policy) == "table") and data.policy or {}
        local summary: stypes.PolicySummary = {
            id = tostring(entry.id),
            title = (meta.title and tostring(meta.title)) or tostring(entry.id),
            surface = meta.surface and tostring(meta.surface) or nil,
            intent = meta.intent and tostring(meta.intent) or nil,
            comment = meta.comment and tostring(meta.comment) or nil,
            effect = policy.effect and tostring(policy.effect) or nil,
            actions = policy.actions,
            resources = policy.resources,
            private = meta.private == true,
        }
        for _, group in ipairs(data.groups or {}) do
            group_policies[group] = group_policies[group] or {}
            group_policies[group][#group_policies[group] + 1] = tostring(entry.id)
        end
        by_id[tostring(entry.id)] = summary
        list[#list + 1] = summary
    end
    table.sort(list, function(a, b) return tostring(a.id) < tostring(b.id) end)
    return {by_id = by_id, list = list, entries = entries, groups = group_policies}, nil
end

-- policies returns the policy catalog (the grants). include_internal defaults false.
function M.policies(opts: any?): ({ stypes.PolicySummary }?, error?)
    opts = opts or {}
    local index, read_err = policy_index()
    if read_err then return nil, read_err end
    local list = index.list
    if opts.include_private == true then return list, nil end
    local out: { stypes.PolicySummary } = {}
    for _, p in ipairs(list) do
        if not p.private then out[#out + 1] = p end
    end
    return out
end

local function role_descriptors(): (any?, error?)
    local entries, read_err = registry.find({ [".kind"] = "registry.entry", ["meta.type"] = consts.ROLE_META_TYPE })
    if read_err then return nil, read_err end
    local by_id: { [string]: any } = {}
    for _, entry in ipairs(entries :: { any }) do
        local data = entry.data
        local meta = meta_of(entry)
        if type(data.role_id) == "string" then
            by_id[data.role_id] = {
                label = meta.title,
                description = meta.comment,
                protected = data.protected == true,
                internal = meta.internal == true,
            }
        end
    end
    return by_id
end

-- resolve_policies summarizes a scope's policies. A stored selection (stored)
-- lists only the policies still installed, the rule its projection applies; a
-- registry-declared scope names policies that must exist.
local function resolve_policies(ids: any, by_id: { [string]: stypes.PolicySummary }, stored: boolean): ({ stypes.PolicySummary }?, error?)
    local out: { stypes.PolicySummary } = {}
    if type(ids) ~= "table" then return out end
    for _, pid in ipairs(ids) do
        local s = by_id[tostring(pid)]
        if s then
            out[#out + 1] = s
        elseif not stored then
            return nil, (errors.new({kind = errors.NOT_FOUND, retryable = false,
                message = "policy unavailable: " .. tostring(pid)}) :: error)
        end
    end
    return out
end

local function default_label(id: string): string
    return id:match("([^:%.]+)$") or id
end

local function descriptor_policies(entry, index, projection)
    local data, selected, out = entry.data or {}, {}, {}
    local function include(ids)
        for _, id in ipairs(ids or {}) do
            if not selected[id] then selected[id] = true; out[#out + 1] = id end
        end
    end
    include(data.policies)
    include(data.direct_policies)
    if projection then include((projection.data or {}).policies) end
    for _, group in ipairs(data.groups or {}) do include(index.groups[group]) end
    table.sort(out)
    return out
end

-- scopes returns the merged scope/role catalog. include_internal defaults false.
function M.scopes(opts: any?): ({ stypes.CatalogScope }?, error?)
    opts = opts or {}
    local include_internal = opts.include_internal == true
    local index, policies_err = policy_index()
    if policies_err then return nil, policies_err end
    local projections, projection_err = registry.find({[".kind"] = "registry.entry", ["meta.type"] = scope_key.META_TYPE})
    if projection_err then return nil, projection_err end
    local by_target = {}
    for _, entry in ipairs(projections or {}) do
        local meta = entry.meta or {}
        if entry.kind == "registry.entry" and meta.type == scope_key.META_TYPE
            and meta.managed_by == consts.MANAGED_BY and type(meta.target) == "string" then
            by_target[meta.target] = entry
        end
    end
    local descriptors, roles_err = role_descriptors()
    if roles_err then return nil, roles_err end
    local by_id = index.by_id
    local out: { stypes.CatalogScope } = {}
    local seen: { [string]: boolean } = {}

    local overlays_by_target: { [string]: any } = {}
    local function emit(scope: any): (boolean?, error?)
        if scope.internal and not include_internal then return true, nil end
        if seen[scope.id] then return true, nil end
        local policies, policy_err = resolve_policies(scope.policies, by_id, scope.source == consts.SOURCE.CUSTOM)
        if policy_err then return nil, policy_err end
        scope.policies = policies
        local overlay = overlays_by_target[scope.id]
        if overlay then
            local overlay_policies, overlay_err = resolve_policies(overlay.policies, by_id, true)
            if overlay_err then return nil, overlay_err end
            scope.overlay_policies = overlay_policies
            scope.overlay_slug = overlay.slug
        end
        seen[scope.id] = true
        out[#out + 1] = scope
        return true, nil
    end

    local rows, rows_err = store.list()
    if rows_err then return nil, rows_err end
    for _, row in ipairs(rows :: { stypes.ScopeRow }) do
        local r = row :: stypes.ScopeRow
        if r.target ~= "" then
            overlays_by_target[r.target] = r
        else
            local _, emit_err = emit({
                id = consts.CUSTOM_SCOPE_NS .. ":" .. r.slug,
                slug = r.slug,
                label = (r.label ~= "" and r.label) or default_label(r.slug),
                description = r.description,
                source = consts.SOURCE.CUSTOM,
                internal = r.internal == true,
                built_in = false,
                enabled = r.enabled,
                policies = r.policies,
            })
            if emit_err then return nil, emit_err end
        end
    end

    -- 2. Host-declared roles referenced by policies. Role descriptors are the
    -- ownership boundary; package code never assumes the host's namespace.
    local group_policies: { [string]: { string } } = {}
    local declared_scopes, declared_err = registry.find({[".kind"] = consts.SCOPE_KIND})
    if declared_err then return nil, declared_err end
    for _, entry in ipairs(declared_scopes or {}) do
        local id = tostring(entry.id)
        if descriptors[id] then group_policies[id] = descriptor_policies(entry, index, by_target[tostring(entry.id)]) end
    end
    for id, projection in pairs(by_target) do
        if descriptors[id] and not group_policies[id] then group_policies[id] = projection.data.policies or {} end
    end
    local group_internal: { [string]: boolean } = {}
    local group_order: { string } = {}
    for group in pairs(group_policies) do group_order[#group_order + 1] = group end
    local policy_entries = index.entries
    for _, entry in ipairs(policy_entries :: { any }) do
        local groups = entry.data.groups
        local entry_internal = meta_of(entry).internal == true
        if type(groups) == "table" then
            for _, g in ipairs(groups) do
                if type(g) == "string" and descriptors[g] then
                    if not group_policies[g] then group_policies[g] = {}; group_order[#group_order + 1] = g end
                    -- A group is internal when any policy carrying it is marked
                    -- meta.internal in the registry (the canonical signal).
                    if entry_internal then group_internal[g] = true end
                    local exists = false
                    for _, id in ipairs(group_policies[g]) do if id == tostring(entry.id) then exists = true; break end end
                    if not exists then group_policies[g][#group_policies[g] + 1] = tostring(entry.id) end
                end
            end
        end
    end
    table.sort(group_order)
    for _, g in ipairs(group_order) do
        local desc = descriptors[g] or {}
        local _, emit_err = emit({
            id = g,
            label = desc.label or default_label(g),
            description = desc.description or "",
            source = consts.SOURCE.BUILTIN,
            internal = desc.internal == true or group_internal[g] == true,
            built_in = desc.protected == true,
            enabled = true,
            policies = group_policies[g] or {},
        })
        if emit_err then return nil, emit_err end
    end

    -- 3. Registry-shipped security.scope entries. Skip the ones THIS service
    -- projects (managed_by) — those are represented as custom scopes or as
    -- overlays on their base scope, not as separate registry scopes.
    local scope_entries, scopes_err = registry.find({ [".kind"] = consts.SCOPE_KIND })
    if scopes_err then return nil, scopes_err end
    for _, entry in ipairs(scope_entries :: { any }) do
        local id = tostring(entry.id)
        local meta = meta_of(entry)
        if meta.managed_by ~= consts.MANAGED_BY then
            local _, emit_err = emit({
                id = id,
                label = meta.title or id,
                description = meta.comment or "",
                source = consts.SOURCE.REGISTRY,
                internal = meta.internal == true,
                built_in = false,
                enabled = true,
                policies = descriptor_policies(entry, index, by_target[tostring(entry.id)]),
            })
            if emit_err then return nil, emit_err end
        end
    end

    return out
end

return M
