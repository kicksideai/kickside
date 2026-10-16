-- POST /threads/{id}/events/batch — ingest a batch of events idempotently. Body:
-- { events: [ { type?, role?, body?, seq?, content?, external?, created_at? } ] }.
-- Each event body is serialized to body_json. Response: { success, inserted,
-- duplicates, max_seq }.

local http = require("http")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
local json = require("json")
local contract = require("threads_contract")



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

    local raw = req:body()
    if type(raw) ~= "string" or raw == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json(http_errors.response(errors.new({kind = errors.INVALID, retryable = false,
            message = "request body is required", details = {code = "core_http_body_required"}})))
        return
    end
    local data, decode_err = json.decode(raw)
    if decode_err or type(data) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid JSON" })
        return
    end
    local in_events = (data :: any).events
    if type(in_events) ~= "table" or #in_events == 0 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json(http_errors.response(errors.new({kind = errors.INVALID, retryable = false,
            message = "events array is required", details = {code = "core_http_events_required"}})))
        return
    end

    local events: { table } = {}
    for index, raw_event in ipairs(in_events :: { table }) do
        if type(raw_event) ~= "table" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json(http_errors.response(errors.new({kind = errors.INVALID, retryable = false,
                message = "events[" .. tostring(index) .. "] must be an object",
                details = {code = "core_http_event_object_required", index = index}})))
            return
        end
        events[#events + 1] = {
            id = raw_event.id,
            type = raw_event.type,
            role = raw_event.role,
            body = raw_event.body,
            seq = raw_event.seq,
            content = raw_event.content,
            external = raw_event.external,
            trace_context = raw_event.trace_context,
            created_at = raw_event.created_at,
        }
    end

    local result, ingest_err = contract.append_events({ thread_id = thread_id, events = events })
    if not ingest_err then
        _, ingest_err = error_envelope.binding(result, nil, nil, "Write ingest events batch", "core_http_write_response")
    end
    if ingest_err then
        res:set_status((http_errors.classify(ingest_err :: error)))
        res:write_json(http_errors.response(ingest_err))
        return
    end

    res:write_json({
        success = true,
        inserted = (result :: any).inserted,
        duplicates = (result :: any).duplicates,
        max_seq = (result :: any).max_seq,
    })
end

return { handler = handler }
