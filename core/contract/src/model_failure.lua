local error_envelope = require("error_envelope")
local M = {}

-- Kinds that describe the request to its own caller. A model dependency answers
-- in that vocabulary (missing model, rejected request, output that violates the
-- requested schema), so the caller of the dependent service must not receive them.
local REQUEST_KINDS = { errors.INVALID, errors.NOT_FOUND, errors.PERMISSION_DENIED, errors.CONFLICT, errors.ALREADY_EXISTS }

-- wrap(step, err) -> error. The failed model call of a service step as a typed
-- error that keeps the cause in its message. Request-addressing kinds become
-- UNAVAILABLE; every other kind and retry flag is the upstream's own.
function M.wrap(step: string, err: any): any
    local message = step .. " failed: " .. tostring(err)
    if type(err) ~= "userdata" then
        return errors.new({ kind = errors.INTERNAL, message = message })
    end
    local cause_kind = err:kind()
    local kind = cause_kind
    for _, request_kind in ipairs(REQUEST_KINDS) do
        if cause_kind == request_kind then kind = errors.UNAVAILABLE end
    end
    local source_details = err:details() or {}
    local details = {}
    for key, value in pairs(source_details) do details[key] = value end
    details.cause = error_envelope.encode(err :: error)
    details.step, details.cause_kind = step, cause_kind
    local retryable = false
    if kind == cause_kind then retryable = err:retryable() end
    return errors.new({
        kind = kind,
        message = message,
        retryable = retryable,
        details = details,
    })
end

return M
