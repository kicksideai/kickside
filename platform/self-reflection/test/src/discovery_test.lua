local test = require("test")
local security = require("security")
local registry = require("registry")
local funcs = require("funcs")

local TRAIT = "kickside.self_reflection.traits:self_reflection"
local TOOL = "kickside.self_reflection.traits:self_reflection_tool"

-- A bundle grants its own policy plus the policies its meta.includes names, as the
-- security projection composes them into a group.
local function bundle_scope(policy_id: string): any
    local entry, entry_err = registry.get(policy_id)
    test.is_nil(entry_err)
    test.not_nil(entry)
    local policies = {}
    for _, id in ipairs({ policy_id, table.unpack((entry :: any).meta.includes or {}) }) do
        local policy, policy_err = security.policy(id)
        test.is_nil(policy_err)
        policies[#policies + 1] = policy
    end
    return security.new_scope(policies)
end

return { run = test.run_cases(function()
    test.describe("Self Reflection discovery", function()
        test.it("keeps Self Reflection discoverable to an administrator who also holds the forbid scope", function()
            local scope, scope_err = security.named_scope("app:restricted")
            test.is_nil(scope_err)
            local result, err = funcs.new():with_actor(security.new_actor("reflection-admin", {}))
                :with_scope(scope):call("app:discovery_probe", {})
            test.is_nil(err)
            test.is_true(result.visible)
            test.is_true(result.listed)
            test.is_true(result.trait)
            test.is_false(result.denied)
        end)

        test.it("grants members no Self Reflection discovery through the default module bundle", function()
            local entry = registry.get("kickside.self_reflection.security:module_access")
            test.eq((entry :: any).meta.intent, "module_access")
            local scope = bundle_scope("kickside.self_reflection.security:module_access")
            local actor = security.new_actor("reflection-member", {})
            for _, action in ipairs({ "registry.get", "registry.find" }) do
                test.eq(scope:evaluate(actor, action, TRAIT, {}), "undefined", action)
            end
            test.eq(scope:evaluate(actor, "funcs.call", TOOL, {}), "undefined")
        end)

        test.it("grants discovery and execution through the optional tool policy", function()
            local entry = registry.get("kickside.self_reflection.security:tool_access")
            test.not_nil(entry)
            test.eq((entry :: any).meta.intent, "tool_access")
            test.is_true((entry :: any).meta.private ~= true)
            local scope = bundle_scope("kickside.self_reflection.security:tool_access")
            local actor = security.new_actor("reflection-operator", {})
            test.eq(scope:evaluate(actor, "registry.get", TRAIT, {}), "allow")
            test.eq(scope:evaluate(actor, "registry.find", TRAIT, {}), "allow")
            test.eq(scope:evaluate(actor, "funcs.call", TOOL, {}), "allow")
        end)
    end)
end) }
