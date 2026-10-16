-- PATCH /threads/{id} — patch state / thread_class / attrs. Body carries any of
-- { state, thread_class, attrs }. Response: { success, thread }.

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

    local args: { [string]: any } = { thread_id = thread_id }
    if (data :: any).state ~= nil then args.state = (data :: any).state end
    if (data :: any).thread_class ~= nil then args.thread_class = (data :: any).thread_class end
    if (data :: any).attrs ~= nil then args.attrs = (data :: any).attrs end

    local result, update_err = contract.update(args)
    if not update_err then
        _, update_err = error_envelope.binding(result, nil, nil, "Write update thread", "core_http_write_response")
    end
    if update_err then
        res:set_status((http_errors.classify(update_err :: error)))
        res:write_json(http_errors.response(update_err))
        return
    end

    res:write_json({ success = true, thread = (result :: any).thread })
end

return { handler = handler }
