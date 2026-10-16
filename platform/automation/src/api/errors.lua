local http = require("http")
local http_errors = require("http_errors")

local M = {}


local function text(value: any, fallback: string): string
    if type(value) == "string" and value ~= "" then return value end
    return fallback
end

function M.error(code: any, message: any): { code: string, message: string }
    local normalized_code = text(code, "internal_error")
    return {
        code = normalized_code,
        message = text(message, normalized_code),
    }
end



function M.status(err: any, fallback_code: string?, fallback_message: string?): (number, { code: string, message: string })
    local status, classification = http_errors.classify(err)
    local code = text(fallback_code, "internal_error")
    local message = text(fallback_message, "request failed")
    if classification.kind == errors.NOT_FOUND then
        code = "not_found"
    elseif classification.kind == errors.PERMISSION_DENIED then
        code = "access_denied"
    elseif classification.kind == errors.INVALID then
        code = "invalid_request"
    elseif classification.kind == errors.CONFLICT then
        code = "conflict"
    elseif classification.kind == errors.UNAVAILABLE then
        code = "unavailable"
    end
    if err ~= nil then
        message = tostring(err)
    end
    local payload: any = M.error(code, message)
    payload.retryable = classification.retryable
    payload.details = classification.details
    return status, payload
end

return M
