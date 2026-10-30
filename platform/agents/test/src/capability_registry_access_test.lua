-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local security = require("security")
local funcs = require("funcs")
local composition = require("policy_composition")

local CAPABILITY = "kickside.memory:knowledge_based_memory"
local PROBE = "kickside.agents:capability_registry_probe"

local function scope(roots)
    local ids, expand_err = composition.expand(roots)
    test.is_nil(expand_err)
    local policies = {}
    for _, id in ipairs(ids) do
        local policy, policy_err = security.policy(id)
        test.is_nil(policy_err)
        policies[#policies + 1] = policy
    end
    local result, err = security.new_scope(policies)
    test.is_nil(err)
    return result
end

local function define_tests()
    test.describe("Capability registry authority", function()
        test.it("preserves a native denial under a member scope without provider access", function()
            local actor = security.new_actor("capability-member", {})
            local member_scope = scope({"kickside.agents.security:module_access"})
            local result, err = funcs.new():with_actor(actor):with_scope(member_scope):call(PROBE, {id = CAPABILITY})
            test.is_nil(result)
            test.not_nil(err)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED), tostring(err))
            test.contains(tostring(err), CAPABILITY)
            test.contains(tostring(err), "not allowed to access entry")
            test.is_nil(tostring(err):find("got missing", 1, true))
        end)
        test.it("accepts a public capability with exactly its declared provider access", function()
            local actor = security.new_actor("capability-member", {})
            local member_scope = scope({"kickside.agents.security:module_access", "kickside.memory.security:module_access"})
            test.eq(member_scope:evaluate(actor, "registry.get", CAPABILITY), "allow")
            local result, err = funcs.new():with_actor(actor):with_scope(member_scope):call(PROBE, {id = CAPABILITY})
            test.is_nil(err, tostring(err))
            test.is_true(result.ok)
        end)
    end)
end

return {run = test.run_cases(define_tests)}
