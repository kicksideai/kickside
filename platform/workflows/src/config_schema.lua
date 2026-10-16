-- Canonical validator for registry-declared workflow-node configuration. The same
-- JSON-Schema subset drives AI assist, publish, launch, and the generic form; keeping
-- value enforcement here prevents those surfaces from drifting into separate dialects.
local json = require("json")

local M = {}
type Map = { [string]: any }

local MAX_DEPTH = 12
local SUPPORTED_KEYS: { [string]: boolean } = {
    type = true, properties = true, required = true, items = true,
    additionalProperties = true, enum = true, const = true,
    minimum = true, maximum = true, minLength = true, maxLength = true,
    minItems = true, maxItems = true,
    title = true, description = true, default = true, examples = true, format = true,
    picker = true, class = true, role = true, group = true, source = true, rows = true,
    writeOnly = true, readOnly = true, sensitive = true, kinds = true, empty_label = true,
}
local SUPPORTED_TYPES: { [string]: boolean } = {
    object = true, array = true, string = true, number = true, integer = true, boolean = true,
}

local function trim(value: string): string
    return value:gsub("^%s+", ""):gsub("%s+$", "")
end

local function decode(raw: any): any
    if type(raw) == "table" then return raw end
    if type(raw) ~= "string" or trim(raw) == "" then return nil end
    local decoded, err = json.decode(raw)
    if err or type(decoded) ~= "table" then return nil end
    return decoded
end

local function is_array(value: any): boolean
    if type(value) ~= "table" then return false end
    local count, max = 0, 0
    for key, _ in pairs(value :: Map) do
        if type(key) ~= "number" then return false end
        count = count + 1
        if key > max then max = key end
    end
    return count > 0 and max == count
end

local function schema_type(schema: Map): any
    local typ = schema.type
    if type(typ) == "table" then return (typ :: { any })[1] end
    return typ
end

local function value_type(value: any): string
    if type(value) == "table" then return is_array(value) and "array" or "object" end
    if type(value) == "number" and math.floor(value :: number) == value then return "integer" end
    return type(value)
end

local function check_type(value: any, expected: string, path: string): string?
    local actual = value_type(value)
    local valid = actual == expected or (expected == "number" and actual == "integer")
    -- An empty Lua table has no intrinsic JSON shape; honor the declared schema.
    if type(value) == "table" and next(value :: Map) == nil and (expected == "object" or expected == "array") then valid = true end
    if not valid then return path .. " must be " .. expected .. ", got " .. actual end
    return nil
end

local function same_json(left: any, right: any, depth: number): boolean
    if type(left) ~= type(right) then return false end
    if type(left) ~= "table" then return left == right end
    if depth > MAX_DEPTH then return false end
    for key, value in pairs(left :: Map) do
        if (right :: Map)[key] == nil or not same_json(value, (right :: Map)[key], depth + 1) then return false end
    end
    for key, _ in pairs(right :: Map) do if (left :: Map)[key] == nil then return false end end
    return true
end

local validate_value: (any, any, string, boolean, number, ((any) -> boolean)?) -> string?

