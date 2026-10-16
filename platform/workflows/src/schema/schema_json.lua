-- JSON Schema table helpers. The Wippy JSON encoder has to distinguish an empty
-- JSON object from an empty JSON array; JSON Schema maps such as `properties` must
-- stay `{}` when they have no keys.

local canonical_json = require("canonical_json")

local M = {}
type Map = { [string]: any }
local CONFIG_SCHEMA_KEYS = { "input_schema", "output_schema", "error_schema" }
local function empty_object(): Map
    return canonical_json.object({}) :: Map
end
M.empty_object = empty_object
M.normalize_schema = canonical_json.normalize_schema

function M.normalize_config_schemas(config: any): any
    if type(config) ~= "table" then return config end
    local out = empty_object()
    for key, value in pairs(config :: Map) do out[key] = value end
    for _, key in ipairs(CONFIG_SCHEMA_KEYS) do
        if type(out[key]) == "table" then out[key] = M.normalize_schema(out[key]) end
    end
    return out
end

function M.normalize_node_body_schemas(body: any): any
    if type(body) ~= "table" then return body end
    local out = empty_object()
    for key, value in pairs(body :: Map) do out[key] = value end
    if type(out.config) == "table" then out.config = M.normalize_config_schemas(out.config) end
    if type(out.input_schema) == "table" then out.input_schema = M.normalize_schema(out.input_schema) end
    if type(out.output_schema) == "table" then out.output_schema = M.normalize_schema(out.output_schema) end
    if type(out.config_schema) == "table" then out.config_schema = M.normalize_schema(out.config_schema) end
    return out
end

return M
