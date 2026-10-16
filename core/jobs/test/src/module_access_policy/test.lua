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
        test.it("declares a compatible platform Members default for every member requirement", function()
            for _, id in ipairs({"kickside.core.jobs.security:user_security_scope"}) do
                local requirement, err = registry.get(id)
                test.is_nil(err, id)
                test.not_nil(requirement, id)
                test.eq(requirement.meta.value_kind, "security.scope", id)
                test.eq(requirement.data.default, "kickside.security.groups:members", id)
            end
        end)
        test.it("retains runtime grants without admitting undeclared endpoints", function()
            local policy, err = security.policy("kickside.core.jobs.security:jobs_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            local bundle = composed_scope("kickside.core.jobs.security:module_access")
            local declaration = assert(registry.get("kickside.core.jobs.security:jobs_endpoint_access"))
            local runtime = assert(registry.get("kickside.core.jobs.security:module_runtime"))
            test.eq(declaration.data.policy.effect, runtime.data.policy.effect)
            for _, field in ipairs({"resources", "actions"}) do
                test.eq(#declaration.data.policy[field], #runtime.data.policy[field], field)
                for index, value in ipairs(runtime.data.policy[field]) do
                    test.eq(declaration.data.policy[field][index], value, field)
                end
            end
            test.is_nil(declaration.data.policy.conditions)
            for _, id in ipairs({"kickside.core.jobs.api:read.endpoint", "unrelated.module:list.endpoint",
                                "kickside.core.jobs_extension:list.endpoint"}) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
                test.eq(bundle:evaluate(actor, "access", id), "undefined", id)
            end
            for _, action in ipairs(runtime.data.policy.actions) do
                test.eq(policy:evaluate(actor, action, "kickside.core.jobs:worker"), "allow", action)
                test.eq(bundle:evaluate(actor, action, "kickside.core.jobs:worker"), "allow", action)
                test.eq(policy:evaluate(actor, action, "unrelated.module:worker"), "undefined", action)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local policies, seen = {}, {}
            local function include(id)
                if seen[id] then return end
                seen[id] = true
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                local policy, policy_err = security.policy(id)
                test.is_nil(policy_err, id)
                policies[#policies + 1] = policy
                for _, child in ipairs(entry.meta.includes or {}) do include(child) end
            end
            include("kickside.core.jobs.security:module_access")
            local declaration = registry.get("kickside.core.jobs.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.core.jobs")
            test.is_true(declaration.meta.private ~= true)
            local scope, scope_err = security.new_scope(policies)
            test.is_nil(scope_err)
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.core.jobs:db_config"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
