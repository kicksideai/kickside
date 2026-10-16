local test = require("test")
local contract = require("contract")
local json = require("json")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")

local RESOLVER_POLICIES = {
    "kickside.ui:facade_resolver_contract_access",
    "kickside.ui:public_branding_settings_contract",
    "kickside.ui:public_branding_settings_registry",
    "kickside.ui:public_branding_settings_cache",
    "kickside.ui:facade_resolver_static_read",
    "kickside.ui:facade_resolver_content_fs_read",
}

local function scope(): any
    local policies: { security.Policy } = {}
    for _, id in ipairs(RESOLVER_POLICIES) do
        local policy, err = security.policy(id)
        if not policy then error("policy " .. id .. ": " .. tostring(err)) end
        policies[#policies + 1] = policy
    end
    return security.new_scope(policies)
end

local function settings_admin(): any
    local policy, policy_err = security.policy("app:admin")
    if not policy then error("policy app:admin: " .. tostring(policy_err)) end

    local def, def_err = contract.get("kickside.settings:settings")
    if not def then error("settings contract: " .. tostring(def_err)) end

    local inst, open_err = def
        :with_actor(security.new_actor("app:ui_test_admin", {}))
        :with_scope(security.new_scope({ policy }))
        :open()
    if not inst then error("settings open: " .. tostring(open_err)) end
    return inst
end

local function has_policy(entry: any, id: string): boolean
    local policies = entry and entry.data and entry.data.security and entry.data.security.policies
    if type(policies) ~= "table" then return false end
    for _, p in ipairs(policies :: { any }) do
        if type(p) == "table" and p.id == id then return true end
        if p == id then return true end
    end
    return false
end

local function define_tests()
    test.describe("facade appearance color", function()
        test.it("grants the shell template read through the facade owner", function()
            local policy = assert(security.policy("wippy.facade:config_read_runtime"))
            test.eq(policy:evaluate(security.new_actor("wippy.facade:index_handler", {}),
                "template.get", "wippy.facade:templates"), "allow")
        end)
        test.it("returns a configured theme file failure instead of empty overrides", function()
            local original = assert(registry.get("wippy.facade:css_variables"))
            local changed = {}
            for key, value in pairs(original.data) do changed[key] = value end
            changed.default = "fs://missing-theme-source.json"
            local update = assert(registry.snapshot()):changes()
            update:update({id = original.id, kind = original.kind, meta = original.meta, data = changed})
            test.is_nil(select(2, update:apply()))
            local value, err = funcs.call("kickside.ui:facade_resolver", {})
            local restore = assert(registry.snapshot()):changes()
            restore:update(original)
            test.is_nil(select(2, restore:apply()))
            test.is_nil(value)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)

        test.it("wires resolver read policies onto facade config and CSS handlers", function()
            for _, handler_id in ipairs({ "wippy.facade:config_handler", "wippy.facade:css_vars_handler" }) do
                local entry, err = registry.get(handler_id)
                test.is_nil(err)
                test.not_nil(entry)
                for _, policy_id in ipairs(RESOLVER_POLICIES) do
                    test.ok(has_policy(entry, policy_id))
                end
            end
        end)

        test.it("returns css_variables for the configured kickside.ui primary_color", function()
            local settings = settings_admin()
            local set_result = settings:set({
                namespace = "kickside.ui",
                key = "primary_color",
                value = "#dbac0d",
            })
            if set_result.success ~= true then error("settings set failed: " .. tostring(set_result.error)) end
            test.eq(set_result.success, true)

            local def, def_err = contract.get("wippy.facade:resolver")
            test.is_nil(def_err)
            test.not_nil(def)

            local inst, open_err = def
                :with_actor(security.new_actor("wippy.facade:css_vars_handler", {}))
                :with_scope(scope())
                :open()
            test.is_nil(open_err)
            test.not_nil(inst)

            local overrides, resolve_err = inst:resolve({})
            test.is_nil(resolve_err)
            test.not_nil(overrides)

            local css_vars = overrides.css_variables
            test.eq(type(css_vars), "string")
            local decoded, decode_err = json.decode(css_vars)
            test.is_nil(decode_err)
            test.not_nil(decoded)
            test.eq(decoded["--p-primary"], "#dbac0d")
            test.eq(decoded["--color-for-brightening"], "color-mix(in srgb, var(--p-primary) 70%, white)")
            test.eq(decoded["--p-primary-200"], "color-mix(in srgb, var(--p-primary) 25%, white)")
            test.eq(decoded["--p-primary-400"], "var(--color-for-brightening)")
            test.eq(decoded["--p-primary-600"], "color-mix(in srgb, var(--p-primary) 88%, black)")
            test.is_nil(decoded["--p-primary-50"])
            test.is_nil(decoded["--p-primary-500"])
            test.eq(decoded["--p-primary-color"], "var(--p-primary-600)")
            test.eq(decoded["@light"]["--p-primary"], "#dbac0d")
            test.eq(decoded["@light"]["--p-primary-600"], "color-mix(in srgb, var(--p-primary) 88%, black)")
            test.eq(decoded["@light"]["--p-warn-500"], decoded["--p-warn-500"])
            test.eq(decoded["@dark"]["--p-primary"], "#dbac0d")
            test.eq(decoded["@dark"]["--p-primary-50"], "color-mix(in srgb, var(--p-primary) 22%, black)")
            test.eq(decoded["@dark"]["--p-primary-600"], "var(--color-for-brightening)")
            test.eq(decoded["@dark"]["--p-primary-950"], "color-mix(in srgb, var(--p-primary) 5%, white)")
            test.is_nil(decoded["@dark"]["--p-primary-500"])

            local unset_result = settings:unset({ namespace = "kickside.ui", key = "primary_color" })
            if unset_result.success ~= true then error("settings unset failed: " .. tostring(unset_result.error)) end
            test.eq(unset_result.success, true)

            local defaults, defaults_err = inst:resolve({})
            test.is_nil(defaults_err)
            local defaults_css = type(defaults) == "table" and (defaults :: any).css_variables or ""
            test.eq(type(defaults_css), "string")
            local default_vars, default_decode_err = json.decode(defaults_css :: string)
            test.is_nil(default_decode_err)
            test.eq(default_vars["@light"]["--p-primary"], default_vars["--p-primary"])
            test.eq(default_vars["@light"]["--p-warn-500"], default_vars["--p-warn-500"])
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
