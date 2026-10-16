-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
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

    local id = req:param("id")
    if not id or id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "id is required" })
        return
    end

    local _, err = funcs.call("kickside.skills:skill_delete", { skill_id = id })
    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({ success = false, error = tostring(err) })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, skill_id = id })
end

return { handler = handler }
