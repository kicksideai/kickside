local json = require("json")

local M = {}

-- Registry metadata accepts JSON-compatible tables and YAML block strings. Normalize
-- both forms at the discovery boundary so every consumer sees an actual schema object.
-- A malformed or scalar value is an absent schema, never a string leaking into clients.
function M.decode(raw: any): any
    if type(raw) == "table" then return raw end
    if type(raw) ~= "string" or raw == "" then return {} end

    local value, err = json.decode(raw)
    if err or type(value) ~= "table" then return {} end
    return value
end

return M
