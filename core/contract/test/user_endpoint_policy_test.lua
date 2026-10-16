local test = require("test")
local security = require("security")
local registry = require("registry")

local function define_tests()
    test.describe("Member endpoint declaration policy", function()
        test.it("evaluates the exact resource list for the core baseline and actions", function()
            local policy, err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("contract-member", {})
            for _, id in ipairs({"kickside.core.threads.api:list_threads.endpoint", "kickside.core.retention.api:get_thread_retention.endpoint"}) do
                test.eq(policy:evaluate(actor, "access", id, nil), "allow", id)
                for _, action in ipairs({"funcs.call", "registry.update", "registry.commit", "publish"}) do
                    test.eq(policy:evaluate(actor, action, id, nil), "undefined", action)
                end
            end
            for _, id in ipairs({"other.product:list.endpoint", "chestor.workspace.api:move_entry.endpoint", "kickside.core.jobs.api:list.endpoint", "kickside.core_extension:list.endpoint", "", ":list.endpoint", "other:", "other:.endpoint", "other:list", "other:list.endpoint", "other:list.admin.endpoint", "other:list.endpoint.extra", "other:list:user.endpoint"}) do
                test.eq(policy:evaluate(actor, "access", id, nil), "undefined", id)
            end
        end)
        test.it("keeps an unbound member group outside the policy", function()
            local scope, err = security.named_scope("contract.test:ordinary_member")
            test.is_nil(err)
            test.eq(scope:evaluate(security.new_actor("member", {}), "access", "other:list.endpoint", nil), "undefined")
        end)
        test.it("accepts a host group and preserves explicit deny precedence", function()
            local scope, err = security.named_scope("contract.test:bound_member")
            test.is_nil(err)
            local actor = security.new_actor("member", {})
            local entry, entry_err = registry.get("kickside.contract.http:user_endpoint_access")
            test.is_nil(entry_err)
            local data = entry.data or entry
            local bound = false
            for _, group in ipairs(data.groups or {}) do
                if group == "contract.test:bound_member" then bound = true end
            end
            local config, config_err = registry.get("app:policy_test_config")
            test.is_nil(config_err)
            local expected = (config.data or config).expected_binding
            test.eq(bound, expected, "host requirement binding")
            test.eq(scope:evaluate(actor, "access", "kickside.core.threads.api:list_threads.endpoint", nil), expected and "allow" or "undefined")
            local deny, deny_err = security.policy("app:deny_user_endpoint")
            test.is_nil(deny_err)
            local policy, policy_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(policy_err)
            test.eq(security.new_scope({policy, deny}):evaluate(actor, "access", "kickside.core.threads.api:list_threads.endpoint", nil), "deny")
        end)
        test.it("rejects unlisted identities in each listed namespace", function()
            local entry, err = registry.get("kickside.contract.http:user_endpoint_access")
            test.is_nil(err)
            local data = entry.data or entry
            test.is_nil(data.policy.conditions)
            local policy = assert(security.policy(tostring(entry.id)))
            local actor = security.new_actor("member", {})
            for _, id in ipairs(data.policy.resources) do
                test.is_true(not id:find("*", 1, true), id)
                test.eq(policy:evaluate(actor, "access", id), "allow", id)
                test.eq(policy:evaluate(actor, "access", id .. ".unlisted"), "undefined", id)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
