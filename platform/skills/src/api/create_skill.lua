-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local http_errors = require("http_errors")

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    -- Endpoints attach to a router that enforces auth; this guards the rare
    -- unauthenticated path defensively.
    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, body_err = json.decode(raw)
    if body_err or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    local result, err = funcs.call("kickside.skills:skill_create", {
        name = body.name,
        description = body.description,
        body = body.body,
        status = body.status,
        agent_id = body.agent_id,
        icon = body.icon,
    })
    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, skill_id = result })
end

return { handler = handler }
