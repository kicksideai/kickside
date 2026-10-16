local registry = require("registry")

local M = {}

function M.get(descriptor_id: string, key: string): string
    local entry, err = registry.get(descriptor_id)
    if err then error("Endpoint descriptor lookup failed: " .. tostring(err)) end
    if not entry then error("Endpoint descriptor is missing: " .. descriptor_id) end
    local values = entry.data and entry.data.endpoints
    local value = values and values[key]
    if type(value) ~= "string" or value == "" then
        error("Endpoint is missing: " .. descriptor_id .. "." .. key)
    end
    local authority = value:match("^https?://([^/%?#]+)") or value:match("^wss?://([^/%?#]+)")
    if not authority or authority:find("@", 1, true) or value:find("[%c%s]") then
        error("Endpoint URL is invalid: " .. descriptor_id .. "." .. key)
    end
    return value
end

return M
