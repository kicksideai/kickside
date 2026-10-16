local json = require("json")

local M = {}

type Map = { [string]: any }

local function decode(raw: any): (Map?, string?)
    if raw == nil then return nil, nil end
    if type(raw) == "table" then return raw :: Map, nil end
    if type(raw) ~= "string" or raw == "" then return nil, nil end
    local decoded, err = json.decode(raw :: string)
    if err then return nil, tostring(err) end
    if type(decoded) ~= "table" then return nil, "schema must decode to an object" end
    return decoded :: Map, nil
end

local function type_allows(schema_type: any, actual: string): boolean
    if schema_type == nil then return true end
    if type(schema_type) == "string" then return schema_type == actual end
    if type(schema_type) == "table" then
        for _, typ in ipairs(schema_type :: { any }) do
            if typ == actual then return true end
        end
    end
    return false
end

local function type_declares(schema_type: any, actual: string): boolean
    if schema_type == nil then return false end
    return type_allows(schema_type, actual)
end

local function kind(value: any): string
    if value == nil then return "null" end
    if type(value) == "table" then
        local max = 0
        local count = 0
        for k, _ in pairs(value :: Map) do
            if type(k) ~= "number" then return "object" end
            if k > max then max = k end
            count = count + 1
        end
        if max == count then return "array" end
        return "object"
    end
    if type(value) == "number" and value == math.floor(value) then return "integer" end
    return type(value)
end

local function kind_for_schema(value: any, schema_type: any): string
    local actual = kind(value)
    -- Empty tables are ambiguous in Lua. Prefer the declared JSON Schema shape when
    -- one exists, so `{}` validates as an object input for Start schemas.
    if actual == "array" and type(value) == "table" and next(value :: Map) == nil then
        if type_declares(schema_type, "object") then return "object" end
        if type_declares(schema_type, "array") then return "array" end
    end
    return actual
end

local validate_value: (any, any, string) -> string?

local function validate_enum(schema: Map, value: any, path: string): string?
    if type(schema.enum) ~= "table" then return nil end
    for _, option in ipairs(schema.enum :: { any }) do
        if value == option then return nil end
    end
    return path .. " must be one of the declared options"
end

local function validate_object(schema: Map, value: any, path: string): string?
    if type(value) ~= "table" then return path .. " must be an object" end
    if kind(value) ~= "object" and next(value :: Map) ~= nil then return path .. " must be an object" end
    local props = type(schema.properties) == "table" and (schema.properties :: Map) or {}
    if type(schema.required) == "table" then
        for _, raw_key in ipairs(schema.required :: { any }) do
            local key = tostring(raw_key or "")
            if key == "" then return "invalid schema: required entries must be strings" end
            if (value :: Map)[key] == nil then return path .. "." .. key .. " is required" end
        end
    end
    for key, prop_schema in pairs(props) do
        if (value :: Map)[key] ~= nil then
            local err = validate_value(prop_schema, (value :: Map)[key], path .. "." .. tostring(key))
            if err then return err end
        end
    end
    if schema.additionalProperties == false then
        for key, _ in pairs(value :: Map) do
            if props[key] == nil then return path .. "." .. tostring(key) .. " is not accepted" end
        end
    end
    return nil
end

validate_value = function(raw_schema: any, value: any, path: string): string?
    if type(raw_schema) ~= "table" then return nil end
    local schema = raw_schema :: Map
    local expected = schema.type
    local actual = kind_for_schema(value, expected)
    if expected ~= nil then
        local ok = type_allows(expected, actual)
        if not ok and actual == "integer" then ok = type_allows(expected, "number") end
        if not ok then return path .. " must be " .. tostring(type(expected) == "table" and "one of the declared types" or expected) end
    end
    if schema.const ~= nil and value ~= schema.const then return path .. " must match the declared const" end
    local enum_err = validate_enum(schema, value, path)
    if enum_err then return enum_err end
    if actual == "object" or type_declares(expected, "object") then
        local err = validate_object(schema, value, path)
        if err then return err end
    elseif actual == "array" or type_declares(expected, "array") then
        if actual ~= "array" then return path .. " must be an array" end
        if type(schema.items) == "table" then
            for idx, item in ipairs(value :: { any }) do
                local err = validate_value(schema.items, item, path .. "[" .. tostring(idx) .. "]")
                if err then return err end
            end
        end
    elseif type(value) == "string" then
        if type(schema.minLength) == "number" and #value < schema.minLength then
            return path .. " must be at least " .. tostring(schema.minLength) .. " characters"
        end
    elseif type(value) == "number" then
        if type(schema.minimum) == "number" and value < schema.minimum then return path .. " is below minimum" end
    end
    return nil
end

function M.validate(raw_schema: any, input: any, path: string?): string?
    local schema, derr = decode(raw_schema)
    if derr then return "invalid schema: " .. derr end
    if schema == nil then return nil end
    return validate_value(schema, input == nil and {} or input, path or "input")
end

function M.decode(raw_schema: any): (Map?, string?)
    return decode(raw_schema)
end

return M
