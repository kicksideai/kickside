local http = require("http")
local models_repo = require("models_repo")

local function handler()
    local res = http.response()
    if not res then return nil, "Failed to get HTTP context" end
    res:set_content_type(http.CONTENT.JSON)
    res:set_header("Cache-Control", "no-store")

    local doc, err = models_repo.export()
    if not doc then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json(doc)
end

return { handler = handler }
