local test = require("test")
local registry = require("registry")
local security = require("security")
local function define_tests()
    test.describe("Canonical member endpoint declarations", function()
        test.it("loads the module policy and each member endpoint without aliases", function()
            local policy, err = security.policy("kickside.agents.security:agents_endpoint_access")
            test.is_nil(err)
            test.not_nil(policy)
            local actor = security.new_actor("module-member", {})
            for _, id in ipairs({
                "kickside.agents.api:agents_by_name.endpoint",
                "kickside.agents.api:create_user_agent.endpoint",
                "kickside.agents.api:delete_user_agent.endpoint",
                "kickside.agents.api:get_user_agent.endpoint",
                "kickside.agents.api:list_agents.endpoint",
                "kickside.agents.api:list_memory_options.endpoint",
                "kickside.agents.api:list_namespaces.endpoint",
                "kickside.agents.api:list_tools.endpoint",
                "kickside.agents.api:list_traits.endpoint",
                "kickside.agents.api:list_user_agents.endpoint",
                "kickside.agents.api:update_user_agent.endpoint",
            }) do
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
