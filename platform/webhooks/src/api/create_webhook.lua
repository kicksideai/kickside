-- POST /api/v1/webhooks (app:api prefix + /webhooks) — mint a webhook for the current
-- user. Body: { label?, schema? } where schema is the JSON-schema-subset each inbound
-- payload is validated against. Returns the webhook + its public ingress URL + the raw
-- secret (shown once).

local http = require("http")
local json = require("json")
local security = require("security")
local repo = require("webhook_repo")

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

    local result, err = repo.mint({ schema = body.schema, label = body.label })
    if err or not result then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err or "mint failed") })
        return
    end

    (result :: any).url = "/api/public/hooks/" .. tostring((result :: any).webhook_id)
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, webhook = result })
end

return { handler = handler }
