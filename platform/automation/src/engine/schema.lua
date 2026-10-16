-- Declared schema validation of the automation engine: a type's public-state
-- schema (field shape, values, read projection) and its install-input schema.
-- Pure: no store or registry access.

local json = require("json")

local P = {}

type Map = { [string]: any }

local function public_schema_fields(schema: any): (any?, error?)
    if schema == nil then return nil, nil end
    if type(schema) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "public_state_schema must be a table" }) end
    local fields = (schema :: Map).fields
    if type(fields) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "public_state_schema.fields must be a table" }) end
    return fields, nil
end

local function field_key(field: any): string?
    if type(field) ~= "table" then return nil end
    local key = (field :: Map).key
    if type(key) ~= "string" or key == "" then return nil end
    return key
end

local function option_value(option: any): any
    if type(option) == "table" then return (option :: Map).value end
    return option
end

local function conditional_required(field: any, public_state: any): boolean
    local rule = (field :: Map).required_if
    if type(rule) ~= "table" then return false end
    local key = (rule :: Map).key
    if type(key) ~= "string" or key == "" then return false end
    return type(public_state) == "table" and (public_state :: Map)[key] == (rule :: Map).equals
end

local function validate_public_field_value(field: any, value: any, public_state: any): error?
    local key = field_key(field) or "field"
    local kind = type((field :: Map).type) == "string" and (field :: Map).type or "text"
    local required = (field :: Map).required == true or conditional_required(field, public_state)

    if value == nil then
        if required then return errors.new({ kind = errors.INVALID, message = key .. " is required" }) end
        return nil
    end

    if kind == "checkbox" or kind == "boolean" then
        if type(value) ~= "boolean" then return errors.new({ kind = errors.INVALID, message = key .. " must be a boolean" }) end
        return nil
    end
    if kind == "number" then
        if type(value) ~= "number" then return errors.new({ kind = errors.INVALID, message = key .. " must be a number" }) end
        return nil
    end
    if kind == "integer" then
        if type(value) ~= "number" or value ~= math.floor(value) then return errors.new({ kind = errors.INVALID, message = key .. " must be an integer" }) end
        return nil
    end
    if kind == "object" then
        if type(value) ~= "table" then return errors.new({ kind = errors.INVALID, message = key .. " must be an object" }) end
        return nil
    end
    if kind == "array" then
        if type(value) ~= "table" then return errors.new({ kind = errors.INVALID, message = key .. " must be an array" }) end
        return nil
    end

    if type(value) ~= "string" then return errors.new({ kind = errors.INVALID, message = key .. " must be a string" }) end
    if required and value == "" then return errors.new({ kind = errors.INVALID, message = key .. " is required" }) end

    if kind == "select" and type((field :: Map).options) == "table" and #((field :: Map).options :: { any }) > 0 then
        for _, option in ipairs(((field :: Map).options :: { any })) do
            if value == option_value(option) then return nil end
        end
        return errors.new({ kind = errors.INVALID, message = key .. " must be one of the declared options" })
    end
    return nil
end

local function public_state_field_map(schema: any): ({ [string]: any }?, error?)
    local fields, fields_err = public_schema_fields(schema)
    if fields_err then return nil, fields_err end
    if not fields then return nil, nil end

    local allowed: { [string]: any } = {}
    for _, field in ipairs(fields :: { any }) do
        local key = field_key(field)
        if not key then return nil, errors.new({ kind = errors.INTERNAL, message = "public_state_schema field is missing key" }) end
        allowed[key] = field
    end
    return allowed, nil
end

