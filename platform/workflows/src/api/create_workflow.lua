-- POST /api/v1/workflows { title?, parent_id?, idempotency_key? } — create a
-- workflow component for the current user. Repeating a key for the same actor
-- returns the original draft instead of creating a second one.

local http = require("http")
local json = require("json")
local security = require("security")
local repo = require("workflow_repo")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local body: any = {}
    local raw = req:body()
    if type(raw) == "string" and raw ~= "" then
        local decoded, derr = json.decode(raw)
        if derr then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid JSON body" })
            return
        end
        if type(decoded) == "table" then body = decoded end
    end

    local result, err = repo.create(body.title, body.parent_id, body.idempotency_key)
    if err or not result then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err or "create failed") })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, flow_id = result.id, replayed = result.replayed == true })
end

return { handler = handler }
