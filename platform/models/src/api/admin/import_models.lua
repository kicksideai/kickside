local http = require("http")
local json = require("json")
local models_repo = require("models_repo")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "Failed to get HTTP context" end
    res:set_content_type(http.CONTENT.JSON)

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid request body: " .. tostring(raw_err) })
        return
    end
    local doc, decode_err = json.decode(raw)
    if decode_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON: " .. tostring(decode_err) })
        return
    end

    local report, err = models_repo.import(doc)
    if err then
        -- A report alongside the error means the writes committed and only the
        -- cache reload or change notification after them failed.
        res:set_status(report and http.STATUS.INTERNAL_ERROR or http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = tostring(err),
            committed = report ~= nil,
            profiles = report and report.profiles or nil,
            cards = report and report.cards or nil,
        })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, profiles = report.profiles, cards = report.cards })
end

return { handler = handler }
