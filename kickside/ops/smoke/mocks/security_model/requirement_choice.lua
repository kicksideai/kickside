local http = require("http")
local planner = require("planner")
local registry = require("registry")

local function choices()
    local graph = {{module = "security-model/choice", namespace = "security.model.choice", version = "*",
        depth = 0, path = {}, requirements = {{name = "scope", meta = {value_kind = "security.scope"}, targets = {}}}}}
    local service = planner.new()
    local plan = assert(service:plan_requirements(graph, {}))
    local row = plan.requirements[1]
    assert(row.value == "" and row.missing and #row.suggestions > 1 and #plan.parameters == 0)
    local selected = "kickside.security.groups:members"
    graph[1].requirements[1].default = selected
    plan = assert(service:plan_requirements(graph, {}))
    assert(plan.requirements[1].value == selected and plan.requirements[1].value_source == "default")
    graph[1].requirements[1].default = nil
    plan = assert(service:plan_requirements(graph, {{name = "security.model.choice:scope", value = selected}}))
    assert(plan.requirements[1].value == selected and plan.requirements[1].value_source == "provided")
    plan = assert(service:plan_requirements(graph, {{name = "security.model.choice:scope", value = "security.model:outside_candidates"}}))
    assert(#plan.missing == 1 and plan.requirements[1].invalid and #plan.parameters == 0)
    local candidates = {{id = selected, kind = "security.scope", meta = {}, data = {}}}
    local candidate_registry = {find = function(criteria)
        local rows = {}
        for _, entry in ipairs(candidates) do
            local matches = true
            for key, expected in pairs(criteria) do
                local value: any = entry
                for field in key:gmatch("[^%.]+") do
                    value = type(value) == "table" and value[field] or nil
                end
                if value ~= expected then matches = false; break end
            end
            if matches then rows[#rows + 1] = entry end
        end
        return rows, nil
    end}
    assert(#candidate_registry.find({}) == 1)
    assert(#candidate_registry.find({[".kind"] = "security.scope"}) == 1)
    assert(#candidate_registry.find({[".kind"] = "ns.dependency"}) == 0)
    assert(#candidate_registry.find({[".id"] = "missing"}) == 0)
    assert(#candidate_registry.find({["meta.type"] = "kickside.security.role"}) == 0)
    service = planner.new({registry = candidate_registry})
    plan = assert(service:plan_requirements(graph, {}))
    assert(plan.requirements[1].value == selected and plan.requirements[1].value_source == "registry"
        and #plan.missing == 0)
    local dependency = assert(registry.get("kickside.uploads.documents:dependency.doc2md"))
    local versions = {{version = "0.8.10"}, {version = "0.8.11"}, {version = "0.9.0"}}
    local version_planner = planner.new({
        ownership = {new = function()
            return {selection_of = function() return nil, nil end}
        end},
        catalog = {versions = {list = function()
            return {items = versions, total = #versions, page_size = 100}, nil
        end}},
    })
    local constraints = {{constraint = dependency.data.version, required_by = "kickside/uploads"}}
    local older = assert(version_planner:select_version_for_constraints(
        "kickside/doc2md", constraints, nil, false, "0.8.10"))
    local newer = assert(version_planner:select_version_for_constraints(
        "kickside/doc2md", constraints, nil, false, "0.9.0"))
    local response = assert(http.response())
    response:set_content_type(http.CONTENT.JSON)
    response:write_json({success = true, defaults_win = true, constrained_choices = true,
        explicit_choices = true, sole_candidate = true,
        converter_older_selection = older.version, converter_newer_selection = newer.version, typed_errors = true})
end

local function security_update()
    local dependency = assert(registry.get("kickside.users:dep.kickside.security"))
    local entries = assert(registry.find({[".kind"] = "ns.requirement"}))
    local requirements = {}
    for _, entry in ipairs(entries) do
        if tostring(entry.id):match("^kickside%.security:[^:]+$") then
            local requirement = entry.data or {}
            requirement.name = tostring(entry.id):match(":([^:]+)$")
            requirement.meta = entry.meta
            requirements[#requirements + 1] = requirement
        end
    end
    local database = assert(registry.get("app:db"))
    local users_resources = {}
    for _, entry in ipairs(assert(registry.find({}))) do
        if tostring(entry.id):match("^kickside%.users[%.:]") then
            users_resources[entry.id] = entry.kind
        end
    end
    local proof = require("guard").verify(planner, dependency.data.component, requirements, database.kind, users_resources)
    local response = assert(http.response())
    response:set_content_type(http.CONTENT.JSON)
    response:write_json(proof)
end

return {choices = choices, security_update = security_update}
