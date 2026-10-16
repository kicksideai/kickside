-- GET /threads/{id}/events — a thread's events, gated on READ. Query:
-- ?before&from_seq&to_seq&limit&ascending&event_type. Response: { success, events,
-- max_pruned_seq, next_seq, source_gap? }.

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

    local before, before_err = http_params.query_int(req, "before", nil, { min = 0 })
    if before_err then http_params.bad_request(res, before_err:message(), before_err); return end
    local from_seq, from_err = http_params.query_int(req, "from_seq", nil, { min = 0 })
    if from_err then http_params.bad_request(res, from_err:message(), from_err); return end
    local to_seq, to_err = http_params.query_int(req, "to_seq", nil, { min = 0 })
    if to_err then http_params.bad_request(res, to_err:message(), to_err); return end
    local limit, limit_err = http_params.query_int(req, "limit", nil, { min = 1, max = 1000 })
    if limit_err then http_params.bad_request(res, limit_err:message(), limit_err); return end
    local ascending, ascending_err = http_params.query_bool(req, "ascending", false)
    if ascending_err then http_params.bad_request(res, ascending_err:message(), ascending_err); return end

    local window: { [string]: any } = {
        before = before,
        from_seq = from_seq,
        to_seq = to_seq,
        limit = limit,
        ascending = ascending,
    }
    local event_type = req:query("event_type")
    if type(event_type) == "string" and event_type ~= "" then
        window.event_type = event_type
    end

    window.thread_id = thread_id
    local result, read_err = contract.list_events(window)
    if not read_err then
        result, read_err = error_envelope.binding(result, nil, nil, "Read list events", "core_http_read_response")
    end
    if read_err then
        res:set_status((http_errors.classify(read_err :: error)))
        res:write_json(http_errors.response(read_err))
        return
    end

    local page = result :: any
    res:write_json({
        success = true,
        events = page.events,
        max_pruned_seq = page.max_pruned_seq,
        next_seq = page.next_seq,
        source_gap = page.source_gap,
    })
end

return { handler = handler }
