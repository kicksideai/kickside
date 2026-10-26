local canonical_json = require("canonical_json")
local registry = require("registry")
local M = {}

local function copy(value)
    local out = {}
    for key, item in pairs(value or {}) do out[key] = item end
    return out
end
local function values(value)
    return type(value) == "table" and value or {value}
end
function M.normalize(policy)
    local out = copy(policy)
    for _, field in ipairs({"actions", "resources"}) do
        local sorted, seen = {}, {}
        for _, value in ipairs(values(policy[field])) do
            if not seen[value] then sorted[#sorted + 1] = value; seen[value] = true end
        end
        table.sort(sorted)
        out[field] = #sorted == 1 and sorted[1] or sorted
    end
    return out
end
function M.fingerprint(policy)
    local digest, err = canonical_json.hash(M.normalize(policy))
    if err then return nil, errors.wrap(err, "policy fingerprint failed") end
    return {digest = digest, effect = policy.effect}, nil
end
function M.remember(policy, profiles)
    local normalized = M.normalize(policy)
    local fingerprint, err = M.fingerprint(normalized)
    if err then return nil, err end
    if profiles[fingerprint.digest] then return fingerprint, nil end
    local constraints = copy(normalized)
    constraints.actions, constraints.resources = nil, nil
    local retained, excluded = {}, {}
    for _, condition in ipairs(constraints.conditions or {}) do
        if condition.field == "action" and condition.operator == "nin" and condition.value_from == nil then
            for _, action in ipairs(values(condition.value)) do excluded[action] = true end
        else retained[#retained + 1] = condition end
    end
    constraints.conditions = #retained > 0 and retained or nil
    local unrestricted = true
    for key in pairs(constraints) do if key ~= "effect" then unrestricted = false end end
    local digest, digest_err = canonical_json.hash(constraints)
    if digest_err then return nil, errors.wrap(digest_err, "policy constraints fingerprint failed") end
    profiles[fingerprint.digest] = {constraints = digest, unrestricted = unrestricted,
        actions = values(normalized.actions), resources = values(normalized.resources), excluded = excluded}
    return fingerprint, nil
end

local function action_matches(pattern, action)
    if pattern == "*" or pattern == action then return true end
    if #pattern > 2 and pattern:sub(-2) == ".*" then return action:sub(1, #pattern - 2) == pattern:sub(1, -3) end
    if #pattern > 1 and pattern:sub(-1) == "*" then return action:sub(1, #pattern - 1) == pattern:sub(1, -2) end
    if pattern:find("*", 1, true) then return true end
    return false
end
local function pattern_covers(candidate, value)
    if candidate == "*" or candidate == value then return true end
    if candidate:sub(-1) ~= "*" then return false end
    local prefix = candidate:sub(1, -2)
    return value:sub(1, #prefix) == prefix
end
local function permits(profile, action, previous)
    for excluded in pairs(profile.excluded or {}) do
        if not (previous.excluded or {})[excluded] and action_matches(action, excluded) then return false end
    end
    return true
end
local function patterned(values_list)
    for _, value in ipairs(values_list) do
        if value:sub(-1) == "*" then return true end
    end
    return false
end
local function each_pair(profile, visit)
    for _, action in ipairs(profile.actions) do
        for _, resource in ipairs(profile.resources) do visit(action .. "\0" .. resource) end
    end
end

-- grant indexes an allow fingerprint under the exact action/resource pairs it
-- grants; a fingerprint with a pattern action or resource is checked against
-- every pair.
function M.grant(grants, id, fingerprint, profiles)
    local profile = profiles[fingerprint.digest]
    if fingerprint.effect ~= "allow" or not profile then return end
    if patterned(profile.actions) or patterned(profile.resources) then
        grants.patterned[id] = fingerprint
        return
    end
    each_pair(profile, function(pair)
        grants.exact[pair] = grants.exact[pair] or {}
        grants.exact[pair][id] = fingerprint
    end)
end
function M.revoke(grants, id, fingerprint, profiles)
    local profile = profiles[fingerprint.digest]
    grants.patterned[id] = nil
    if not profile then return end
    each_pair(profile, function(pair)
        if grants.exact[pair] then grants.exact[pair][id] = nil end
    end)
end
function M.grants(policies, profiles)
    local grants = {exact = {}, patterned = {}}
    for id, fingerprint in pairs(policies or {}) do M.grant(grants, id, fingerprint, profiles) end
    return grants
end

local function grants_pair(policy, profiles, previous, action, resource)
    local candidate = profiles[policy.digest]
    if not (candidate.unrestricted or candidate.constraints == previous.constraints)
        or not permits(candidate, action, previous) then return false end
    for _, granted_action in ipairs(candidate.actions) do
        if pattern_covers(granted_action, action) then
            for _, granted_resource in ipairs(candidate.resources) do
                if pattern_covers(granted_resource, resource) then return true end
            end
        end
    end
    return false
end
function M.covers(fingerprint, grants, profiles)
    local previous = profiles and profiles[fingerprint.digest]
    if fingerprint.effect ~= "allow" or not previous then return false end
    for _, action in ipairs(previous.actions) do
        for _, resource in ipairs(previous.resources) do
            local covered = false
            for _, policy in pairs(grants.exact[action .. "\0" .. resource] or {}) do
                if grants_pair(policy, profiles, previous, action, resource) then covered = true; break end
            end
            if not covered then
                for _, policy in pairs(grants.patterned) do
                    if grants_pair(policy, profiles, previous, action, resource) then covered = true; break end
                end
            end
            if not covered then return false end
        end
    end
    return true
end

-- Coverage proves unchanged authority conservatively; native policy evaluation owns access.
function M.compare(old, new, profiles)
    local changed, reduced, allow_only = old == nil or new == nil, new == nil, new ~= nil
    local before, after = {}, {}
    for _, policy in pairs(old or {}) do before[policy.digest] = true end
    for _, policy in pairs(new or {}) do after[policy.digest] = true end
    -- Without profiles the comparison is byte-level and nothing covers a removed grant.
    local grants = M.grants(new, profiles or {})
    for id, policy in pairs(old or {}) do
        local replacement = (new or {})[id]
        if not replacement or replacement.digest ~= policy.digest then changed = true end
        if not after[policy.digest] and policy.effect ~= "deny" and not M.covers(policy, grants, profiles) then
            reduced = true
            if replacement and replacement.digest ~= policy.digest then allow_only = false end
        end
    end
    for id, policy in pairs(new or {}) do
        if not (old or {})[id] or (old or {})[id].digest ~= policy.digest then changed = true end
        if not before[policy.digest] and policy.effect ~= "allow" then reduced, allow_only = true, false end
    end
    return {changed = changed, reduced = reduced, allow_only = allow_only}
end

function M.compare_rules(before, after)
    local profiles, old, new = {}, {}, {}
    for _, item in ipairs({{rules = before, target = old}, {rules = after, target = new}}) do
        for _, rule in ipairs(item.rules) do
            local fingerprint, err = M.remember(rule, profiles)
            if err then return nil, err end
            item.target[fingerprint.digest] = fingerprint
        end
    end
    return M.compare(old, new, profiles), nil
end

-- Users supplies membership sets under its account transaction. A false prior
-- group body denotes unknown history and requires unrestricted current coverage.
function M.member_change(before_groups, after_groups, previous_group_rules)
    local entries, read_err = registry.find({[".kind"] = "security.policy"})
    if read_err then return nil, errors.wrap(read_err, "group policies unavailable") end
    local was_member, becomes_member, observed, before, after, missing = {}, {}, {}, {}, {}, false
    for _, group in ipairs(before_groups) do
        local previous = previous_group_rules and previous_group_rules[group]
        if previous == false then missing = true
        elseif type(previous) == "table" then
            for _, rule in ipairs(previous) do before[#before + 1] = rule end
        else was_member[group] = true end
    end
    for _, group in ipairs(after_groups) do becomes_member[group] = true end
    for _, entry in ipairs(entries) do
        local data = entry.data
        local was, becomes = false, false
        for _, group in ipairs(data.groups or {}) do
            was = was or was_member[group] == true
            observed[group] = true
            becomes = becomes or becomes_member[group] == true
        end
        if was or becomes then
            if type(data.policy) ~= "table" then return nil, errors.new({kind = errors.INVALID,
                retryable = false, message = "group policy unavailable: " .. tostring(entry.id)}) end
            if was and not becomes and data.policy.effect ~= "allow" then
                return {changed = true, reduced = true, allow_only = false}, nil
            end
            if was then before[#before + 1] = data.policy end
            if becomes then after[#after + 1] = data.policy end
        end
    end
    for group in pairs(was_member) do
        if not observed[group] and not becomes_member[group] then missing = true end
    end
    if missing then
        before[#before + 1] = {effect = "allow", actions = "*", resources = "*"}
        -- Unknown earlier rules cannot prove that a current deny is unchanged.
        for _, rule in ipairs(after) do
            if rule.effect ~= "allow" then return {changed = true, reduced = true, allow_only = false}, nil end
        end
    end
    return M.compare_rules(before, after)
end
return M