validate_value = function(value: any, raw_schema: any, path: string, require_fields: boolean, depth: number, defer: ((any) -> boolean)?): string?
    if defer and defer(value) then return nil end
    if depth > MAX_DEPTH then return path .. " exceeds the supported nesting depth" end
    if type(raw_schema) ~= "table" then return nil end
    local schema = raw_schema :: Map
    local expected = schema_type(schema)
    if expected == nil then
        if schema.properties ~= nil or schema.required ~= nil or schema.additionalProperties ~= nil then expected = "object"
        elseif schema.items ~= nil or schema.minItems ~= nil or schema.maxItems ~= nil then expected = "array"
        elseif schema.minLength ~= nil or schema.maxLength ~= nil then expected = "string"
        elseif schema.minimum ~= nil or schema.maximum ~= nil then expected = "number" end
    end
    if type(expected) == "string" then
        local err = check_type(value, expected :: string, path)
        if err then return err end
    end

    if type(schema.enum) == "table" then
        local matched = false
        for _, allowed in ipairs(schema.enum :: { any }) do
            if same_json(value, allowed, 1) then matched = true; break end
        end
        if not matched then return path .. " must be one of the allowed values" end
    end
    if schema.const ~= nil and not same_json(value, schema.const, 1) then
        return path .. " must equal its declared constant"
    end

    if type(value) == "string" then
        if type(schema.minLength) == "number" and #value < (schema.minLength :: number) then
            return path .. " must contain at least " .. tostring(schema.minLength) .. " characters"
        end
        if type(schema.maxLength) == "number" and #value > (schema.maxLength :: number) then
            return path .. " must contain at most " .. tostring(schema.maxLength) .. " characters"
        end
    elseif type(value) == "number" then
        if type(schema.minimum) == "number" and value < (schema.minimum :: number) then
            return path .. " must be at least " .. tostring(schema.minimum)
        end
        if type(schema.maximum) == "number" and value > (schema.maximum :: number) then
            return path .. " must be at most " .. tostring(schema.maximum)
        end
    end

    if type(value) == "table" and (expected == "object" or type(schema.properties) == "table") then
        local object = value :: Map
        local properties = type(schema.properties) == "table" and (schema.properties :: Map) or {}
        if require_fields and type(schema.required) == "table" then
            for _, raw_key in ipairs(schema.required :: { any }) do
                local key = tostring(raw_key)
                if object[key] == nil then return path .. "." .. key .. " is required" end
            end
        end
        for key, child in pairs(object) do
            local child_schema = properties[tostring(key)]
            if child_schema ~= nil then
                local err = validate_value(child, child_schema, path .. "." .. tostring(key), require_fields, depth + 1, defer)
                if err then return err end
            elseif schema.additionalProperties == false then
                return path .. "." .. tostring(key) .. " is not declared"
            elseif type(schema.additionalProperties) == "table" then
                local err = validate_value(child, schema.additionalProperties, path .. "." .. tostring(key), require_fields, depth + 1, defer)
                if err then return err end
            end
        end
    elseif type(value) == "table" and expected == "array" then
        local count = #(value :: { any })
        if type(schema.minItems) == "number" and count < (schema.minItems :: number) then
            return path .. " must contain at least " .. tostring(schema.minItems) .. " items"
        end
        if type(schema.maxItems) == "number" and count > (schema.maxItems :: number) then
            return path .. " must contain at most " .. tostring(schema.maxItems) .. " items"
        end
        if type(schema.items) == "table" then
            for index, child in ipairs(value :: { any }) do
                local err = validate_value(child, schema.items, path .. "[" .. tostring(index) .. "]", require_fields, depth + 1, defer)
                if err then return err end
            end
        end
    end
    return nil
end

function M.validate(config: any, raw_schema: any, opts: any?): string?
    local schema = decode(raw_schema)
    if type(schema) ~= "table" or is_array(schema) then return "config_schema must be a JSON Schema object" end
    if type(config) ~= "table" or is_array(config) then return "config must be a JSON object" end
    local options = type(opts) == "table" and (opts :: Map) or {}
    local defer: ((any) -> boolean?)? = nil
    if type(options.defer) == "function" then
        defer = function(value: any): boolean return options.defer(value) == true end
    end
    return validate_value(config, schema, tostring(options.path or "config"), options.require_fields ~= false, 1, defer)
end

