local http = require("http")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
local http_params = require("http_params")
local history = require("threads_contract")

local function handler(): ()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)
    local limit, limit_err = http_params.query_int(req, "limit", 100, { min = 1, max = 500 })
    if limit_err then http_params.bad_request(res, limit_err:message(), limit_err); return end
    local filters: { [string]: string } = {}
    for _, key in ipairs({ "thread_id", "status", "job_type", "queue_tier" }) do
        local value = req:query(key)
        if type(value) == "string" and value ~= "" then filters[key] = value end
    end
    local result, read_err = history.list("jobs", filters, limit :: integer, req:query("cursor"))
    if not read_err then
        result, read_err = error_envelope.binding(result, nil, nil, "Read list jobs", "core_http_read_response")
    end
    if read_err then
        res:set_status((http_errors.classify(read_err :: error)))
        res:write_json(http_errors.response(read_err))
        return
    end
    res:write_json({ success = true, jobs = result.rows, count = result.count,
        has_more = result.has_more, cursor = result.cursor })
end
return { handler = handler }
