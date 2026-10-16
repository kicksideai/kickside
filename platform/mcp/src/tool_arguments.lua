local json = require("json")

local M = {}

local function invalid(id: string, cause: any): error
    return (errors.new({ message = "invalid arguments for " .. id .. ": " .. tostring(cause),
        kind = errors.INVALID }) :: error)
end

function M.validate(id: string, schema: any, arguments: any, original: string?, path: { string }?): error?
    -- Isolate local schema references from the RPC envelope's resource root.
    local resource = {}
    for key, value in pairs(schema) do resource[key] = value end
    if resource["$id"] == nil then resource["$id"] = "urn:kickside:mcp:tool-arguments" end
    local reference = { ["$ref"] = "#/$defs/argument" }
    local normalized = { ["$defs"] = { argument = resource }, ["$ref"] = "#/$defs/argument" }
    local encoded, encode_err = json.encode(arguments)
    if encode_err then return invalid(id, encode_err) end
    local valid, validation_err = json.validate_string(normalized, encoded)
    if not valid then return invalid(id, validation_err) end
    if original ~= nil and path ~= nil then
        local projection: any = reference
        for index = #path, 1, -1 do
            projection = { type = "object", properties = { [path[index]] = projection } }
        end
        projection["$defs"] = { argument = resource }
        valid, validation_err = json.validate_string(projection, original)
        if not valid then return invalid(id, validation_err) end
    end
    return nil
end

return M
