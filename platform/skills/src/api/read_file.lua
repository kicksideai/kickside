-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local funcs = require("funcs")
local security = require("security")
local http_errors = require("http_errors")
local query_params = require("query_params")

local function handler()
    local res, req = http.response(), http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end
    local max_bytes, err = query_params.query_int(req, "max_bytes", nil, { min = 1 })
    if err then query_params.bad_request(res, err) return end
    local result, rerr = funcs.call("kickside.skills:skill_read_file", {
        skill_id = req:param("id"), path = req:query("path"),
        version = req:query("version"), format = req:query("format"), max_bytes = max_bytes,
    })
    if rerr then
        res:set_status((http_errors.classify(rerr)))
        res:write_json({ success = false, error = tostring(rerr) })
        return
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, file = result })
end

return { handler = handler }
