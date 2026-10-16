local http = require("http")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")

local M = {}
type Map = { [string]: any }

local function context_failure(cause: error?): error
    local details: Map = {code = "http_context_missing"}
    if cause then
        details.cause = error_envelope.encode(cause)
        return (errors.new({kind = cause:kind(), message = "no http context",
            retryable = cause:retryable(), details = details}) :: error)
    end
    return (errors.new({kind = errors.INTERNAL, message = "no http context",
        retryable = false, details = details}) :: error)
end

function M.context(): (any?, any?, error?)
    local res, response_err = http.response()
    if response_err or not res then return nil, nil, context_failure(response_err) end
    local req, request_err = http.request()
    if request_err or not req then return nil, nil, context_failure(request_err) end
    return res, req, nil
end

function M.invalid(message: string, field: string, cause: error?): error
    local details: Map = {code = "security_request_invalid", field = field}
    if cause then details.cause = error_envelope.encode(cause) end
    return (errors.new({kind = errors.INVALID, message = message, retryable = false, details = details}) :: error)
end

function M.denied(): error
    return (errors.new({kind = errors.PERMISSION_DENIED, message = "access denied", retryable = false}) :: error)
end

function M.prepare(res: any): error?
    local err = res:set_content_type(http.CONTENT.JSON)
    if err then return (errors.wrap(err, "HTTP response content type failed") :: error) end
    return nil
end

local function output_failure(source: error, message: string, committed: boolean?): error
    local err = errors.wrap(source, message) :: error
    if committed then return committed_error.new(err) end
    return err
end

function M.respond(res: any, status: number, payload: Map, committed: boolean?): (nil, error?)
    local status_err = res:set_status(status)
    if status_err then return nil, output_failure(status_err, "HTTP response status failed", committed) end
    local write_err = res:write_json(payload)
    if write_err then return nil, output_failure(write_err, "HTTP response JSON failed", committed) end
    return nil, nil
end

function M.write(res: any, status: number, err: error, extra: Map?, committed: boolean?): (nil, error?)
    if committed then err = committed_error.new(err) end
    local payload = error_envelope.encode(err)
    payload.success = false
    payload.error = tostring(err)
    for key, value in pairs(extra or {}) do payload[key] = value end
    return M.respond(res, status, payload, committed)
end

return M
