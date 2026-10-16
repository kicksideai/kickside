local json = require("json")
local persisted_json = require("persisted_json")
local M = {}
local id_array = { type = "array", items = { type = "string", minLength = 1 } }
local neutral_object = { anyOf = { { type = "object" }, { type = "array", maxItems = 0 } } }
local function optional(value: any): any
    return { anyOf = { value, { type = "null" } } }
end
local function policy_schema(unique_ids: boolean?): any
    local ids = { type = "array", items = { type = "string", minLength = 1 }, uniqueItems = unique_ids == true }
    return { anyOf = {
        { type = "object", properties = {
            allowed_tool_ids = optional(ids),
            allowed_trait_ids = optional(ids),
            default_active_trait_ids = optional(ids),
            agent_profile = optional(neutral_object),
            preset = optional({ type = "string" }),
            restrict_traits = optional({ type = "boolean" }),
        } },
        { type = "array", maxItems = 0 },
    } }
end
local schema = policy_schema(false)
local patch_schema = policy_schema(true)
local mint_schema = { anyOf = {
    { type = "object", properties = {
        whitelist_component_ids = optional(id_array),
        label = optional({ type = "string" }),
        policy = optional(schema),
        context = optional(neutral_object),
        expires_at = optional({ type = "number" }),
        oauth_resource = optional({ type = "string" }),
    } },
    { type = "array", maxItems = 0 },
} }
local function request_schema(unique_ids: boolean?): any
    local properties = policy_schema(unique_ids).anyOf[1].properties
    for name, field in pairs(mint_schema.anyOf[1].properties) do
        if name ~= "policy" and (not unique_ids or name == "label") then properties[name] = field end
    end
    properties.preset = optional({ type = "string" })
    return { anyOf = { { type = "object", properties = properties }, { type = "array", maxItems = 0 } } }
end
local request_schemas = {
    create = request_schema(false),
    patch = request_schema(true),
    consent = { type = "object", properties = { mint = optional(mint_schema) } },
}

local function validate(schema_value: any, value: any): (boolean?, any?)
    local encoded, encode_err = json.encode(value)
    if encode_err then return nil, encode_err end
    return json.validate_string(schema_value, encoded)
end

function M.validate(policy: any, unique_ids: boolean?): (boolean?, any?)
    return validate(unique_ids and patch_schema or schema, policy)
end

function M.validate_mint(args: any): (boolean?, any?)
    return validate(mint_schema, args)
end

function M.decode_request(raw: string, operation: string): (any?, string?)
    local valid, validation_err = json.validate_string(request_schemas[operation], raw)
    if not valid then return nil, "invalid request body: " .. tostring(validation_err) end
    local value, decode_err = json.decode(raw)
    if decode_err then return nil, "invalid request body: " .. tostring(decode_err) end
    return value, nil
end

function M.decode_whitelist(raw: any): (any?, string?)
    if type(raw) ~= "string" or raw == "" then return nil, "whitelist is missing" end
    local valid, validation_err = json.validate_string(id_array, raw)
    if not valid then return nil, "whitelist is invalid: " .. tostring(validation_err) end
    local value, decode_err = json.decode(raw)
    if decode_err then return nil, "whitelist is invalid: " .. tostring(decode_err) end
    return value, nil
end

function M.decode(raw: any): (any?, string?)
    local valid, validation_err
    if type(raw) == "string" then
        valid, validation_err = json.validate_string(schema, raw)
    else
        valid, validation_err = M.validate(raw)
    end
    if not valid then return nil, "stored credential policy is invalid: " .. tostring(validation_err) end
    local policy, decode_err = persisted_json.decode_table(raw, "kickside_mcp_credentials.policy_json")
    if decode_err then return nil, tostring(decode_err) end
    return policy, nil
end
return M
