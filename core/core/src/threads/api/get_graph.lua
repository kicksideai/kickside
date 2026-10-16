-- GET /threads/{id}/graph — the active graph edges touching {id} (either
-- endpoint), gated on READ of the thread. Query: ?limit. Response:
-- { success, thread_id, edges }.

local http = require("http")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
local contract = require("threads_contract")
local http_params = require("http_params")

local function handler(): ()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)

    local thread_id = req:param("id")
    if type(thread_id) ~= "string" or thread_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json(http_errors.response(errors.new({kind = errors.INVALID, retryable = false,
            message = "thread id is required", details = {code = "core_http_thread_id_required"}})))
        return
    end

    local limit, limit_err = http_params.query_int(req, "limit", nil, { min = 1, max = 1000 })
    if limit_err then
        http_params.bad_request(res, limit_err:message(), limit_err)
        return
    end

    local result, read_err = contract.list_edges({ thread_id = thread_id, limit = limit })
    if not read_err then
        result, read_err = error_envelope.binding(result, nil, nil, "Read get graph", "core_http_read_response")
    end
    if read_err then
        res:set_status((http_errors.classify(read_err :: error)))
        res:write_json(http_errors.response(read_err))
        return
    end

    res:write_json({ success = true, thread_id = thread_id, edges = (result :: any).edges })
end

return { handler = handler }
