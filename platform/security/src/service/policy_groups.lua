local consts = require("security_consts")
local canonical_json = require("canonical_json")
local coverage = require("policy_coverage")

local M = {}

local function projected_id(kind, id)
    return consts.CUSTOM_SCOPE_NS .. "." .. kind .. ":" .. id:gsub(".", function(c)
        return string.format("%02x", string.byte(c))
    end)
end

M.compare = coverage.compare
M.fingerprint = coverage.fingerprint

-- plan(scopes, effective, snap) plans native group bindings against the
-- projection pass's registry snapshot.
function M.plan(scopes: any, effective: any, snap: any): (any?, error?)
    local entries, read_err = snap:find({ [".kind"] = consts.POLICY_KIND })
    if read_err then return nil, read_err end
    local native, projected, previous = {}, {}, {}
    for _, entry in ipairs(entries or {}) do
        local meta = entry.meta or {}
        if meta.managed_by == consts.MANAGED_BY and
            (meta.scope_metadata == true or meta.scope_projection_policy ~= nil) then
            projected[tostring(entry.id)] = entry
        else
            native[tostring(entry.id)] = entry
        end
    end
    local profiles, rules_by_digest = {}, {}
    local function remember(policy)
        local fingerprint, err = coverage.remember(policy, profiles)
        if err then return nil, err end
        rules_by_digest[fingerprint.digest] = coverage.normalize(policy)
        return fingerprint, nil
    end
    for _, entry in pairs(projected) do
        if entry.meta.scope_projection_policy ~= nil then
            local _, err = remember(entry.data.policy)
            if err then return nil, err end
        end
    end
    local fingerprints = {}
    for id, entry in pairs(native) do
        local fingerprint, fingerprint_err = remember(entry.data.policy)
        if fingerprint_err then return nil, fingerprint_err end
        fingerprints[id] = fingerprint
        for _, group in ipairs(entry.data.groups or {}) do
            previous[group] = previous[group] or {}
            previous[group][id] = fingerprints[id]
        end
    end
    local desired, by_policy = {}, {}
    -- Durable execution frames retain binding ids after group assignments change.
    -- Keep those identities under their current source rules without old memberships.
    for _, binding in pairs(projected) do
        local source = binding.meta.scope_projection_policy
        if source ~= nil and native[source] then by_policy[source] = {} end
    end
    for group, policies in pairs(scopes) do
        local remaining, candidates = {}, {}
        for _, id in ipairs(policies) do
            if not native[id] then return nil, (errors.new({kind = errors.NOT_FOUND, retryable = false, message = "policy unavailable: " .. tostring(id)}) :: error) end
            by_policy[id] = by_policy[id] or {}
            if not remaining[id] then candidates[#candidates + 1] = id end
            remaining[id] = fingerprints[id]
        end
        table.sort(candidates, function(left, right)
            local a, b = profiles[fingerprints[left].digest], profiles[fingerprints[right].digest]
            local a_size, b_size = #a.actions * #a.resources, #b.actions * #b.resources
            if a_size ~= b_size then return a_size < b_size end
            return left < right
        end)
        local grants = coverage.grants(remaining, profiles)
        for _, id in ipairs(candidates) do
            local fingerprint = remaining[id]
            local redundant = false
            if fingerprint.effect == "allow" then
                coverage.revoke(grants, id, fingerprint, profiles)
                redundant = coverage.covers(fingerprint, grants, profiles)
                if not redundant then coverage.grant(grants, id, fingerprint, profiles) end
            end
            if not redundant then
                by_policy[id][group] = true
            end
        end
        local policy_set = canonical_json.object({})
        for id in pairs(effective[group] or {}) do
            if not fingerprints[id] then return nil, (errors.new({kind = errors.NOT_FOUND, retryable = false, message = "effective policy unavailable: " .. tostring(id)}) :: error) end
            policy_set[id] = fingerprints[id]
        end
        local id = projected_id("metadata", group)
        desired[id] = {
            id = id, kind = consts.POLICY_KIND,
            meta = {private = true, managed_by = consts.MANAGED_BY, scope_metadata = true,
                scope_projection_effective = policy_set},
            data = {groups = {group}, policy = {actions = "registry.get", resources = group, effect = "allow"}},
        }
    end
    for source, assigned in pairs(by_policy) do
        local groups: {string} = table.create(1, 0)
        for group in pairs(assigned) do groups[#groups + 1] = group end
        table.sort(groups)
        local id = projected_id("bindings", source)
        desired[id] = {
            id = id, kind = consts.POLICY_KIND,
            meta = {private = true, managed_by = consts.MANAGED_BY, scope_projection_policy = source},
            data = {groups = groups, policy = coverage.normalize(native[source].data.policy)},
        }
    end
    local plan = {creates = {}, updates = {}, deletes = {}, changed_groups = {}, reduced_groups = {}, allow_only = true, previous_group_rules = {}}
    local function mark_changed(group, old, new, has_previous_fingerprints)
        local change = M.compare(old, new, profiles)
        if not change.changed then return end
        plan.changed_groups[#plan.changed_groups + 1] = group
        if change.reduced then
            plan.reduced_groups[#plan.reduced_groups + 1] = group
            local rules, complete = {}, has_previous_fingerprints
            for _, fingerprint in pairs(old or {}) do
                local rule = rules_by_digest[fingerprint.digest]
                if rule then rules[#rules + 1] = rule else complete = false end
            end
            if complete then plan.previous_group_rules[group] = rules end
            if not change.allow_only then plan.allow_only = false end
        end
    end
    for id, want in pairs(desired) do
        local have = projected[id]
        if want.meta.scope_metadata then
            local old = have and (have.meta or {}).scope_projection_effective
            local has_previous_fingerprints = old ~= nil
            if have and not old then old = previous[want.data.groups[1]] or {} end
            mark_changed(want.data.groups[1], old, want.meta.scope_projection_effective, has_previous_fingerprints)
        end
        if not have then
            plan.creates[#plan.creates + 1] = want
        else
            local old_hash, old_err = canonical_json.hash({meta = have.meta, data = have.data})
            if old_err then return nil, old_err end
            local new_hash, new_err = canonical_json.hash({meta = want.meta, data = want.data})
            if new_err then return nil, new_err end
            if old_hash ~= new_hash then plan.updates[#plan.updates + 1] = want end
        end
    end
    for id, have in pairs(projected) do
        if not desired[id] then
            plan.deletes[#plan.deletes + 1] = id
            if have.meta.scope_metadata then
                local old = have.meta.scope_projection_effective
                mark_changed(have.data.groups[1], old, nil, old ~= nil)
            end
        end
    end
    table.sort(plan.changed_groups)
    table.sort(plan.reduced_groups)
    return plan, nil
end

return M
