local http = require("http")
local json = require("json")
local models_repo = require("models_repo")
local model_catalog = require("model_catalog")

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
    local data, err = json.decode(raw)
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON: " .. tostring(err) })
        return
    end
    if type(data) ~= "table" or type(data.name) ~= "string" or data.name == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Model name is required" })
        return
    end

    local base = model_catalog.get_by_name(data.name)
    local card, cerr = models_repo.upsert_card(data, base)
    if not card then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = cerr })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, model = card })
end

return { handler = handler }
