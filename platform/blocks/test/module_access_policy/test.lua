local test = require("test")
local registry = require("registry")
local security = require("security")

local function composed_scope(root: string): any
    local policies, seen = {}, {}
    local function include(id: string)
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
            local policy_id = "kickside.blocks.security:module_access"
            local declaration, declaration_err = registry.get(policy_id)
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            local expected = {
            }
            local runtime, runtime_err = registry.get(declaration.meta.includes[1])
            test.is_nil(runtime_err)
            test.not_nil(runtime)
            test.is_true(#declaration.data.policy.resources > 0)
            test.eq(#declaration.data.policy.resources, #runtime.data.policy.resources)
            for index, resource in ipairs(runtime.data.policy.resources) do
                test.eq(declaration.data.policy.resources[index], resource)
            end
            test.eq(#declaration.data.policy.actions, #runtime.data.policy.actions)
            for index, action in ipairs(runtime.data.policy.actions) do
                test.eq(declaration.data.policy.actions[index], action)
                test.is_true(action ~= "access", action)
            end
            test.eq(declaration.data.policy.effect, runtime.data.policy.effect)
            local runtime_policy, runtime_policy_err = security.policy(tostring(runtime.id))
            test.is_nil(runtime_policy_err)
            local entries, entries_err = registry.find({})
            test.is_nil(entries_err)
            local actor = security.new_actor("runtime-grant-member", {})
            local member_policy, member_policy_err = security.policy(policy_id)
            test.is_nil(member_policy_err)
            for _, entry in ipairs(entries) do
                for _, action in ipairs(runtime.data.policy.actions) do
                    test.eq(member_policy:evaluate(actor, action, tostring(entry.id)),
                        runtime_policy:evaluate(actor, action, tostring(entry.id)), tostring(entry.id))
                end
            end
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
        test.it("includes only the owned Await process capability", function()
            local declaration, declaration_err = registry.get("kickside.blocks.security:module_access")
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.eq(declaration.meta.includes[2], "kickside.blocks.security:await_execution")

            local execution, execution_err = registry.get("kickside.blocks.security:await_execution")
            test.is_nil(execution_err)
            test.not_nil(execution)
            test.is_true(execution.meta.private == true)
            test.eq(#execution.data.policy.resources, 1)
            test.eq(execution.data.policy.resources[1], "kickside.blocks:await")
            test.eq(#execution.data.policy.actions, 1)
            test.eq(execution.data.policy.actions[1], "process.spawn")

            local scope = composed_scope("kickside.blocks.security:module_access")
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "process.spawn", "kickside.blocks:await"), "allow")
            for _, action in ipairs({ "process.spawn.monitored", "process.spawn.linked" }) do
                test.eq(scope:evaluate(actor, action, "kickside.blocks:await"), "undefined", action)
            end
            test.eq(scope:evaluate(actor, "process.spawn", "userspace.dataflow.runner:orchestrator"), "undefined")
            test.eq(scope:evaluate(actor, "process.spawn", "unrelated.module:process"), "undefined")
            test.eq(scope:evaluate(actor, "registry.apply", "*"), "undefined")
        end)
        test.it("admits owned member endpoints and rejects other modules", function()
            local policy, err = security.policy("kickside.blocks.security:module_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({

            }) do
                test.not_nil(registry.get(id), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", (id .. ".unlisted")), "undefined", id)
                test.eq(policy:evaluate(actor, "funcs.call", id), "undefined", id)
            end
            for _, id in ipairs({ "unrelated.module:list.endpoint", "kickside.blocks_extension:list.endpoint" }) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
        test.it("includes module discovery without an application blanket grant", function()
            local declaration = registry.get("kickside.blocks.security:module_access")
            test.is_true(type(declaration.meta.title) == "string" and declaration.meta.title ~= "")
            test.eq(declaration.meta.intent, "module_access")
            test.eq(declaration.meta.surface, "kickside.blocks")
            test.is_true(declaration.meta.private ~= true)
            local scope = composed_scope("kickside.blocks.security:module_access")
            local actor = security.new_actor("module-member", {})
            test.eq(scope:evaluate(actor, "registry.get", "kickside.blocks:blocks"), "allow")
            for _, action in ipairs({ "access", "registry.get", "funcs.call" }) do
                test.eq(scope:evaluate(actor, action, "unrelated.module:list.endpoint"), "undefined", action)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
