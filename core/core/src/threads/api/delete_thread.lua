-- DELETE /threads/{id} — remove a thread and its component. Response:
-- { success, thread_id }.

local http = require("http")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
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

    local result, delete_err = contract.delete({ thread_id = thread_id })
    if not delete_err then
        _, delete_err = error_envelope.binding(result, nil, nil, "Write delete thread", "core_http_write_response")
    end
    if delete_err then
        res:set_status((http_errors.classify(delete_err :: error)))
        res:write_json(http_errors.response(delete_err))
        return
    end

    res:set_status(result.in_progress == true and http.STATUS.ACCEPTED or http.STATUS.OK)
    res:write_json({ success = true, thread_id = thread_id, deleted = result.deleted,
        in_progress = result.in_progress, status = result.status, cleanup_pending = result.cleanup_pending,
        kind = result.kind, retryable = result.retryable, details = result.details, discarded = result.discarded })
end

return { handler = handler }
