local test = require("test")
local security = require("security")
local registry = require("registry")

local function define_tests()
    test.describe("A module without member endpoints", function()
        test.it("loads its runtime grants and grants no endpoint access", function()
            local declaration, declaration_err = registry.get("smoke.empty_policy:member_access")
            test.is_nil(declaration_err)
            test.not_nil(declaration)
            test.eq(#declaration.data.policy.resources, 1)
            test.eq(declaration.data.policy.resources[1], "smoke.empty_policy:*")
            test.eq(#declaration.data.policy.actions, 1)
            test.eq(declaration.data.policy.actions[1], "registry.get")
            test.is_nil(declaration.data.policy.conditions)
            local policy, policy_err = security.policy(tostring(declaration.id))
            test.is_nil(policy_err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            test.eq(policy:evaluate(actor, "registry.get", "smoke.empty_policy:empty_endpoint_policy_test"), "allow")
            test.eq(policy:evaluate(actor, "registry.get", "another.api:list.endpoint"), "undefined")
            for _, id in ipairs({"smoke.empty_policy:list.endpoint", "another.api:list.endpoint"}) do
                test.eq(policy:evaluate(actor, "access", id), "undefined", id)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
