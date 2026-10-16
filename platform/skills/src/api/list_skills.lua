-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local funcs = require("funcs")
local security = require("security")
local http_errors = require("http_errors")
local query_params = require("query_params")

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

    local parsed_limit, limit_err = query_params.query_int(req, "limit", nil, { min = 1, max = 100 })
    if limit_err then
        query_params.bad_request(res, limit_err)
        return
    end

    local result, err = funcs.call("kickside.skills:skill_list", {
        ids = req:query("ids"),
        q = req:query("q"),
        limit = parsed_limit,
    })
    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, skills = result or {} })
end

return { handler = handler }
