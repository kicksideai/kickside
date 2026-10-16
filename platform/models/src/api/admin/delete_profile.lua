local http = require("http")
local models_repo = require("models_repo")

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

    local ok, err = models_repo.delete_profile(id)
    if not ok then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = err })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true })
end

return { handler = handler }
