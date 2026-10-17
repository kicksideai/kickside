local test = require("test")
local registry = require("registry")

local function data(entry)
    return type(entry) == "table" and (entry.data or entry) or {}
end

local function define_tests()
    test.describe("ui dependency seams", function()
        test.it("declares the Facade and Settings packages it extends", function()
            test.eq(data(registry.get("kickside.ui:dep.wippy.facade")).component, "wippy/facade")
            test.eq(data(registry.get("kickside.ui:dep.kickside.settings")).component, "kickside/settings")
        end)

        test.it("keeps facade handler policy targets narrow and resolvable", function()
            for _, id in ipairs({
                "kickside.ui:facade_resolver_handler_settings_contract_policy",
                "kickside.ui:facade_resolver_handler_settings_registry_policy",
                "kickside.ui:facade_resolver_handler_settings_cache_policy",
                "kickside.ui:facade_resolver_handler_static_read_policy",
                "kickside.ui:facade_resolver_handler_contract_policy",
            }) do
                local requirement = data(registry.get(id))
                test.eq(#(requirement.targets or {}), 2)
                for _, target in ipairs(requirement.targets) do
                    local entry, err = registry.get(target.entry)
                    test.is_nil(err)
                    test.not_nil(entry)
                    test.is_true(target.entry == "wippy.facade:config_handler"
                        or target.entry == "wippy.facade:css_vars_handler")
                end
            end
        end)
    end)
end

return { run = test.run_cases(define_tests) }
