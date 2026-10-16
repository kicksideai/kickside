local error_envelope = require("error_envelope")
local M = {}

function M.new(source: error): error
    local details: { [string]: any } = {}
    for key, value in pairs(source:details() or {}) do details[key] = value end
    details.cause = error_envelope.encode(source)
    return (errors.new({kind = source:kind(), message = source:message(),
        retryable = false, details = details}) :: error)
end

return M
