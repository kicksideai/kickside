-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local json = require("json")
local jobs = require("jobs")
local envelope = require("error_envelope")
local M = {}
local function invalid(message: string): error
    return errors.new({kind = errors.INVALID, retryable = false, message = message,
        details = {code = "performance_request_invalid"}})
end
local function context_error(): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "HTTP context is unavailable",
        details = {code = "http_context_unavailable"}})
end
local function respond(res: any, value: any, err: error?): ()
    res:set_content_type(http.CONTENT.JSON)
    if err then
        local statuses = {[errors.INVALID] = 400, [errors.PERMISSION_DENIED] = 403,
            [errors.NOT_FOUND] = 404, [errors.CONFLICT] = 409, [errors.ALREADY_EXISTS] = 409,
            [errors.UNAVAILABLE] = 503, [errors.TIMEOUT] = 504, [errors.RATE_LIMITED] = 429,
            [errors.CANCELED] = 408}
        local failure = envelope.encode(err)
        failure.success, failure.error = false, failure.message
        failure.details = failure.details or {}
        failure.retryable = failure.retryable == true
        failure.code = (failure.details or {}).code or ("performance_" .. string.lower(err:kind()))
        failure.committed = (value and value.committed == true) or (failure.details or {}).committed == true
        failure.fields = value and value.fields
        failure.revision = value and value.revision
        failure.pool = value and value.pool
        res:set_status(statuses[err:kind()] or 500)
        res:write_json(failure)
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json(value)
end
function M.get(): (any?, error?)
    local res, req = http.response(), http.request()
    if not res or not req then return nil, context_error() end
    local policy, err = jobs.get_policy()
    if err then respond(res, nil, err); return nil, nil end
    local pool, pool_err = jobs.get_pool_state()
    respond(res, {success = true, fields = policy.fields, revision = policy.revision, pool = pool}, pool_err)
    return nil, nil
end
function M.put(): (any?, error?)
    local res, req = http.response(), http.request()
    if not res or not req then return nil, context_error() end
    local raw, body_err = req:body()
    if body_err then respond(res, nil, body_err); return nil, nil end
    if type(raw) ~= "string" then respond(res, nil, invalid("A JSON policy update is required")); return nil, nil end
    local body, decode_err = json.decode(raw)
    if decode_err or type(body) ~= "table" then
        respond(res, nil, invalid("A JSON policy update is required")); return nil, nil
    end
    local result, err = jobs.set_policy_overrides(body.values, body.unset)
    respond(res, result and {success = true, fields = result.fields, revision = result.revision, committed = true}, err)
    return nil, nil
end
return M
