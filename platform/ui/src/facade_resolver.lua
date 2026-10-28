-- Facade view-config resolver (wippy.facade:resolver). Drives the facade
-- css_variables requirement from the runtime kickside.ui:primary_color setting so
-- an admin can retone the whole app from Appearance without editing YAML.
--
-- resolve() reads primary_color through the kickside.settings contract (memory
-- cached; no DB hit when warm). The static facade variable map declares KickSide's
-- intentional deviations from @wippy-fe/theme as color-mix() expressions over the
-- canonical --p-primary seed. The old dark-mode brightened output is retained as
-- --color-for-brightening instead of overloading the seed. This resolver only replaces
-- --p-primary and returns the full map required by the facade.

local contract = require("contract")
local registry = require("registry")
local json = require("json")
local fs = require("fs")
local theming_helpers = require("theming_helpers")
local ui_types = require("ui_types")

local SETTINGS_CONTRACT = "kickside.settings:settings"
local SETTINGS_NS = "kickside.ui"
local PRIMARY_KEY = "primary_color"
local CSS_VARIABLES_REQUIREMENT = "wippy.facade:css_variables"
-- The fs.directory an fs://path / file://path css_variables value resolves against
-- (the app points content_fs at its static fs and configures css_variables as
-- "fs://css-variables.facade.json"). Mirrors the facade's own content_fs handling.
local CONTENT_FS_REQUIREMENT = "wippy.facade:content_fs"

local PRIMARY_VARIABLE = "--p-primary"
local PRIMARY_CONTRAST_VARIABLE = "--p-primary-contrast-color"
local LIGHT_SURFACE_FOREGROUND = "var(--p-surface-0)"
local DARK_SURFACE_FOREGROUND = "var(--p-surface-950)"
local WHITE_LUMINANCE = ui_types.tone_rel_luminance(255, 255, 255)
local DARK_SURFACE_LUMINANCE = ui_types.tone_rel_luminance(6, 7, 9)

local function hex_channels(value: string): (number, number, number)
    return tonumber(value:sub(2, 3), 16) :: number,
        tonumber(value:sub(4, 5), 16) :: number,
        tonumber(value:sub(6, 7), 16) :: number
end

local function mixed_luminance(r: number, g: number, b: number, primary_share: number, target: number): number
    local target_share = 1 - primary_share
    return ui_types.tone_rel_luminance(
        math.floor(r * primary_share + target * target_share + 0.5),
        math.floor(g * primary_share + target * target_share + 0.5),
        math.floor(b * primary_share + target * target_share + 0.5)
    )
end

local function foreground_for_primary_role(r: number, g: number, b: number, primary_share: number, target: number): string
    local background = mixed_luminance(r, g, b, primary_share, target)
    local light_contrast = ui_types.tone_contrast(background, WHITE_LUMINANCE)
    local dark_contrast = ui_types.tone_contrast(background, DARK_SURFACE_LUMINANCE)
    if light_contrast >= dark_contrast then return LIGHT_SURFACE_FOREGROUND end
    return DARK_SURFACE_FOREGROUND
end

local function set_primary_palette(variables: { [string]: any }, r: number, g: number, b: number, dark: boolean)
    local target = dark and 255 or 0
    local base_share = dark and 0.70 or 0.88
    local hover_share = dark and 0.45 or 0.72
    local active_share = dark and 0.25 or 0.55
    variables[PRIMARY_CONTRAST_VARIABLE] = foreground_for_primary_role(r, g, b, base_share, target)
    variables["--p-button-primary-color"] = variables[PRIMARY_CONTRAST_VARIABLE]
    variables["--p-button-primary-hover-color"] = foreground_for_primary_role(r, g, b, hover_share, target)
    variables["--p-button-primary-active-color"] = foreground_for_primary_role(r, g, b, active_share, target)
end

local function normalize_hex(value: string): string?
    local hex = value:gsub("%s", ""):gsub("^#", "")
    if #hex == 3 then
        hex = hex:sub(1, 1):rep(2) .. hex:sub(2, 2):rep(2) .. hex:sub(3, 3):rep(2)
    end
    if #hex ~= 6 then return nil end
    if not hex:match("^%x%x%x%x%x%x$") then return nil end
    return "#" .. hex:lower()
