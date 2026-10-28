local test = require("test")
local contract = require("contract")
local json = require("json")
local registry = require("registry")
local security = require("security")
local funcs = require("funcs")
local ui_types = require("ui_types")

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

local SURFACE_FOREGROUNDS = {
    ["var(--p-surface-0)"] = {255, 255, 255},
    ["var(--p-surface-950)"] = {6, 7, 9},
}

local function hex_channels(value: string): { number }
    local hex = value:gsub("^#", "")
    return { tonumber(hex:sub(1, 2), 16) :: number, tonumber(hex:sub(3, 4), 16) :: number, tonumber(hex:sub(5, 6), 16) :: number }
end

local function css_value(variables: { [string]: any }, value: string): string
    if SURFACE_FOREGROUNDS[value] then return value end
    local name = value:match("^var%((%-%-[%w%-]+)%)$")
    if name then
        local resolved = variables[name]
        if type(resolved) ~= "string" then error("missing CSS variable " .. name) end
        return css_value(variables, resolved)
    end
    return value
end

local function mixed_role(variables: { [string]: any }, role: string): { number }
    local expression = css_value(variables, variables[role] :: string)
    local share, target = expression:match("^color%-mix%(in srgb, var%(%-%-p%-primary%) (%d+)%%, (%a+)%)$")
    if not share or (target ~= "black" and target ~= "white") then
        error("primary role must be an explicit color mix: " .. role)
    end
    local source = hex_channels(variables["--p-primary"] :: string)
    local target_channel = target == "white" and 255 or 0
    local primary_share = (tonumber(share) :: number) / 100
    return {
        math.floor(source[1] * primary_share + target_channel * (1 - primary_share) + 0.5),
        math.floor(source[2] * primary_share + target_channel * (1 - primary_share) + 0.5),
        math.floor(source[3] * primary_share + target_channel * (1 - primary_share) + 0.5),
    }
end

local function effective_scope(base: { [string]: any }, override: { [string]: any }): { [string]: any }
    local result: { [string]: any } = {}
    for key, value in pairs(base) do
        if type(key) == "string" and key:sub(1, 2) == "--" then result[key] = value end
    end
    for key, value in pairs(override) do result[key] = value end
    return result
end

