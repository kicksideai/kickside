local test = require("test")
local funcs = require("funcs")
local security = require("security")
local shell = require("shell")
local contract = require("contract")
local composition = require("policy_composition")
local ui_types = require("ui_types")
local function define_tests()
    test.describe("Shell contribution access", function()
        test.it("requires the declared capability and preserves contributions without a gate", function()
            local actor = security.new_actor("shell-member", {})
            local allow = security.policy("app:admin")
            local deny = security.policy("kickside.ui:shell_access_deny")
            for _, denied in ipairs({false, true}) do
                local policies = denied and {allow, deny} or {allow}
                local entries, err = funcs.new():with_actor(actor):with_scope(security.new_scope(policies))
                    :call("kickside.ui:shell_access_probe")
                test.is_nil(err)
                local visible = {}
                for _, entry in ipairs(entries) do visible[entry.id] = true end
                test.eq(visible["kickside.ui:tab.gated_fixture"] == true, not denied)
                test.is_true(visible["kickside.ui:tab.appearance"] == true)
                local listed, list_err = funcs.new():with_actor(actor):with_scope(security.new_scope(policies))
                    :call("kickside.ui:shell_nav_probe")
                test.is_nil(list_err)
                local routes = {}
                for _, item in ipairs(listed.items) do routes[item.id] = item end
                test.eq(routes["kickside.ui:nav.gated_fixture"] ~= nil, not denied)
                if not denied then test.is_nil(routes["kickside.ui:nav.gated_fixture"].access) end
            end
        end)

        test.it("keeps contribution access independent from the catalog capability", function()
            local ids = assert(composition.expand({"kickside.ui.security:module_access"}))
            local policies = {}
            for _, id in ipairs(ids) do policies[#policies + 1] = assert(security.policy(id)) end
            policies[#policies + 1] = assert(security.policy("kickside.ui.security:system_tabs_access"))
            local actor = security.new_actor("scoped-system-reader", {})
            for _, grant_tab in ipairs({false, true}) do
                if grant_tab then policies[#policies + 1] = assert(security.policy("kickside.ui:shell_fixture_management")) end
                local entries, err = funcs.new():with_actor(actor):with_scope(security.new_scope(policies))
                    :call("kickside.ui:shell_access_probe")
                test.is_nil(err)
                local visible = {}
                for _, entry in ipairs(entries) do visible[entry.id] = true end
                test.eq(visible["kickside.ui:tab.gated_fixture"] == true, grant_tab)
                test.is_nil(visible["kickside.ui:tab.appearance"], "catalog discovery must not grant Appearance")
            end
        end)

        test.it("lets a module member read the shell settings the navigation renders", function()
            local actor = security.new_actor("shell-module-member", {})
            local ids, expand_err = composition.expand({"kickside.ui.security:module_access"})
            test.is_nil(expand_err)
            local policies = {}
            for _, id in ipairs(ids) do policies[#policies + 1] = security.policy(id) end
            local settings, err = funcs.new():with_actor(actor):with_scope(security.new_scope(policies))
                :call("kickside.ui:shell_settings_probe")
            test.is_nil(err)
            test.is_true(settings.success)
            test.eq(type(settings.values), "table")
        end)

        test.it("shows Appearance only to callers that may write the navigation configuration", function()
            local actor = security.new_actor("shell-tab-reader", {})
            local reader = security.new_scope({security.policy("kickside.ui.security:module_runtime")})
            local entries, err = funcs.new():with_actor(actor):with_scope(reader):call("kickside.ui:shell_access_probe")
            test.is_nil(err)
            for _, entry in ipairs(entries) do test.neq(entry.id, "kickside.ui:tab.appearance") end
        end)
    end)
end
return {
    run = test.run_cases(define_tests),
    discover = function() return shell.discover("ui.settings_tab") end,
    nav = function() return funcs.new():call("kickside.ui:registry_nav_provider", {}) end,
    settings = function()
        local definition, err = contract.get(ui_types.CONTRACT.SETTINGS)
        if err then return nil, err end
        local instance, open_err = definition:open()
        if open_err then return nil, open_err end
        return instance:get_namespace({namespace = ui_types.SETTINGS_NS})
    end,
}
