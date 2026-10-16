local error_envelope = require("error_envelope")
local M = {}

local STATUS_BY_KIND: { [string]: integer } = {}
STATUS_BY_KIND[errors.INVALID] = 400
STATUS_BY_KIND[errors.PERMISSION_DENIED] = 403
STATUS_BY_KIND[errors.NOT_FOUND] = 404
STATUS_BY_KIND[errors.CONFLICT] = 409
STATUS_BY_KIND[errors.ALREADY_EXISTS] = 409
STATUS_BY_KIND[errors.UNAVAILABLE] = 503
STATUS_BY_KIND[errors.RATE_LIMITED] = 429
STATUS_BY_KIND[errors.TIMEOUT] = 504
STATUS_BY_KIND[errors.CANCELED] = 500
STATUS_BY_KIND[errors.INTERNAL] = 500
STATUS_BY_KIND[errors.UNKNOWN] = 500

function M.classify(err: any): (integer, { kind: string?, retryable: boolean?, details: any? })
    for kind, status in pairs(STATUS_BY_KIND) do
        if errors.is(err, kind) then
            return status, { kind = kind, retryable = err:retryable(), details = err:details() }
        end
    end
    return 500, {}
end

local STATUS_BY_CODE: { [string]: integer } = {
    bad_request = 400, not_found = 404, forbidden = 403, conflict = 409, server_error = 500,
}

function M.status(err: any, default_msg: string): (integer, string)
    local status, classification = M.classify(err)
    local message = tostring(err or default_msg)
    local kind = classification.kind
    if kind == errors.INVALID or kind == errors.PERMISSION_DENIED or kind == errors.NOT_FOUND
        or kind == errors.CONFLICT or kind == errors.ALREADY_EXISTS then
        return status, message
    end
    return STATUS_BY_CODE[message:lower()] or 500, message
end

function M.for_error(err: any): integer
    local status, classification = M.classify(err)
    local kind = classification.kind
    if kind == errors.INVALID or kind == errors.PERMISSION_DENIED or kind == errors.NOT_FOUND
        or kind == errors.CONFLICT then return status end
    return 500
end

function M.response(err: error | string): { [string]: any }
    local native = type(err) == "userdata" and (err :: error)
        or errors.new({kind = errors.UNKNOWN, message = err :: string})
    local payload = error_envelope.encode(native)
    payload.success, payload.error, payload.message = false, payload.message, nil
    return payload
end

return M
