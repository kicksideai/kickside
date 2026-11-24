local http = require("http")
local profile_service = require("profile_service")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "Failed to get HTTP context" end
    res:set_content_type(http.CONTENT.JSON)

    local id = req:param("id")
    if not id or id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Profile id is required" })
        return
    end

    local ok, err = profile_service.delete(id)
    if not ok then
        if type(err) == "userdata" then
            local details = err:details() or {}
            res:set_status(details.code == "profile_in_use" and http.STATUS.CONFLICT or http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = err:message(), code = details.code, holders = details.holders })
            return
        end
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = err })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true })
end

return { handler = handler }
