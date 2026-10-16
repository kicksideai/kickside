-- DELETE /inbox/{id} — permanently remove an item (purge an old/resolved item).
-- Goes through the canonical writer; live UI refresh is component-owned.

local http = require("http")
local security = require("security")
local http_errors = require("http_errors")
local writer = require("inbox_writer")

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local id = req:param("id")
    if not id or id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "id is required" })
        return
    end

    local _, err = writer.delete(id)
    if err then
        local status = http_errors.classify(err)
        res:set_status(status)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true })
end

return { handler = handler }
