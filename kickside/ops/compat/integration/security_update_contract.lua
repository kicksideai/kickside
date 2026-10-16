local function equal(actual, expected, message)
    assert(actual == expected, (message or "binding differs") .. ": expected " .. tostring(expected) .. ", got " .. tostring(actual))
end

local function verify(planner, component, requirements, db_kind, users_resources)
    local resources = {
        {id = "host:router", kind = "http.router"},
        {id = "host:server", kind = "http.service"},
        {id = "host:database", kind = db_kind},
        {id = "host:processes", kind = "process.host"},
    }
    local registry = {
        find = function(criteria)
            local rows = {}
            for _, row in ipairs(resources) do
                if not criteria[".kind"] or criteria[".kind"] == row.kind then rows[#rows + 1] = row end
            end
            return rows, nil
        end,
        get = function() return nil, nil end,
        snapshot = function()
            return {state = function() return {entries = {}, resolution = {modules = {}}}, nil end}, nil
        end,
    }
    local service = planner.new({registry = registry, gov = {
        get_managed_namespaces = function() return {"app"} end,
        is_namespace_managed = function(namespace) return namespace == "app" end,
    }})
    local graph = {
        {module = "kickside/users", namespace = "kickside.users", version = "*", depth = 0, path = {}, requirements = {},
            resource_kinds = users_resources, installed = true, direct = true},
        {module = component, namespace = "kickside.security", version = "*", depth = 1,
            path = {"kickside/users", component}, requirements = requirements},
    }
    local plan, err = service:plan_requirements(graph, {})
    assert(err == nil, tostring(err))
    equal(#plan.missing, 0, "Security requirements remain unbound: " .. table.concat(plan.missing, ", "))
    local expected = {api_router = "host:router", ui_server = "host:server", target_db = "host:database", process_host = "host:processes"}
    local count = 0
    for _, row in ipairs(plan.requirements) do
        if expected[row.name] then
            count = count + 1
            equal(row.value, expected[row.name])
            equal(row.value_source, "registry")
            assert(row.transitive == true)
            assert(row.missing == false)
            assert(row.invalid == false)
        end
    end
    equal(count, 4)
    local bindings, binding_err = service:plan_binding_dependencies(plan.requirements,
        {id = "app:dep.users", data = {component = "kickside/users"}})
    assert(binding_err == nil, tostring(binding_err))
    equal(#bindings, 1)
    equal(bindings[1].component, component)
    equal(bindings[1].version, ">=v0.0.0")
    equal(#bindings[1].parameters, 4)
    for _, parameter in ipairs(bindings[1].parameters) do
        equal(parameter.value, expected[parameter.name:match(":([^:]+)$")])
    end
    return {requirements = plan.requirements, bindings = bindings}
end

return {verify = verify}