local function validate_public_state(schema: any, public_state: any): error?
    if public_state == nil then return nil end
    if type(public_state) ~= "table" then return errors.new({ kind = errors.INVALID, message = "public_state must be a table" }) end

    local allowed, fields_err = public_state_field_map(schema)
    if fields_err then return fields_err end
    if not allowed then
        if next(public_state :: Map) ~= nil then
            return errors.new({ kind = errors.INVALID, message = "public_state requires meta.public_state_schema" })
        end
        return nil
    end

    for key, field in pairs(allowed) do
        local err = validate_public_field_value(field, (public_state :: Map)[key], public_state)
        if err then return err end
    end
    for key, _ in pairs(public_state :: Map) do
        if type(key) ~= "string" or allowed[key] == nil then
            return errors.new({ kind = errors.INVALID, message = "public_state contains undeclared field: " .. tostring(key) })
        end
    end
    return nil
end

local function coerce_public_field_read_value(field: any, value: any): (any, error?)
    if value == nil then return nil, nil end
    local key = field_key(field) or "field"
    local kind = type((field :: Map).type) == "string" and (field :: Map).type or "text"

    if kind == "checkbox" or kind == "boolean" then
        if type(value) == "boolean" then return value, nil end
        if type(value) == "string" then
            local lowered = value:lower()
            if lowered == "true" then return true, nil end
            if lowered == "false" then return false, nil end
        end
        return nil, errors.new({ kind = errors.INVALID, message = key .. " must be a boolean" })
    end

    if kind == "number" or kind == "integer" then
        local n: number? = nil
        if type(value) == "number" then
            n = value
        elseif type(value) == "string" then
            n = tonumber(value)
        end
        if n == nil then return nil, errors.new({ kind = errors.INVALID, message = key .. " must be a " .. kind }) end
        if kind == "integer" and n ~= math.floor(n) then return nil, errors.new({ kind = errors.INVALID, message = key .. " must be an integer" }) end
        return n, nil
    end

    if kind == "object" or kind == "array" then
        if type(value) == "table" then return value, nil end
        if type(value) == "string" then
            local decoded, derr = json.decode(value)
            if derr == nil and type(decoded) == "table" then return decoded, nil end
        end
        return nil, errors.new({ kind = errors.INVALID, message = key .. " must be an " .. kind })
    end

    return value, nil
end

local function project_public_state(schema: any, public_state: any): (Map?, error?)
    if public_state == nil then return {}, nil end
    if type(public_state) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "public_state must be a table" }) end

    local allowed, fields_err = public_state_field_map(schema)
    if fields_err then return nil, fields_err end
    if not allowed then return {}, nil end

    local out: Map = {}
    for key, field in pairs(allowed) do
        local value = (public_state :: Map)[key]
        if value ~= nil then
            local coerced, cerr = coerce_public_field_read_value(field, value)
            if cerr then return nil, cerr end
            out[key] = coerced
        end
    end
    local err = validate_public_state(schema, out)
    if err then return nil, err end
    return out, nil
end

local function json_schema_type(schema: any): string?
    if type(schema) ~= "table" then return nil end
    local kind = (schema :: Map).type
    if type(kind) == "string" then return kind end
    return nil
end

local function input_error(message: string, field: string, definition: boolean?): error
    return errors.new({kind = errors.INVALID, retryable = false,
        message = (definition and "invalid input schema: " or "invalid input: ") .. message,
        details = {code = definition and "automation_input_schema_invalid" or "automation_input_invalid",
            field = field, error_kind = "declaration"}})
end

local validate_input_object: (any, any, string) -> error?

