local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("declares the standalone test runner dependency", function()
            local dependency, err = registry.get("app:dep.wippy.test")
            test.is_nil(err)
            test.not_nil(dependency)
            test.eq(dependency.kind, "ns.dependency")
            test.eq(dependency.data.component, "wippy/test")
            test.eq(dependency.data.version, "*")
        end)
        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.skills.security:module_access")
            test.is_nil(err)
            test.not_nil(policy)
            local baseline, baseline_err = security.policy("kickside.contract.http:user_endpoint_access")
            test.is_nil(baseline_err)
            test.not_nil(baseline)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.skills.api:create_skill.endpoint",
                "kickside.skills.api:delete_skill.endpoint",
                "kickside.skills.api:get_skill.endpoint",
                "kickside.skills.api:read_file.endpoint",
                "kickside.skills.api:list_skills.endpoint",
                "kickside.skills.api:list_versions.endpoint",
                "kickside.skills.api:refine_skill.endpoint",
            }) do
                local entry, entry_err = registry.get(id)
                test.is_nil(entry_err, id)
                test.not_nil(entry, id)
                test.eq(entry.kind, "http.endpoint", id)
                test.eq(entry.meta.router, "app:api", id)
                test.eq(policy:evaluate(actor, "access", id, nil), "allow", id)
                test.eq(policy:evaluate(actor, "funcs.call", id, nil), "undefined", id)
                test.eq(baseline:evaluate(actor, "access", id, nil), "undefined", id)
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
