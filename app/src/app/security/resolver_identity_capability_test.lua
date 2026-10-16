local test = require("test")
local registry = require("registry")
local security = require("security")

local function define_tests()
    test.describe("Canonical resolver private capability", function()
        test.it("confines canonical resolution to its private subject-read capability without replacing the caller", function()
            local resolver = registry.get("kickside.users.binding:scope_resolver_func")
            test.not_nil(resolver)
            local data = (resolver :: any).data
            test.not_nil(data.security)
            test.is_nil(data.security.actor)
            test.eq(#data.security.policies, 2)
            test.eq(data.security.policies[1], "kickside.users.directory:subject_lookup_access")
            test.eq(data.security.policies[2], "kickside.users.security:run_as_candidate_evaluation")
            local evaluation, evaluation_err = security.policy("kickside.users.security:run_as_candidate_evaluation")
            test.is_nil(evaluation_err)
            test.not_nil(evaluation)
            local evaluation_scope = security.new_scope({evaluation})
            local evaluation_actor = security.new_actor("resolver-evaluation-caller", {})
            for _, action in ipairs({"security.actor.create", "security.policy_group.get", "security.scope.create"}) do
                test.eq(evaluation_scope:evaluate(evaluation_actor, action, "*", {}), "allow", action)
            end
            for _, action in ipairs({"security.actor.delegate", "funcs.call", "registry.apply", "db.get", "access"}) do
                test.eq(evaluation_scope:evaluate(evaluation_actor, action, "*", {}), "undefined", action)
            end
            local declaration = registry.get("kickside.users.directory:subject_lookup_access")
            test.not_nil(declaration)
            test.is_nil((declaration :: any).data.groups)
            local policy, err = security.policy("kickside.users.directory:subject_lookup_access")
            test.is_nil(err)
            test.not_nil(policy)
            local scope = security.new_scope({policy})
            local actor = security.new_actor("resolver-caller", {})
            test.eq(scope:evaluate(actor, "funcs.call", "kickside.users.binding:subject_lookup", {}), "allow")
            for _, resource in ipairs({"kickside.users.binding:credential_subject_lookup", "kickside.users.binding:group_members_func",
                "kickside.users.binding:credential_eligibility"}) do
                test.eq(scope:evaluate(actor, "funcs.call", resource, {}), "undefined", resource)
            end
            for _, action in ipairs({"security.actor.delegate", "security.actor.create", "security.scope.create",
                "registry.apply", "db.get", "access"}) do
                test.eq(scope:evaluate(actor, action, "*", {}), "undefined", action)
            end
        end)

    end)
end

return { run = test.run_cases(define_tests) }
