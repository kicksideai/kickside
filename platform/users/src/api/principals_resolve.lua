-- POST /principals/resolve { refs: [{ type, id }] } — resolve principal refs to
-- display info for rendering an access list. Thin HTTP shell over the adapter.
local http = require("http")
local directory = require("directory")
local http_errors = require("http_errors")

local function handler()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)

    local body, err = req:body_json()
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid JSON body" })
        return
    end

    local result, resolve_err = directory.resolve({ refs = (body and body.refs) or {} })
    if resolve_err or not result then
        local status = http_errors.classify(resolve_err)
        res:set_status(status)
        res:write_json({ success = false, error = tostring(resolve_err or "principal resolve returns no result") })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, principals = result.principals })
end

return { handler = handler }
