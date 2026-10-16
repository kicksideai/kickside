local http = require("http")
local branding = require("branding")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    local logo = branding.read()
    if not logo or not logo.bytes then
        res:set_status(http.STATUS.NOT_FOUND)
        return
    end
    res:set_header("ETag", logo.etag)
    res:set_header("Cache-Control", "no-cache")
    res:set_content_type(logo.content_type)
    if req:header("If-None-Match") == logo.etag then
        res:set_status(304)
        return
    end
    res:set_status(http.STATUS.OK)
    res:write(logo.bytes)
end

return { handler = handler }
