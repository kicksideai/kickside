local http = require("http")
local errors = require("errors")
local trace = require("trace")

local M = {}

function M.normalize()
    local request = assert(http.request())
    local response = assert(http.response())
    local payload, body_err = request:body_json()
    if body_err then
        response:set_status(http.STATUS.BAD_REQUEST)
        response:set_content_type(http.CONTENT.JSON)
        response:write_json({
            success = false,
            error = "invalid request body",
            kind = errors.INVALID,
            retryable = false,
            details = { code = "trace_request_invalid" },
        })
        return
    end
    local context, err = trace.normalize(payload)
    if err then
        response:set_status(http.STATUS.BAD_REQUEST)
        response:set_content_type(http.CONTENT.JSON)
        response:write_json({
            success = false,
            error = err:message(),
            kind = err:kind(),
            retryable = err:retryable(),
            details = err:details(),
        })
        return
    end
    response:set_status(http.STATUS.OK)
    response:set_content_type(http.CONTENT.JSON)
    response:write_json({ success = true, trace_context = context })
end

return M
