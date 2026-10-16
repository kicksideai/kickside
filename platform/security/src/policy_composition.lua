local registry = require("registry")
local security = require("security")

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
-- registry-owned group composition. A removed module policy is absent from the
-- next projection pass; invalid present entries and missing transitive includes
-- remain errors.
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

return M