end

local function normalized_primary(value: any): string?
    if type(value) ~= "string" then return nil end
    return normalize_hex(value)
end

local function static_css_variables(): (any?, any?)
    local entry, err = registry.get(CSS_VARIABLES_REQUIREMENT)
    if err then return nil, err end
    local raw = entry.data.default
    if type(raw) ~= "string" then
        return nil, errors.new({kind = errors.INVALID, message = "css_variables must be a string"})
    end
    if raw == "" then return {}, nil end
    local path = theming_helpers.file_ref_path(raw)
    if path then
        local content_entry, content_err = registry.get(CONTENT_FS_REQUIREMENT)
        if content_err then return nil, content_err end
        local file_sys, fs_err = fs.get(content_entry.data.default)
        if fs_err then return nil, fs_err end
        local content, read_err = file_sys:readfile(path)
        if read_err then return nil, read_err end
        raw = content
    end
    local decoded, decode_err = json.decode(raw)
    if decode_err then return nil, decode_err end
    if type(decoded) ~= "table" then
        return nil, errors.new({kind = errors.INVALID, message = "css_variables must contain a JSON object"})
    end
    return decoded, nil
end

local function read_primary_color(): (string?, any?)
    local def, err = contract.get(SETTINGS_CONTRACT)
    if err then return nil, err end
    local inst, open_err = def:open()
    if open_err then return nil, open_err end
    local result, read_err = inst:get_namespace({namespace = SETTINGS_NS})
    if read_err then return nil, read_err end
    if not result.success then return nil, result.error end
    local value = result.values.primary_color
    if value == nil then return "", nil end
    if type(value) ~= "string" then
        return nil, errors.new({kind = errors.INVALID, message = "primary_color must be a string"})
    end
    return value, nil
end

-- Build the explicit light scope required by the facade's three-state theme compiler.
-- Top-level variables are the application's light/default values, but the FE theme's
-- forced-light selector is more specific than :root. Mirroring the full default map into
-- @light makes the resolved config authoritative before the host mounts, and makes the
-- same values authoritative in variables.css on the standalone login page.
local function ensure_light_scope(merged: { [string]: any }): { [string]: any }
    local light: { [string]: any } = {}
    for key, value in pairs(merged) do
        if type(key) == "string" and key:sub(1, 2) == "--" and type(value) == "string" then
            light[key] = value
        end
    end

    -- Preserve any deliberate mode-specific light values from the static map.
    local existing = merged["@light"]
    if type(existing) == "table" then
        for key, value in pairs(existing :: { [string]: any }) do
            if type(key) == "string" and type(value) == "string" then light[key] = value end
        end
    end
    merged["@light"] = light
    return light
end

local function resolve(_input: any): (any?, any?)
    local merged, static_err = static_css_variables()
    if static_err then return nil, static_err end
    local light = ensure_light_scope(merged)
    local raw, color_err = read_primary_color()
    if color_err then return nil, color_err end
    local override = raw ~= "" and normalize_hex(raw :: string) or nil
    if raw ~= "" and not override then
        return nil, errors.new({kind = errors.INVALID, message = "primary_color must be a hexadecimal color"})
    end

    local function apply_palette(variables: { [string]: any }, fallback: string?, dark: boolean)
        local seed = override or normalized_primary(variables[PRIMARY_VARIABLE]) or fallback
        if not seed then return nil end
        local r, g, b = hex_channels(seed)
        if override then variables[PRIMARY_VARIABLE] = seed end
        set_primary_palette(variables, r, g, b, dark)
        return seed
    end

    local base_seed = apply_palette(merged, nil, false)
    apply_palette(light, base_seed, false)
    local dark = merged["@dark"]
    if type(dark) == "table" then apply_palette(dark, base_seed, true) end
    local encoded, encode_err = json.encode(merged)
    if encode_err then return nil, encode_err end
    return {css_variables = encoded}, nil
end

return {resolve = resolve}
