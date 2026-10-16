-- GET /threads/{id} — load one thread the actor can read. Response:
-- { success, thread } or 404 when absent / not accessible.

local http = require("http")
local http_errors = require("http_errors")
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

    local thread, read_err = contract.find({ thread_id = thread_id })
    if read_err then
        res:set_status((http_errors.classify(read_err :: error)))
        res:write_json(http_errors.response(read_err))
        return
    end
    if not thread then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json(http_errors.response(errors.new({kind = errors.NOT_FOUND, retryable = false,
            message = "thread not found", details = {code = "core_http_thread_not_found"}})))
        return
    end

    res:write_json({ success = true, thread = thread })
end

return { handler = handler }
