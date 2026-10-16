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

local SETTINGS_CONTRACT = "kickside.settings:settings"
local SETTINGS_NS = "kickside.ui"
local PRIMARY_KEY = "primary_color"
local CSS_VARIABLES_REQUIREMENT = "wippy.facade:css_variables"
-- The fs.directory an fs://path / file://path css_variables value resolves against
-- (the app points content_fs at its static fs and configures css_variables as
-- "fs://css-variables.facade.json"). Mirrors the facade's own content_fs handling.
local CONTENT_FS_REQUIREMENT = "wippy.facade:content_fs"

local PRIMARY_VARIABLE = "--p-primary"

local function normalize_hex(value: string): string?
    local hex = value:gsub("%s", ""):gsub("^#", "")
    if #hex == 3 then
        hex = hex:sub(1, 1):rep(2) .. hex:sub(2, 2):rep(2) .. hex:sub(3, 3):rep(2)
    end
    if #hex ~= 6 then return nil end
    if not hex:match("^%x%x%x%x%x%x$") then return nil end
    return "#" .. hex:lower()
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
    if raw ~= "" then
        local base = normalize_hex(raw :: string)
        if not base then
            return nil, errors.new({kind = errors.INVALID, message = "primary_color must be a hexadecimal color"})
        end
        merged[PRIMARY_VARIABLE] = base
        light[PRIMARY_VARIABLE] = base
        local dark = merged["@dark"]
        if type(dark) == "table" then dark[PRIMARY_VARIABLE] = base end
    end
    local encoded, encode_err = json.encode(merged)
    if encode_err then return nil, encode_err end
    return {css_variables = encoded}, nil
end

return {resolve = resolve}
