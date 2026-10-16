-- POST /threads/{id}/events — append one typed event. Body: { type?, role?,
-- body?, seq?, content?, external?, created_at? }. Unlike post_message this carries
-- an arbitrary event type and a structured body. Response: { success, inserted,
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

    local event: { [string]: any } = {
        type = (data :: any).type,
        role = (data :: any).role,
        body = (data :: any).body,
        seq = (data :: any).seq,
        content = (data :: any).content,
        external = (data :: any).external,
        trace_context = (data :: any).trace_context,
        created_at = (data :: any).created_at,
    }

    local result, post_err = contract.append_event({ thread_id = thread_id, event = event })
    if not post_err then
        _, post_err = error_envelope.binding(result, nil, nil, "Write post event", "core_http_write_response")
    end
    if post_err then
        res:set_status((http_errors.classify(post_err :: error)))
        res:write_json(http_errors.response(post_err))
        return
    end

    res:set_status(http.STATUS.CREATED)
    res:write_json({
        success = true,
        inserted = (result :: any).inserted,
        duplicates = (result :: any).duplicates,
        max_seq = (result :: any).max_seq,
    })
end

return { handler = handler }
