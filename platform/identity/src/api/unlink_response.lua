-- Shapes the unlink result for HTTP without discarding typed cleanup evidence.
local http = require("http")
local http_errors = require("http_errors")
local link_service = require("link_service")

local M = {}

local function status_code(value: number): integer
    local status = math.tointeger(value)
    if status == nil then error("HTTP status code must be an integer") end
    return status
end

function M.response_for(user_id: string, provider: string, external_id: string, service: any?): (integer, any)
    local selected = service or link_service
    local ok, err, discarded = selected.unlink(user_id, provider, external_id)
    if ok then return status_code(http.STATUS.OK), { success = true, discarded = discarded } end
    local status, classification = http_errors.classify(err)
    local details = classification.details
    return status, { success = false, error = tostring(err), kind = classification.kind,
        retryable = classification.retryable, details = details,
        discarded = type(details) == "table" and details.discarded or nil }
end

return M
