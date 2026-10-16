local http = require("http")
local json = require("json")
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

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid request body: " .. tostring(raw_err) })
        return
    end
    local data, err = json.decode(raw)
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON: " .. tostring(err) })
        return
    end

    local profile, perr = models_repo.update_profile(id, data)
    if not profile then
        res:set_status(perr == "profile not found" and http.STATUS.NOT_FOUND or http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = perr })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, profile = profile })
end

return { handler = handler }
