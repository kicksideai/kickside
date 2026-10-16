local json = require("json")
local M = {}
local epochs_schema = {type = "object", propertyNames = {minLength = 1},
    additionalProperties = {type = "integer", minimum = 0}}
local ids = {type = "array", items = {type = "string", minLength = 1}, uniqueItems = true}
local schema = {type = "object", required = {"policy_ids", "groups"}, additionalProperties = false,
    properties = {policy_ids = ids, groups = ids, epochs = epochs_schema}}
local failure = require("identity_failure")
local function refusal(message: string, cause: error?): error
    return failure(message, errors.PERMISSION_DENIED, "subject", false, cause)
end
local function validate(value, definition)
    local raw, encode_err = json.encode(value)
    if encode_err then return nil, refusal("authority encoding failed: " .. tostring(encode_err), encode_err) end
    local valid, validation_err = json.validate_string(definition, raw)
    if not valid then return nil, refusal("invalid authority: " .. tostring(validation_err), validation_err) end
    return true, nil
end
function M.decode(raw)
    if raw == nil then return nil, nil end
    if type(raw) ~= "string" then return nil, refusal("stored authority must be JSON text") end
    local valid, validation_err = json.validate_string(schema, raw)
    if not valid then return nil, refusal("invalid stored authority: " .. tostring(validation_err), validation_err) end
    local decoded, decode_err = json.decode(raw)
    if decode_err then return nil, refusal("authority decoding failed: " .. tostring(decode_err), decode_err) end
    return decoded, nil
end
function M.validate(snapshot) return validate(snapshot, schema) end
function M.check_epochs(captured, current, initial)
    for _, value in pairs({captured = captured, current = current, initial = initial}) do
        local valid, err = validate(value, epochs_schema)
        if not valid then return nil, err end
    end
    local expected = captured or initial
    if expected == nil then
        if current ~= nil then return nil, refusal("authority provider has no legacy baseline") end
        return true, nil
    end
    for key, value in pairs(expected) do
        if type(current) ~= "table" or current[key] ~= value then
            return nil, refusal("delegated authority is revoked")
        end
    end
    for key, value in pairs(initial or {}) do
        if expected[key] == nil and (type(current) ~= "table" or current[key] ~= value) then
            return nil, refusal("delegated authority is revoked")
        end
    end
    return true, nil
end
return M
