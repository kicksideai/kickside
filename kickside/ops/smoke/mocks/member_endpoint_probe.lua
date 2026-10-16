local http = require("http")
local registry = require("registry")
local security = require("security")
local execution = require("execution_identity")

local function data(entry)
    return entry.data or entry
end
local function array(value)
    if type(value) == "string" then return {value} end
    return value or {}
end
local function endpoint_resources(identity)
    local resources, policies, seen = {}, {}, {}
    local function include(id)
        if seen[id] then return end
        seen[id] = true
        local entry = assert(registry.get(id), id)
        local policy = data(entry).policy or {}
        policies[#policies + 1] = assert(security.policy(id), id)
        for _, action in ipairs(array(policy.actions)) do
            if action == "access" and policy.effect == "allow" then
                for _, resource in ipairs(array(policy.resources)) do
                    local target = registry.get(resource)
                    if target and target.kind == "http.endpoint" then resources[resource] = true end
                end
            end
        end
        for _, child in ipairs((entry.meta or {}).includes or {}) do include(child) end
    end
    include(identity)
    return resources, policies
end
local function check_scope(identity, scope, listed, endpoints, actor)
    local allowed, refused = 0, 0
    for _, endpoint in ipairs(endpoints) do
        local id = tostring(endpoint.id)
        local admitted = scope:evaluate(actor, "access", id, nil) == "allow"
        assert(admitted == (listed[id] == true),
            identity .. (admitted and " unexpected endpoint " or " refused listed endpoint ") .. id)
        if admitted then allowed = allowed + 1 else refused = refused + 1 end
    end
    return {id = identity, allowed = allowed, refused = refused}
end
local function handler()
    local res = assert(http.response())
    res:set_content_type(http.CONTENT.JSON)
    res:write_json({actor = tostring(assert(security.actor()):id())})
end
local function inspect()
    local member = assert(execution.scope_from_groups({"app.security:user", "app.security:members"}))
    local baseline = assert(execution.scope_from_groups({"app.security:user"}))
    local admin = assert(security.named_scope("app.security:admin"))
    local stranger = security.new_scope({})
    local actor = security.new_actor("composed-member-probe", {})
    local entries, err = registry.find({})
    assert(not err, tostring(err))
    local endpoints, policy_matrix, listed = {}, {}, {}
    for _, entry in ipairs(entries) do
        if entry.kind == "http.endpoint" then endpoints[#endpoints + 1] = entry end
    end
    for _, entry in ipairs(entries) do
        if entry.kind == "security.policy" and (entry.meta or {}).intent == "module_access" then
            local id = tostring(entry.id)
            local resources, policies = endpoint_resources(id)
            local scope = assert(security.new_scope(policies))
            policy_matrix[#policy_matrix + 1] = check_scope(id, scope, resources, endpoints, actor)
        end
    end
    assert(#policy_matrix > 0, "no module access policies")
    for _, policy in ipairs(member:policies()) do
        local resources = endpoint_resources(tostring(policy:id()))
        for id in pairs(resources) do listed[id] = true end
    end
    for _, endpoint in ipairs(endpoints) do
        local id = tostring(endpoint.id)
        if baseline:evaluate(actor, "access", id, nil) == "allow" then listed[id] = true end
    end
    check_scope("composed member", member, listed, endpoints, actor)
    local fixture = "unrelated.member.acceptance:module_access"
    local resources, policies = endpoint_resources(fixture)
    policies[#policies + 1] = assert(security.policy("unrelated.member.acceptance:overgrant"))
    local accepted, diagnostic = pcall(check_scope, fixture, assert(security.new_scope(policies)), resources, endpoints, actor)
    assert(not accepted and tostring(diagnostic):find("unexpected endpoint unrelated.member.acceptance:unmarked.endpoint", 1, true),
        "constructed over-grant escapes exact endpoint matrix: " .. tostring(diagnostic))
    local routes, admin_routes, seen = {}, {}, {}
    for _, entry in ipairs(endpoints) do
        local id = tostring(entry.id)
        local router = entry.meta and entry.meta.router and registry.get(entry.meta.router)
        if router then
            local config, endpoint = data(router), data(entry)
            local firewall, authenticated = false, false
            for _, middleware in ipairs(config.post_middleware or {}) do
                if middleware == "endpoint_firewall" then firewall = true end
            end
            for _, middleware in ipairs(config.middleware or {}) do
                if middleware == "token_auth" then authenticated = true end
            end
            if entry.meta.router == "app:api" or entry.meta.router == "app:api.views" then
                assert(firewall and authenticated, "unprotected endpoint " .. id)
            end
            if authenticated and firewall then
                local fid = tostring(endpoint.func)
                if not fid:find(":", 1, true) then fid = id:match("^(.-):") .. ":" .. fid end
                assert(assert(registry.get(fid), id).kind == "function.lua", id)
                local path = tostring(config.prefix or ""):gsub("/$", "") .. "/" .. endpoint.path:gsub("^/", "")
                local key = endpoint.method .. " " .. path
                assert(not seen[key], "duplicate route " .. key)
                seen[key] = id
                local admitted = member:evaluate(actor, "access", id, nil) == "allow"
                assert(admin:evaluate(actor, "access", id, nil) == "allow", "admin " .. id)
                assert(stranger:evaluate(actor, "access", id, nil) == "undefined", "stranger " .. id)
                local route = {id = id, method = endpoint.method, path = path,
                    baseline = baseline:evaluate(actor, "access", id, nil) == "allow"}
                if admitted then routes[#routes + 1] = route else admin_routes[#admin_routes + 1] = route end
            end
        end
    end
    assert(#routes > 0, "no composed member endpoints")
    local res = assert(http.response())
    res:set_content_type(http.CONTENT.JSON)
    res:write_json({count = #routes, routes = routes, admin_routes = admin_routes,
        policy_matrix = policy_matrix, overgrant_rejected = true})
end
return {handler = handler, inspect = inspect}
