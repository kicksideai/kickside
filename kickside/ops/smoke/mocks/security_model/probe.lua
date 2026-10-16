local http = require("http")
local registry = require("registry")
local security = require("security")
local execution = require("execution_identity")

local function write(value)
    local response = assert(http.response())
    response:set_content_type(http.CONTENT.JSON)
    response:write_json(value)
end

local function product(id)
    return id:match("^kickside%.") or id:match("^chestor%.") or id:match("^app[:%.]")
end

local function surface_declares(surfaces, id)
    for _, surface in ipairs(surfaces) do
        if id:sub(1, #surface + 1) == surface .. ":" or id:sub(1, #surface + 1) == surface .. "." then
            return true
        end
    end
    return false
end

local function inspect()
    local request = assert(http.request())
    local group = request:query("group") or "app.security:members"
    local namespace = request:query("namespace")
    local scope = assert(execution.scope_from_groups({"app.security:user", group}))
    local baseline = assert(security.named_scope("app.security:user"))
    local before = assert(security.named_scope("security.model:before"))
    local policies = before:policies()
    local entries = assert(registry.find({}))
    for _, entry in ipairs(entries) do
        if entry.kind == "security.policy" and product(tostring(entry.id))
            and not tostring(entry.id):match("^app[:%.]")
            and not tostring(entry.id):match(":module_") then
            for _, membership in ipairs((entry.data or {}).groups or {}) do
                if membership == "app.security:user" or membership == "app.security:members" then
                    policies[#policies + 1] = assert(security.policy(tostring(entry.id)))
                    break
                end
            end
        end
    end
    before = security.new_scope(policies)
    local actor = security.new_actor("security-matrix", {})
    local historical = {}
    for _, id in ipairs(assert(registry.get("security.model:historical")).data.ids) do
        historical[id] = true
    end
    local surfaces = {}
    for _, entry in ipairs(entries) do
        local meta = entry.meta or {}
        if entry.kind == "security.policy" and meta.intent == "module_access" and meta.surface then
            surfaces[#surfaces + 1] = meta.surface
        end
    end
    local matrix, losses, changes, additions, excluded_routes, excluded_entries = {}, {}, {}, {}, {}, {}
    local actions = {"access", "registry.get", "registry.find", "funcs.call", "funcs.security",
        "contract.get", "contract.open", "contract.call", "contract.implementations", "contract.security",
        "view", "template.get"}
    for _, entry in ipairs(entries) do
        local id = tostring(entry.id)
        if product(id) and not id:match(":module_") and not (entry.meta or {}).scope_metadata then
            for _, action in ipairs(actions) do
                local new = scope:evaluate(actor, action, id)
                if historical[id] then
                    local old = before:evaluate(actor, action, id)
                    local row = {id = id, kind = entry.kind, action = action, before = old, after = new}
                    matrix[#matrix + 1] = row
                    if old ~= new then changes[#changes + 1] = row end
                    if old == "allow" and new ~= "allow" then losses[#losses + 1] = row end
                elseif new == "allow" and baseline:evaluate(actor, action, id) ~= "allow" and not surface_declares(surfaces, id) then
                    additions[#additions + 1] = {id = id, kind = entry.kind, action = action, after = new}
                end
            end
        end
        local owned = namespace and (id:sub(1, #namespace + 1) == namespace .. ":"
            or id:sub(1, #namespace + 1) == namespace .. ".")
        if owned then
            local base_read = baseline:evaluate(actor, "registry.get", id)
            if base_read ~= "allow" then
                assert(scope:evaluate(actor, "registry.get", id) ~= "allow", "excluded registry resource " .. id)
                excluded_entries[#excluded_entries + 1] = {id = id, kind = entry.kind}
            end
            if entry.kind == "http.endpoint" and baseline:evaluate(actor, "access", id) ~= "allow" then
                local data = entry.data or entry
                local router = assert(registry.get(entry.meta.router))
                local config = router.data or router
                local protected = false
                for _, middleware in ipairs(config.post_middleware or {}) do
                    if middleware == "endpoint_firewall" then protected = true end
                end
                if protected then
                    assert(scope:evaluate(actor, "access", id) ~= "allow", "excluded endpoint " .. id)
                    excluded_routes[#excluded_routes + 1] = {id = id, method = data.method,
                        path = tostring(config.prefix or ""):gsub("/$", "") .. "/" .. data.path:gsub("^/", "")}
                end
            end
        end
    end
    write({matrix = matrix, losses = losses, changes = changes, unadmitted_additions = additions,
        excluded_routes = excluded_routes, excluded_entries = excluded_entries})
end

local function bindings()
    local requirements = assert(registry.find({[".kind"] = "ns.requirement"}))
    local targets = {}
    for _, requirement in ipairs(requirements) do
        if product(tostring(requirement.id)) and tostring(requirement.id):match(":user_security_scope$") then
            assert((requirement.meta or {}).value_kind == "security.scope", requirement.id .. " lacks its scope kind")
            assert((requirement.data or {}).default == "kickside.security.groups:members", requirement.id .. " lacks its Members default")
            for _, target in ipairs((requirement.data or {}).targets or {}) do
                if target.path == ".groups +=" then
                    local entry = assert(registry.get(target.entry))
                    local groups = (entry.data or {}).groups or {}
                    assert(#groups > 0, requirement.id .. " is unbound at " .. target.entry)
                    targets[#targets + 1] = {requirement = requirement.id, policy = target.entry, groups = groups}
                end
            end
        end
    end
    assert(#targets > 0, "installed module security requirements are absent")
    write({targets = targets})
end

local function visible()
    local entries = assert(registry.find({}))
    local out = {}
    for _, entry in ipairs(entries) do
        out[#out + 1] = {id = tostring(entry.id), kind = entry.kind, meta = entry.meta}
    end
    write({entries = out})
end

local function published_member()
    local scope = assert(security.named_scope("app.security:user"))
    local actor = security.new_actor("published-member", {})
    local policies, selected = {}, {}
    for _, requirement in ipairs(assert(registry.find({[".kind"] = "ns.requirement"}))) do
        if product(tostring(requirement.id)) and tostring(requirement.id):match(":user_security_scope$") then
            for _, target in ipairs((requirement.data or {}).targets or {}) do
                if target.path == ".groups +=" and not selected[target.entry] then
                    policies[#policies + 1] = assert(security.policy(target.entry))
                    selected[target.entry] = true
                end
            end
        end
    end
    assert(#policies > 0, "published member requirement policies are absent")
    local expected = security.new_scope(policies)
    local endpoints = assert(registry.find({[".kind"] = "http.endpoint"}))
    local matrix, losses = {}, {}
    for _, entry in ipairs(endpoints) do
        local id = tostring(entry.id)
        if product(id) and expected:evaluate(actor, "access", id) == "allow" then
            local decision = scope:evaluate(actor, "access", id)
            local row = {id = id, after = decision}
            matrix[#matrix + 1] = row
            if decision ~= "allow" then losses[#losses + 1] = row end
        end
    end
    write({matrix = matrix, losses = losses})
end

return {inspect = inspect, visible = visible, published_member = published_member, bindings = bindings}
