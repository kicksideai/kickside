local errors = require("errors")

local M = {}

function M.require(http: any, needs_request: boolean): (any?, any?, error?)
    local response = http.response()
    local request = needs_request and http.request() or nil
    if not response or (needs_request and not request) then
        return nil, nil, (errors.new({
            kind = errors.INTERNAL,
            message = "no http context",
            retryable = false,
            details = { code = "HTTP_CONTEXT_UNAVAILABLE" },
        }) :: error)
    end
    return response, request, nil
end

return M
