-- Discovery + coercion for kickside.settings:definition entries.
--
-- Definitions are the source of truth for the set of settings, their types, and
-- their defaults. They live in the registry (declared by each module), so the
-- DB never stores defaults — only admin overrides — and a default change in a
-- module upgrade propagates immediately.

local registry = require("registry")
local time = require("time")
local settings_types = require("settings_types")

local M = {}

-- All declarations keyed [namespace][key] -> Definition.
function M.all(): settings_types.DefinitionMap
    local entries, err = registry.find({ ["meta.type"] = settings_types.DEFINITION_TYPE })
    local by_ns: settings_types.DefinitionMap = {}
    if err or type(entries) ~= "table" then
        return by_ns
    end
    for _, entry in ipairs(entries) do
        local e = (entry :: { data: { [string]: any } }).data
        local ns = e.namespace
        local key = e.key
        if type(ns) == "string" and type(key) == "string" and settings_types.TYPES[e.value_type] then
            by_ns[ns :: string] = by_ns[ns :: string] or {}
            by_ns[ns :: string][key :: string] = {
                namespace = ns :: string,
                key = key :: string,
                value_type = e.value_type :: string,
                default = e.default,
                description = (e.description :: string?) or "",
                scope = (e.scope :: string?) or settings_types.SCOPE_GLOBAL,
                editable = e.editable ~= false,
                visible = e.visible ~= false,
                read_access = (type(e.read_access) == "string") and (e.read_access :: string) or nil,
                schema = e.schema,
                validate_func = (type(e.validate_func) == "string") and (e.validate_func :: string) or nil,
                title = (type(e.title) == "string" and (e.title :: string) ~= "") and (e.title :: string) or nil,
                category = (type(e.category) == "string" and (e.category :: string) ~= "") and (e.category :: string) or nil,
                owner = (type(e.owner) == "string" and (e.owner :: string) ~= "") and (e.owner :: string) or nil,
                order = tonumber(e.order),
                control = e.control,
                ui = (type(e.ui) == "string" and (e.ui :: string) ~= "") and (e.ui :: string) or nil,
            }
        end
    end
    return by_ns
end

-- Look up one declaration. Accepts any (callers pass values off an untyped
-- request/args table); non-string inputs simply miss.
function M.find(ns: any, key: any): settings_types.Definition?
    if type(ns) ~= "string" or type(key) ~= "string" then return nil end
    local n = M.all()[ns :: string]
    return n and n[key :: string] or nil
end

-- Validate + canonicalize a raw value against a declaration. Returns the typed
-- value or (nil, message).
function M.coerce(def: settings_types.Definition, value: any): (settings_types.SettingValue?, string?)
    local t = def.value_type
    if t == "string" or t == "secret" then
        if type(value) ~= "string" then return nil, "expected a string" end
        return value
    elseif t == "int" then
        local n = tonumber(value)
        if not n or n % 1 ~= 0 then return nil, "expected an integer" end
        return math.floor(n :: number)
    elseif t == "bool" then
        if type(value) ~= "boolean" then return nil, "expected a boolean" end
        return value
    elseif t == "duration" then
        if type(value) ~= "string" then return nil, "expected a duration string" end
        local parsed, perr = time.parse_duration(value :: string)
        if not parsed then return nil, "invalid duration: " .. tostring(perr) end
        return value
    elseif t == "json" then
        if type(value) ~= "table" then return nil, "expected an object or array" end
        return value
    end
    return nil, "unknown value_type " .. tostring(t)
end

return M
