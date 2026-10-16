-- POST /threads — create a thread. Body: { thread_class?, attrs?, title?,
-- parent_id?, id? }. Response: { success, thread, component_id }.

local http = require("http")
local http_errors = require("http_errors")
local error_envelope = require("error_envelope")
local json = require("json")
local contract = require("threads_contract")


local function handler(): ()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)

    local args: { [string]: any } = {}
    local raw = req:body()
    if type(raw) == "string" and raw ~= "" then
        local decoded, decode_err = json.decode(raw)
        if decode_err or type(decoded) ~= "table" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid JSON" })
            return
        end
        args = decoded :: { [string]: any }
    end

    local result, create_err = contract.create(args)
    if not create_err then
        _, create_err = error_envelope.binding(result, nil, nil, "Write create thread", "core_http_write_response")
    end
    if create_err then
        res:set_status((http_errors.classify(create_err :: error)))
        res:write_json(http_errors.response(create_err))
        return
    end

    res:set_status(http.STATUS.CREATED)
    res:write_json({ success = true, thread = (result :: any).thread, component_id = (result :: any).component_id })
end

return { handler = handler }
