local http = require("http")
local json = require("json")
local organizer = require("organizer")

-- POST /knowledge/organize — body { upload_ids: [...], kb_type?, embedding_model? }.
-- Runs the organize orchestrator under the caller's identity: plan (fast) → create KB
-- → ingest every file by reference. Returns the created KB id + per-file outcome.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, perr = json.decode(raw)
    if perr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    local ids: { string } = {}
    if type(body.upload_ids) == "table" then
        for _, v in ipairs(body.upload_ids :: { any }) do
            if type(v) == "string" and (v :: string) ~= "" then ids[#ids + 1] = v :: string end
        end
    end
    if #ids == 0 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "upload_ids is required" })
        return
    end

    local result, err = organizer.organize(ids, { kb_type = body.kb_type, embedding_model = body.embedding_model })
    if not result then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json(result)
end

return { handler = handler }
