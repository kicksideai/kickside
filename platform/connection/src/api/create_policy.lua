local M = {}

local function non_empty_string(value: any, field: string): (string?, string?)
    if type(value) ~= "string" or value == "" then
        return nil, field .. " is required"
    end
    return value, nil
end

function M.fields(body: any): (any?, string?)
    if type(body) ~= "table" then
        return nil, "invalid json"
    end

    local impl_id, impl_err = non_empty_string(body.impl_id, "impl_id")
    if impl_err then return nil, impl_err end
    local name, name_err = non_empty_string(body.name, "name")
    if name_err then return nil, name_err end

    local description = ""
    if body.description ~= nil then
        if type(body.description) ~= "string" then
            return nil, "description must be a string"
        end
        description = body.description
    end

    local private_context = body.private_context or {}
    if type(private_context) ~= "table" then
        return nil, "private_context must be a table"
    end

    -- A connection that cannot authenticate is not a connection, so it is tested
    -- before it is stored unless the caller explicitly opts out. The UI has always
    -- asked for this; defaulting to it means an API caller cannot quietly save a
    -- credential the product already knows is rejected.
    local validate = body.validate ~= false

    return {
        impl_id = impl_id,
        name = name,
        description = description,
        private_context = private_context,
        validate = validate,
    }, nil
end

function M.is_connection_binding(entry: any, contract_id: string): boolean
    if type(entry) ~= "table" then return false end
    if entry.kind ~= "contract.binding" then return false end
    local data = entry.data
    local contracts = data and (data :: any).contracts
    if type(contracts) ~= "table" then return false end
    for _, contract_def in ipairs(contracts) do
        if type(contract_def) == "table" and (contract_def :: any).contract == contract_id then
            return true
        end
    end
    return false
end

local function schema_fields(schema: any): (any?, string?)
    if type(schema) ~= "table" then return nil, nil end
    local fields = schema.fields
    if type(fields) ~= "table" then return nil, "credential_schema.fields must be a table" end
    return fields, nil
end

local function field_key(field: any): string?
    if type(field) ~= "table" then return nil end
    local key = field.key
    if type(key) ~= "string" or key == "" then return nil end
    return key
end

local function option_value(option: any): any
    if type(option) == "table" then
        return option.value
    end
    return option
end

local function conditional_required(field: any, private_context: any): boolean
    local rule = field.required_if
    if type(rule) ~= "table" then return false end
    local key = rule.key or rule.field
    if type(key) ~= "string" or key == "" then return false end
    return private_context[key] == rule.equals
end

local function validate_field_value(field: any, value: any, private_context: any): string?
    local key = field_key(field) or "field"
    local kind = type(field.type) == "string" and field.type or "text"
    local required = field.required == true or conditional_required(field, private_context)

    if value == nil then
        if required then return key .. " is required" end
        return nil
    end

    if kind == "checkbox" then
        if type(value) ~= "boolean" then return key .. " must be a boolean" end
        return nil
    end

    if type(value) ~= "string" then
        return key .. " must be a string"
    end
    if required and value == "" then
        return key .. " is required"
    end

    if kind == "select" and type(field.options) == "table" and #field.options > 0 then
        for _, option in ipairs(field.options) do
            if value == option_value(option) then return nil end
        end
        return key .. " must be one of the declared options"
    end

    return nil
end

function M.validate_private_context(entry: any, private_context: any): string?
    local schema = entry and entry.meta and entry.meta.credential_schema
    local fields, fields_err = schema_fields(schema)
    if fields_err then return fields_err end
    if not fields then return nil end

    if type(private_context) ~= "table" then
        return "private_context must be a table"
    end

    local allowed: { [string]: boolean } = {}
    for _, field in ipairs(fields) do
        local key = field_key(field)
        if not key then return "credential_schema field is missing key" end
        allowed[key] = true
        local err = validate_field_value(field, private_context[key], private_context)
        if err then return err end
    end

    for key, _ in pairs(private_context) do
        if type(key) ~= "string" or not allowed[key] then
            return "private_context contains undeclared field: " .. tostring(key)
        end
    end

    return nil
end

return M
