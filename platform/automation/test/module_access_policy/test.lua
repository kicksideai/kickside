local test = require("test")
local registry = require("registry")
local security = require("security")
local function composed_scope(root)
    local policies, seen = {}, {}
    local function include(id)
        if seen[id] then return end
        seen[id] = true
        local entry, err = registry.get(id)
        assert(not err, tostring(err))
        assert(entry, id)
        policies[#policies + 1] = assert(security.policy(id))
        for _, child in ipairs(entry.meta.includes or {}) do include(child) end
    end
    include(root)
    return assert(security.new_scope(policies))
end
local function define_tests()
    test.describe("Module access composition", function()
        test.it("admits exactly the listed endpoint identities", function()
            local policy_id = "kickside.automation.security:automation_endpoint_access"
            local declaration, declaration_err = registry.get(policy_id)
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.is_nil(declaration.data.policy.conditions)
            local expected = {
                ["kickside.automation.api:call_action.endpoint"] = true,
                ["kickside.automation.api:delete.endpoint"] = true,
                ["kickside.automation.api:drive_control.endpoint"] = true,
                ["kickside.automation.api:export.endpoint"] = true,
                ["kickside.automation.api:get_execution_identity.endpoint"] = true,
                ["kickside.automation.api:health.endpoint"] = true,
                ["kickside.automation.api:history.endpoint"] = true,
                ["kickside.automation.api:import.endpoint"] = true,
                ["kickside.automation.api:install.endpoint"] = true,
                ["kickside.automation.api:install_selected.endpoint"] = true,
                ["kickside.automation.api:list.endpoint"] = true,
                ["kickside.automation.api:list_sinks.endpoint"] = true,
                ["kickside.automation.api:list_sources.endpoint"] = true,
                ["kickside.automation.api:source_samples.endpoint"] = true,
                ["kickside.automation.api:list_types.endpoint"] = true,
                ["kickside.automation.api:read_config.endpoint"] = true,
                ["kickside.automation.api:read_state.endpoint"] = true,
                ["kickside.automation.api:reconfigure.endpoint"] = true,
                ["kickside.automation.api:set_execution_identity.endpoint"] = true,
                ["kickside.automation.api:status.endpoint"] = true,
                ["kickside.automation.api:update_meta.endpoint"] = true,
            }
            local listed = {}
            for _, id in ipairs(declaration.data.policy.resources) do
                test.is_true(expected[id] == true, id)
                test.is_nil(listed[id], id)
                listed[id] = true
                local entry, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
            end
            for id in pairs(expected) do test.is_true(listed[id] == true, id) end
            local policy, policy_err = security.policy(policy_id)
            test.is_nil(policy_err)
            local actor = security.new_actor("listed-endpoint-member", {})
            local endpoints, find_err = registry.find({[".kind"] = "http.endpoint"})
            test.is_nil(find_err)
            for _, entry in ipairs(endpoints) do
                local id = tostring(entry.id)
                test.eq(policy:evaluate(actor, "access", id), expected[id] and "allow" or "undefined", id)
            end
            for id in pairs(expected) do
                test.eq(policy:evaluate(actor, "access", id .. ".unlisted"), "undefined", id)
            end
        end)
        test.it("declares a compatible platform Members default for every member requirement", function()
            for _, id in ipairs({"kickside.automation.security:user_security_scope"}) do
                local requirement, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(requirement, id)
                test.eq(requirement.meta.value_kind, "security.scope", id)
                test.eq(requirement.data.default, "kickside.security.groups:members", id)
            end
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.policy("kickside.automation.security:automation_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            local bundle = composed_scope("kickside.automation.security:module_access")
            for _, id in ipairs({
                "kickside.automation.api:list_types.endpoint",
                "kickside.automation.api:list_sources.endpoint",
                "kickside.automation.api:list_sinks.endpoint",
                "kickside.automation.api:list.endpoint",
                "kickside.automation.api:install.endpoint",
                "kickside.automation.api:delete.endpoint",
                "kickside.automation.api:read_state.endpoint",
                "kickside.automation.api:read_config.endpoint",
                "kickside.automation.api:export.endpoint",
                "kickside.automation.api:import.endpoint",
                "kickside.automation.api:reconfigure.endpoint",
                "kickside.automation.api:update_meta.endpoint",
                "kickside.automation.api:status.endpoint",
                "kickside.automation.api:health.endpoint",
                "kickside.automation.api:set_execution_identity.endpoint",
                "kickside.automation.api:drive_control.endpoint",
                "kickside.automation.api:call_action.endpoint",
            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(bundle:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.automation_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local declaration = registry.get("kickside.automation.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.automation")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = composed_scope("kickside.automation.security:module_access")
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.automation:failure_classification"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