local function keyword_family(schema: Map): (string?, string?)
    local object = schema.properties ~= nil or schema.required ~= nil or schema.additionalProperties ~= nil
    local array = schema.items ~= nil or schema.minItems ~= nil or schema.maxItems ~= nil
    local string_value = schema.minLength ~= nil or schema.maxLength ~= nil
    local number = schema.minimum ~= nil or schema.maximum ~= nil
    local count = (object and 1 or 0) + (array and 1 or 0) + (string_value and 1 or 0) + (number and 1 or 0)
    if count > 1 then return nil, "mixes assertions for different value types" end
    if object then return "object", nil end
    if array then return "array", nil end
    if string_value then return "string", nil end
    if number then return "number", nil end
    return nil, nil
end

function M.validate_dialect(node: any, path: string?, depth: number?): string?
    local current_path = path or "config_schema"
    local level = depth or 1
    if type(node) ~= "table" or is_array(node) then return current_path .. " must be a schema object" end
    if level > MAX_DEPTH then return current_path .. " exceeds the supported nesting depth" end
    local schema = node :: Map
    for key, _ in pairs(schema) do
        if type(key) ~= "string" or not SUPPORTED_KEYS[key] then
            return current_path .. "." .. tostring(key) .. " is not supported by workflow configuration"
        end
    end
    if schema.type ~= nil and (type(schema.type) ~= "string" or not SUPPORTED_TYPES[tostring(schema.type)]) then
        return current_path .. ".type must be one supported scalar type"
    end
    local family, family_err = keyword_family(schema)
    if family_err then return current_path .. " " .. family_err end
    if family and type(schema.type) == "string" then
        local compatible = schema.type == family or (family == "number" and schema.type == "integer")
        if not compatible then return current_path .. " declares " .. tostring(schema.type) .. " but uses " .. family .. " assertions" end
    end
    for _, key in ipairs({ "minimum", "maximum" }) do
        if schema[key] ~= nil and type(schema[key]) ~= "number" then return current_path .. "." .. key .. " must be a number" end
    end
    for _, key in ipairs({ "minLength", "maxLength", "minItems", "maxItems" }) do
        local value = schema[key]
        if value ~= nil and (type(value) ~= "number" or value < 0 or math.floor(value :: number) ~= value) then
            return current_path .. "." .. key .. " must be a non-negative integer"
        end
    end
    for _, pair in ipairs({ { "minimum", "maximum" }, { "minLength", "maxLength" }, { "minItems", "maxItems" } }) do
        local low, high = schema[pair[1]], schema[pair[2]]
        if type(low) == "number" and type(high) == "number" and low > high then
            return current_path .. "." .. pair[1] .. " cannot exceed " .. pair[2]
        end
    end
    if schema.required ~= nil then
        if type(schema.required) ~= "table" or (next(schema.required :: Map) ~= nil and not is_array(schema.required)) then
            return current_path .. ".required must be an array of strings"
        end
        for _, key in ipairs(schema.required :: { any }) do
            if type(key) ~= "string" or key == "" then return current_path .. ".required entries must be non-empty strings" end
        end
    end
    if schema.enum ~= nil and (type(schema.enum) ~= "table" or (next(schema.enum :: Map) ~= nil and not is_array(schema.enum))) then
        return current_path .. ".enum must be an array"
    end
    if type(schema.properties) == "table" then
        if is_array(schema.properties) then return current_path .. ".properties must be an object" end
        for key, child in pairs(schema.properties :: Map) do
            local err = M.validate_dialect(child, current_path .. ".properties." .. tostring(key), level + 1)
            if err then return err end
        end
    elseif schema.properties ~= nil then return current_path .. ".properties must be an object" end
    if schema.items ~= nil then
        local err = M.validate_dialect(schema.items, current_path .. ".items", level + 1)
        if err then return err end
    end
    if type(schema.additionalProperties) == "table" then
        local err = M.validate_dialect(schema.additionalProperties, current_path .. ".additionalProperties", level + 1)
        if err then return err end
    elseif schema.additionalProperties ~= nil and type(schema.additionalProperties) ~= "boolean" then
        return current_path .. ".additionalProperties must be boolean or one schema object"
    end
    return nil
end

return M
