local test = require("test")
local security = require("security")
local registry = require("registry")

local function load_policy(id: string)
    local policy, err = security.policy(id)
    if not policy then
        error("missing policy " .. id .. ": " .. tostring(err))
    end
    return policy
end

local function decision(policy_id: string, action: string, resource: string): string
    local actor = security.new_actor("kickside.ui:test", {})
    local result = load_policy(policy_id):evaluate(actor, action, resource, {})
    if result == "allow" or result == "deny" then
        return result
    end
    return "undefined"
end

local function define_tests()
    test.describe("Scoped System navigation", function()
        test.it("offers an unassigned catalog capability without management authority", function()
            local id = "kickside.ui.security:system_tabs_access"
            local declaration = assert(registry.get(id))
            test.eq(#declaration.data.groups, 0)
            test.eq(decision(id, "access", "kickside.ui.api:list_settings_tabs.endpoint"), "allow")
            for _, resource in ipairs({
                "kickside.ui.api:set_config.endpoint", "kickside.ui.api:upload_logo.endpoint",
                "kickside.ui.api:reset_splashes.endpoint", "kickside.ui:system_onboarding",
                "kickside.settings.api:list_settings.endpoint", "kickside.settings.api:put_settings.endpoint",
                "kickside.ui.api:list_settings_tabs.endpoint.future", "kickside.ui:fixture_management",
            }) do
                test.eq(decision(id, "access", resource), "undefined", resource)
            end
            test.eq(decision(id, "funcs.call", "kickside.ui.api:list_settings_tabs"), "undefined")
            test.eq(decision(id, "db.get", "app:db"), "undefined")
        end)
        test.it("does not grant System discovery to ordinary members", function()
            for _, id in ipairs({"kickside.ui.security:module_access", "kickside.ui.security:module_runtime",
                "kickside.ui.security:ui_endpoint_access"}) do
                test.eq(decision(id, "access", "kickside.ui.api:list_settings_tabs.endpoint"), "undefined", id)
            end
        end)
    end)

    test.describe("kickside.ui public branding security policies", function()
        test.it("allows only the settings contract used by public branding", function()
            test.eq(decision("kickside.ui:public_branding_settings_contract", "contract.get", "kickside.settings:settings"), "allow")
            test.eq(decision("kickside.ui:public_branding_settings_contract", "contract.open", "kickside.settings:settings"), "allow")
            test.eq(decision("kickside.ui:public_branding_settings_contract", "contract.call", "kickside.settings:settings"), "allow")
            -- open() authorizes against the binding resource; call() authorizes by method name.
            test.eq(decision("kickside.ui:public_branding_settings_contract", "contract.open", "kickside.settings:settings_binding"), "allow")
            test.eq(decision("kickside.ui:public_branding_settings_contract", "contract.call", "get_namespace"), "allow")
            test.eq(decision("kickside.ui:public_branding_settings_contract", "contract.call", "set"), "undefined")
            test.eq(decision("kickside.ui:public_branding_settings_contract", "contract.get", "kickside.models:profiles"), "undefined")
            test.eq(decision("kickside.ui:public_branding_settings_contract", "db.get", "app:db"), "undefined")
        end)

        test.it("allows read-only settings discovery and warm-cache access", function()
            test.eq(decision("kickside.ui:public_branding_settings_registry", "registry.find", "kickside.ui:title"), "allow")
            test.eq(decision("kickside.ui:public_branding_settings_registry", "store.get", "kickside.settings:cache"), "undefined")

            test.eq(decision("kickside.ui:public_branding_settings_cache", "store.get", "kickside.settings:cache"), "allow")
            test.eq(decision("kickside.ui:public_branding_settings_cache", "store.key.get", "kickside.settings:cache"), "allow")
            test.eq(decision("kickside.ui:public_branding_settings_cache", "store.key.set", "kickside.settings:cache"), "undefined")
            test.eq(decision("kickside.ui:public_branding_settings_cache", "store.get", "kickside.models:cache"), "undefined")
            test.eq(decision("kickside.ui:public_branding_settings_cache", "db.get", "app:db"), "undefined")
            test.eq(decision("kickside.ui:public_branding_settings_cache", "access", "kickside.settings.api:list_settings.endpoint"), "undefined")
        end)

        test.it("allows facade handlers to open only the optional facade resolver contract", function()
            test.eq(decision("kickside.ui:facade_resolver_contract_access", "contract.get", "wippy.facade:resolver"), "allow")
            test.eq(decision("kickside.ui:facade_resolver_contract_access", "contract.open", "kickside.ui:facade_resolver_binding"), "allow")
            test.eq(decision("kickside.ui:facade_resolver_contract_access", "contract.call", "resolve"), "allow")
            test.eq(decision("kickside.ui:facade_resolver_contract_access", "contract.get", "kickside.settings:settings"), "undefined")
            test.eq(decision("kickside.ui:facade_resolver_contract_access", "contract.call", "set"), "undefined")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
