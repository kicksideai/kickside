-- Discovery + coercion for kickside.users.profile:definition entries.
--
-- Definitions are the source of truth for the set of profile fields, their
-- types, defaults, and visibility. They live in the registry (declared by each
-- module), so the DB never stores defaults — only per-user values — and a
-- default change in a module upgrade propagates immediately.

local registry = require("registry")
local time = require("time")
local json = require("json")
local profile_types = require("profile_types")

local M = {}

-- All declarations keyed [namespace][key] -> Definition.
function M.all(): profile_types.DefinitionMap
    local entries, err = registry.find({ ["meta.type"] = profile_types.DEFINITION_TYPE })
    local by_ns: profile_types.DefinitionMap = {}
    if err or type(entries) ~= "table" then
        return by_ns
    end
    for _, entry in ipairs(entries) do
        local raw = entry :: { [string]: any }
        -- Custom fields on a registry.entry live under .data; meta/id sit alongside.
        local e = (type(raw.data) == "table") and (raw.data :: { [string]: any }) or raw
        local ns = e.namespace
        local key = e.key
        if type(ns) == "string" and type(key) == "string" and profile_types.TYPES[e.value_type] then
            local visibility = (type(e.visibility) == "string" and profile_types.VISIBILITY[e.visibility])
                and (e.visibility :: string) or profile_types.VISIBILITY_SELF
            by_ns[ns :: string] = by_ns[ns :: string] or {}
            by_ns[ns :: string][key :: string] = {
                namespace = ns :: string,
                key = key :: string,
                value_type = e.value_type :: string,
                default = e.default,
                description = (e.description :: string?) or "",
                editable = e.editable ~= false,
                visible = e.visible ~= false,
                visibility = visibility,
                schema = e.schema,
                validate_func = (type(e.validate_func) == "string") and (e.validate_func :: string) or nil,
            }
        end
    end
    return by_ns
end

-- Look up one declaration. Accepts any (callers pass values off an untyped
-- request/args table); non-string inputs simply miss.
function M.find(ns: any, key: any): profile_types.Definition?
    if type(ns) ~= "string" or type(key) ~= "string" then return nil end
    local n = M.all()[ns :: string]
    return n and n[key :: string] or nil
end

local function check_schema(schema: any, value: any): string?
    if type(schema) ~= "table" then return nil end
    local s = schema :: { [string]: any }

    -- Profile declarations intentionally support a small, deterministic subset
    -- of JSON Schema. Unknown constraints fail closed so a future declaration is
    -- never presented as enforced while being silently ignored.
    local supported = {
        type = true, maxLength = true, minLength = true,
        minimum = true, maximum = true, enum = true,
    }
    for key in pairs(s) do
        if not supported[key] then
            return "unsupported declared schema constraint: " .. tostring(key)
        end
    end

    if s.type ~= nil and type(s.type) ~= "string" then
        return "declared schema type must be a string"
    end
    for _, key in ipairs({ "maxLength", "minLength", "minimum", "maximum" }) do
        if s[key] ~= nil and type(s[key]) ~= "number" then
            return "declared schema " .. key .. " must be a number"
        end
    end
    if s.enum ~= nil and type(s.enum) ~= "table" then
        return "declared schema enum must be an array"
    end

    if type(s.type) == "string" then
        local actual = type(value)
        if actual == "number" and s.type == "integer" and value % 1 == 0 then
            actual = "integer"
        end
        if actual == "table" then
            local encoded, encode_err = json.encode(value)
            if encode_err or type(encoded) ~= "string" then
                return "value is not valid JSON"
            end
            actual = encoded:sub(1, 1) == "[" and "array" or "object"
        end
        if actual ~= s.type then return "value does not match the declared schema type" end
    end

    if type(value) == "string" then
        local v = value :: string
        if type(s.maxLength) == "number" and #v > (s.maxLength :: number) then
            return "value exceeds the declared maximum length of " .. tostring(s.maxLength)
        end
        if type(s.minLength) == "number" and #v < (s.minLength :: number) then
            return "value is shorter than the declared minimum length of " .. tostring(s.minLength)
        end
    end

    if type(value) == "number" then
        local n = value :: number
        if type(s.minimum) == "number" and n < (s.minimum :: number) then
            return "value is below the declared minimum of " .. tostring(s.minimum)
        end
        if type(s.maximum) == "number" and n > (s.maximum :: number) then
            return "value is above the declared maximum of " .. tostring(s.maximum)
        end
    end

    if type(s.enum) == "table" then
        local allowed = false
        for _, candidate in ipairs(s.enum :: { any }) do
            if candidate == value then allowed = true end
        end
        if not allowed then return "value is not one of the declared options" end
    end

    return nil
end

-- Fields whose value is published for other surfaces to render as a link or fetch.
-- A bare string field here would accept javascript: and data: URIs, which is an XSS
-- in any consumer that puts it in an href and an SSRF vector in one that fetches it.
-- This module has no such sink itself; the value is explicitly advertised for others.
local function check_url(def: profile_types.Definition, value: any): string?
    if def.namespace ~= "kickside.profile" or def.key ~= "avatar_url" then return nil end
    if type(value) ~= "string" then return nil end
    local v = value :: string
    if v == "" then return nil end
    local scheme = v:match("^(%a[%w+.-]*):")
    if not scheme then return "avatar URL must be an absolute http(s) URL" end
    local lower = scheme:lower()
    if lower ~= "http" and lower ~= "https" then
        return "avatar URL scheme must be http or https"
    end
    return nil
end

-- Validate + canonicalize a raw value against a declaration. Returns the typed
-- value or (nil, message).
function M.coerce(def: profile_types.Definition, value: any): (profile_types.ProfileValue?, string?)
    local t = def.value_type
    if t == "string" then
        if type(value) ~= "string" then return nil, "expected a string" end
        local serr = check_schema(def.schema, value)
        if serr then return nil, serr end
        local uerr = check_url(def, value)
        if uerr then return nil, uerr end
        return value
    elseif t == "int" then
        local n = tonumber(value)
        if not n or n % 1 ~= 0 then return nil, "expected an integer" end
        local floored = math.floor(n :: number)
        local serr = check_schema(def.schema, floored)
        if serr then return nil, serr end
        return floored
    elseif t == "bool" then
        if type(value) ~= "boolean" then return nil, "expected a boolean" end
        local serr = check_schema(def.schema, value)
        if serr then return nil, serr end
        return value
    elseif t == "duration" then
        if type(value) ~= "string" then return nil, "expected a duration string" end
        local parsed, perr = time.parse_duration(value :: string)
        if not parsed then return nil, "invalid duration: " .. tostring(perr) end
        local serr = check_schema(def.schema, value)
        if serr then return nil, serr end
        return value
    elseif t == "json" then
        if type(value) ~= "table" then return nil, "expected an object or array" end
        local serr = check_schema(def.schema, value)
        if serr then return nil, serr end
        return value
    end
    return nil, "unknown value_type " .. tostring(t)
end

return M