-- validate_input_value enforces one declared field schema on one value: the
-- declared type, bounds, const and enum options, and — for an object
-- schema that declares properties — the nested object shape. Untyped schemas
-- enforce const and enum while leaving other composites unconstrained.
local function validate_input_value(key: string, field: any, value: any): error?
    if value == nil then
        if type(field) == "table" and field.required == true then return input_error(key .. " is required", key) end
        return nil
    end
    local kind = json_schema_type(field)
    if kind == "boolean" then
        if type(value) ~= "boolean" then return input_error(key .. " must be a boolean", key) end
    elseif kind == "number" then
        if type(value) ~= "number" then return input_error(key .. " must be a number", key) end
    elseif kind == "integer" then
        if type(value) ~= "number" or value ~= math.floor(value) then return input_error(key .. " must be an integer", key) end
    elseif kind == "object" then
        if type(value) ~= "table" then return input_error(key .. " must be an object", key) end
        local nested = validate_input_object(field, value, key .. ".")
        if nested then return nested end
    elseif kind == "array" then
        if type(value) ~= "table" then return input_error(key .. " must be an array", key) end
    elseif kind ~= nil then
        if type(value) ~= "string" then return input_error(key .. " must be a string", key) end
        local min_length = (field :: Map).minLength
        if type(min_length) == "number" and #value < min_length then
            return input_error(key .. " must be at least " .. tostring(min_length) .. " characters", key)
        end
    end

    if (field :: Map).const ~= nil and value ~= (field :: Map).const then
        return input_error(key .. " must match the declared const", key)
    end
    if type(value) == "number" then
        if value ~= value or value == math.huge or value == -math.huge then
            return input_error(key .. " must be finite", key)
        end
        local minimum = (field :: Map).minimum
        if type(minimum) == "number" and value < minimum then return input_error(key .. " is below minimum " .. tostring(minimum), key) end
    end

    local enum = (field :: Map).enum
    if type(enum) == "table" and #enum > 0 then
        for _, option in ipairs(enum :: { any }) do
            if value == option then return nil end
        end
        return input_error(key .. " must be one of the declared options", key)
    end
    return nil
end

-- validate_input_object walks one object schema level: required keys must be
-- present and non-empty, every declared property validates recursively, and a
-- key outside `properties` is rejected unless the schema opts out via
-- additionalProperties: true. A schema without `properties` is free-form.
-- `path` is the dotted prefix for error messages ("" at the top level).
validate_input_object = function(schema: any, input: any, path: string): error?
    local props = (schema :: Map).properties
    if type(props) ~= "table" then return nil end

    local required = (schema :: Map).required
    if type(required) == "table" then
        for _, key in ipairs(required :: { any }) do
            if type(key) ~= "string" or key == "" then
                return input_error("required entries must be strings", path .. "required", true)
            end
            local value = (input :: Map)[key]
            if value == nil or value == "" then return input_error(path .. key .. " is required", path .. key) end
        end
    end

    for key, field in pairs(props :: Map) do
        if type(key) ~= "string" or key == "" then
            return input_error("property keys must be strings", path .. "properties", true)
        end
        local err = validate_input_value(path .. key, field, (input :: Map)[key])
        if err then return err end
    end

    if (schema :: Map).additionalProperties ~= true then
        for key, _ in pairs(input :: Map) do
            if type(key) ~= "string" or (props :: Map)[key] == nil then
                return input_error("contains undeclared field: " .. path .. tostring(key), path .. tostring(key))
            end
        end
    end
    return nil
end

local function validate_install_input(schema: any, input: any): error?
    if schema == nil then return nil end
    if type(schema) ~= "table" then return input_error("inputs must be a table", "inputs", true) end
    if input == nil then input = {} end
    if type(input) ~= "table" then return input_error("input must be an object", "input") end
    return validate_input_object(schema, input, "")
end

P.field_key = field_key
P.project_public_state = project_public_state
P.public_state_field_map = public_state_field_map
P.validate_install_input = validate_install_input
-- A port config schema is a map of form fields. Its required flags and nested
-- JSON Schema properties are enforced by the same validator as install inputs.
function P.validate_port_config(fields: any, config: any): error?
    if fields == nil then return validate_install_input({ type = "object" }, config) end
    if type(fields) ~= "table" then return input_error("config_schema must be a table", "config_schema", true) end
    return validate_install_input({ type = "object", properties = fields }, config)
end
P.validate_public_field_value = validate_public_field_value
P.validate_public_state = validate_public_state

return P
