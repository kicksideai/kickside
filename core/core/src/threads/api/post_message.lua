-- POST /threads/{id}/messages — append a message event. Body: { text, role?,
-- content?, external?, created_at?, body_table? }. Response: { success, event,
-- duplicate? }. A scheduler nudge + thread update fire after a real insert.

local http = require("http")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
local committed_error = require("committed_error")
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

    local text = type((data :: any).text) == "string" and (data :: any).text or ""
    text = text:gsub("^%s*(.-)%s*$", "%1")
    if text == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json(http_errors.response(errors.new({kind = errors.INVALID, retryable = false,
            message = "text is required", details = {code = "core_http_text_required"}})))
        return
    end

    local body = type((data :: any).body_table) == "table" and (data :: any).body_table or {}
    body.text = text
    local result, post_err = contract.append_event({
        thread_id = thread_id,
        event = {
            type = "kickside.threads:message.created",
            role = (data :: any).role,
            body = body,
            content = (data :: any).content,
            external = (data :: any).external,
            trace_context = (data :: any).trace_context,
            created_at = (data :: any).created_at,
        },
    })
    if not post_err then
        _, post_err = error_envelope.binding(result, nil, nil, "Write post message", "core_http_write_response")
    end
    if post_err then
        res:set_status((http_errors.classify(post_err :: error)))
        res:write_json(http_errors.response(post_err))
        return
    end

    local event = nil
    if ((result :: any).inserted or 0) > 0 then
        local listed, list_err = contract.list_events({
            thread_id = thread_id,
            from_seq = (result :: any).max_seq,
            to_seq = (result :: any).max_seq,
            limit = 1,
            ascending = true,
        })
        if not list_err then
            _, list_err = error_envelope.binding(listed, nil, nil, "Read appended message", "core_http_appended_message_response")
        end
        if not list_err then
            _, list_err = error_envelope.binding((listed :: any).events, nil, nil, "Read appended message events", "core_http_appended_message_events")
        end
        if list_err then
            list_err = committed_error.new(errors.wrap(list_err, "Read appended message"))
            res:set_status((http_errors.classify(list_err :: error)))
            res:write_json(http_errors.response(list_err))
            return
        end
        event = (listed :: any).events[1]
    end

    res:set_status(http.STATUS.CREATED)
    res:write_json({ success = true, event = event, duplicate = ((result :: any).duplicates or 0) > 0 })
end

return { handler = handler }
