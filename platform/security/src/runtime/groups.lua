-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Runtime composition uses IDs, never policy bodies or a copy of another owner's descriptor.
local registry = require("registry")
local store = require("scope_store")
local consts = require("security_consts")
local key = require("scope_key")
local composition = require("policy_composition")
local M = {}
local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, retryable = false, message = message})
end
local function list_error(values: any, field: string): error?
    if type(values) ~= "table" then return invalid(field .. " must be an array") end
    local count = 0
    for i, value in pairs(values) do
        if type(i) ~= "number" or i < 1 or math.floor(i) ~= i or type(value) ~= "string" or value == "" then
            return invalid(field .. " must contain non-empty ids in a dense array")
        end
        count = count + 1
    end
    if count ~= #values then return invalid(field .. " must be a dense array") end
    return nil
end
function M.resolve(groups: any): (any?, error?)
    local input_err = list_error(groups, "groups")
    if input_err then return nil, input_err end
    local snap, snapshot_err = registry.snapshot()
    if snapshot_err then return nil, snapshot_err end
    local declared, declaration_err = composition.group_compositions(snap)
    if declaration_err then return nil, declaration_err end
    local native_sources, native_err = composition.native_group_policies(snap)
    if native_err then return nil, native_err end
    local native, policies, authored, source_policies, slugs, visited, active = {}, {}, {}, {}, {}, {}, {}
    local function read(id)
        local entry, err = snap:get(id)
        if err and not errors.is(err, errors.NOT_FOUND) then return nil, err end
        return entry, nil
    end
    local function visit(group, depth)
        if active[group] or depth > 128 then return invalid("cyclic or excessively nested scope groups at " .. group) end
        if visited[group] then return nil end
        active[group] = true
        local id, key_err = key.id(group)
        if key_err then return key_err end
        local projected, projection_err = read(id)
        if projection_err then return projection_err end
        if projected and (projected.kind ~= "registry.entry" or (projected.meta or {}).type ~= key.META_TYPE
            or (projected.meta or {}).managed_by ~= consts.MANAGED_BY or (projected.meta or {}).target ~= group) then
            return invalid("invalid Security scope projection for " .. group)
        end
        local entry, read_err = read(group)
        if read_err then return read_err end
        local composed = declared.policies[group] ~= nil
        if composed then
            for _, policy in ipairs(declared.policies[group]) do policies[policy] = true end
            for policy in pairs(native_sources[group] or {}) do source_policies[policy] = true end
            for _, source in ipairs(declared.groups[group] or {}) do
                local err = visit(source, depth + 1)
                if err then return err end
            end
        end
        if entry and entry.kind == consts.SCOPE_KIND and (entry.meta or {}).managed_by ~= consts.MANAGED_BY then
            local data = entry.data or {}
            local policies_err = list_error(data.policies or {}, "authored scope policies")
            if policies_err then return policies_err end
            for _, policy in ipairs(data.policies or {}) do authored[policy] = true end
            if data.groups ~= nil then
                local groups_err = list_error(data.groups, "authored scope groups")
                if groups_err then return groups_err end
                for _, source in ipairs(data.groups) do
                    if type(source) ~= "string" or source == "" then return invalid("invalid authored scope group") end
                    local err = visit(source, depth + 1)
                    if err then return err end
                end
            elseif not composed and native_sources[group] then
                native[group] = true
            end
        elseif not projected and not composed then
            native[group] = true
        end
        if projected then
            local data = projected.data or {}
            if not composed then
                for _, source in ipairs(data.native_groups or {}) do native[source] = true end
                for _, source in ipairs(data.groups or {}) do
                    local err = visit(source, depth + 1)
                    if err then return err end
                end
            end
            for _, source in ipairs(data.scope_sources or {}) do
                slugs[source.slug] = slugs[source.slug] or {}
                slugs[source.slug][source.group_id] = true
            end
        end
        active[group], visited[group] = nil, true
        return nil
    end
    for _, group in ipairs(groups) do
        local err = visit(group, 1)
        if err then return nil, err end
    end
    local selected_slugs = {}
    for slug in pairs(slugs) do selected_slugs[#selected_slugs + 1] = slug end
    table.sort(selected_slugs)
    local rows, read_err = store.selections(selected_slugs)
    if read_err then return nil, read_err end
    for _, row in ipairs(rows) do
        local group = row.target ~= "" and row.target or consts.CUSTOM_SCOPE_NS .. ":" .. row.slug
        if row.enabled and slugs[row.slug][group] == true then
            for _, policy in ipairs(row.policies) do policies[policy] = true end
        end
    end
    local function ids(set)
        local out = {}
        for id in pairs(set) do out[#out + 1] = id end
        table.sort(out)
        return out
    end
    local function snapshot_get(id: string): (any?, any?) return snap:get(id) end
    local expanded, expand_err = composition.expand_available(ids(policies), snapshot_get)
    if expand_err then return nil, expand_err end
    local selected, selection_err = composition.expand(ids(authored), snapshot_get)
    if selection_err then return nil, selection_err end
    for _, id in ipairs(expanded) do authored[id] = true end
    for _, id in ipairs(selected) do authored[id] = true end
    for id in pairs(source_policies) do authored[id] = true end
    return {groups = ids(native), policy_ids = ids(authored)}, nil
end
return M
