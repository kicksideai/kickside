local test = require("test")
local registry = require("registry")
local security = require("security")
local member_endpoints = {
    "kickside.transform.api:assist.endpoint",
    "kickside.transform.api:snippet.endpoint",
    "kickside.transform.api:validate.endpoint",
}
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("retains endpoint admission through the native member-scope requirement", function()
            local scope, scope_err = security.named_scope("app:transform_members")
            test.is_nil(scope_err)
            test.not_nil(scope)
            local actor = security.new_actor("required-module-member", {})
            for _, id in ipairs(member_endpoints) do
                test.eq(scope:evaluate(actor, "access", id), "allow", id)
            end
            test.eq(scope:evaluate(actor, "access", "kickside.users.api:list_users.endpoint"), "undefined")
            test.eq(scope:evaluate(actor, "access", member_endpoints[1] .. ".unlisted"), "undefined")
        end)
        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.transform.security:transform_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs(member_endpoints) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
                test.eq(policy:evaluate(actor, "access", id, nil), "allow", id)
                test.eq(policy:evaluate(actor, "funcs.call", id, nil), "undefined", id)
                local unmarked = id .. ".unlisted"
                local legacy = registry.get(unmarked)
                test.is_nil(legacy, unmarked)
                test.eq(policy:evaluate(actor, "access", unmarked, nil), "undefined", unmarked)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
