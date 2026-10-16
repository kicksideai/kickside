local http = require("http")
local security = require("security")
local unlink_response = require("unlink_response")

-- POST: remove one of the authenticated user's external links. Body: { provider,
-- external_id }. Scoped to the caller -- they can only unlink their own accounts.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local body: any = {}
    if req:has_body() then
        local parsed, perr = req:body_json()
        if perr then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid JSON" })
            return
        end
        body = parsed or {}
    end

    local provider = tostring(body.provider or "")
    local external_id = tostring(body.external_id or "")
    local status, result = unlink_response.response_for(actor:id(), provider, external_id)
    res:set_status(status)
    res:write_json(result)
end

return { handler = handler }