local function assert_primary_role_contrast(variables: { [string]: any })
    local roles = {
        { background = "--p-primary-color", foreground = "--p-button-primary-color" },
        { background = "--p-primary-hover-color", foreground = "--p-button-primary-hover-color" },
        { background = "--p-primary-active-color", foreground = "--p-button-primary-active-color" },
    }
    for _, role in ipairs(roles) do
        local background = mixed_role(variables, role.background)
        local foreground = SURFACE_FOREGROUNDS[css_value(variables, variables[role.foreground] :: string)]
        test.not_nil(foreground)
        local background_luminance = ui_types.tone_rel_luminance(background[1], background[2], background[3])
        local foreground_luminance = ui_types.tone_rel_luminance(foreground[1], foreground[2], foreground[3])
        test.ok(ui_types.tone_contrast(background_luminance, foreground_luminance) >= 4.5)
    end
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
            assert_primary_role_contrast(decoded)
            test.eq(decoded["@light"]["--p-primary"], "#dbac0d")
            test.eq(decoded["@light"]["--p-primary-600"], "color-mix(in srgb, var(--p-primary) 88%, black)")
            test.eq(decoded["@light"]["--p-warn-500"], decoded["--p-warn-500"])
            test.eq(decoded["@dark"]["--p-primary"], "#dbac0d")
            test.eq(decoded["@dark"]["--p-primary-50"], "color-mix(in srgb, var(--p-primary) 22%, black)")
            test.eq(decoded["@dark"]["--p-primary-600"], "var(--color-for-brightening)")
            test.eq(decoded["@dark"]["--p-primary-950"], "color-mix(in srgb, var(--p-primary) 5%, white)")
            test.is_nil(decoded["@dark"]["--p-primary-500"])

            for _, color in ipairs({ "#2b6690", "#707070" }) do
                local set_result = settings:set({
                    namespace = "kickside.ui",
                    key = "primary_color",
                    value = color,
                })
                if set_result.success ~= true then error("settings set failed: " .. tostring(set_result.error)) end

                local role_overrides, role_resolve_err = inst:resolve({})
                test.is_nil(role_resolve_err)
                local role_vars, role_decode_err = json.decode((role_overrides :: any).css_variables)
                test.is_nil(role_decode_err)
                assert_primary_role_contrast(role_vars)
                assert_primary_role_contrast(role_vars["@light"])
                assert_primary_role_contrast(effective_scope(role_vars, role_vars["@dark"]))
            end

            local unset_result = settings:unset({ namespace = "kickside.ui", key = "primary_color" })
            if unset_result.success ~= true then error("settings unset failed: " .. tostring(unset_result.error)) end
            test.eq(unset_result.success, true)

            local defaults, defaults_err = inst:resolve({})
            test.is_nil(defaults_err)
            local defaults_css = type(defaults) == "table" and (defaults :: any).css_variables or ""
            test.eq(type(defaults_css), "string")
            local default_vars, default_decode_err = json.decode(defaults_css :: string)
            test.is_nil(default_decode_err)
            assert_primary_role_contrast(default_vars)
            assert_primary_role_contrast(default_vars["@light"])
            assert_primary_role_contrast(effective_scope(default_vars, default_vars["@dark"]))
            test.eq(default_vars["@light"]["--p-primary"], default_vars["--p-primary"])
            test.eq(default_vars["@light"]["--p-warn-500"], default_vars["--p-warn-500"])

            local original = assert(registry.get("wippy.facade:css_variables"))
            local legacy_variables = {
                ["--p-primary"] = "#22c55e",
                ["--color-for-brightening"] = "color-mix(in srgb, var(--p-primary) 70%, white)",
                ["--p-primary-600"] = "color-mix(in srgb, var(--p-primary) 88%, black)",
                ["--p-primary-700"] = "color-mix(in srgb, var(--p-primary) 72%, black)",
                ["--p-primary-800"] = "color-mix(in srgb, var(--p-primary) 55%, black)",
                ["--p-primary-color"] = "var(--p-primary-600)",
                ["--p-primary-hover-color"] = "var(--p-primary-700)",
                ["--p-primary-active-color"] = "var(--p-primary-800)",
                ["--p-primary-contrast-color"] = "#fff",
                ["--p-button-primary-color"] = "#fff",
                ["--p-button-primary-hover-color"] = "#fff",
                ["--p-button-primary-active-color"] = "#fff",
                ["@dark"] = {
                    ["--p-primary"] = "#22c55e",
                    ["--p-primary-600"] = "var(--color-for-brightening)",
                    ["--p-primary-700"] = "color-mix(in srgb, var(--p-primary) 45%, white)",
                    ["--p-primary-800"] = "color-mix(in srgb, var(--p-primary) 25%, white)",
                    ["--p-primary-contrast-color"] = "#fff",
                },
            }
            local changed = {}
            for key, value in pairs(original.data) do changed[key] = value end
            changed.default = assert(json.encode(legacy_variables))
            local update = assert(registry.snapshot()):changes()
            update:update({id = original.id, kind = original.kind, meta = original.meta, data = changed})
            test.is_nil(select(2, update:apply()))

            local legacy_overrides, legacy_err = inst:resolve({})
            local restore = assert(registry.snapshot()):changes()
            restore:update(original)
            test.is_nil(select(2, restore:apply()))
            test.is_nil(legacy_err)
            local legacy_vars, legacy_decode_err = json.decode((legacy_overrides :: any).css_variables)
            test.is_nil(legacy_decode_err)
            assert_primary_role_contrast(legacy_vars)
            assert_primary_role_contrast(effective_scope(legacy_vars, legacy_vars["@dark"]))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

return { run = function(options) return run_cases(options) end }
