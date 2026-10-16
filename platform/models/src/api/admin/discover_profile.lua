local http = require("http")
local model_discovery = require("model_discovery")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "Failed to get HTTP context" end
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")

    local id = req:param("id")
    if not id or id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Profile id is required" })
        return
    end

    local result, err = model_discovery.discover(id)
    if not result then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = err })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json(result)
end

return { handler = handler }
