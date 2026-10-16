-- Strict decoder for JSON table values read from durable storage. A nullable
-- column may be SQL NULL; malformed non-null data is always an infrastructure
-- error, never an empty replacement value.
local json = require("json")
local error_envelope = require("error_envelope")

local M = {}

local function corrupt(field: string, reason: string, cause: error?): error
    local details: { [string]: any } = {
        code = "persisted_data", error_kind = "persisted_data", field = field,
    }
    if cause then details.cause = error_envelope.encode(cause) end
    return (errors.new({ message = "corrupt persisted JSON in " .. field .. ": " .. reason,
        kind = errors.INTERNAL, retryable = false,
        details = details }) :: error)
end

function M.decode_table(raw: any, field: string, nullable: boolean?): (table?, error?)
    if raw == nil then
        if nullable then return nil, nil end
        return nil, corrupt(field, "value is missing")
    end
    if type(raw) == "table" then return raw, nil end
    if type(raw) ~= "string" or raw == "" then
        return nil, corrupt(field, "value is not JSON text")
    end
    local value, decode_err = json.decode(raw)
    if decode_err or type(value) ~= "table" then
        return nil, corrupt(field, "value is not a JSON object or array: " .. tostring(decode_err), decode_err)
    end
    return value, nil
end

return M
