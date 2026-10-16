local http = require("http")
local security = require("security")
local funcs = require("funcs")

local M = {}

function M.handler()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", "kickside.users.api:run_as_candidates.endpoint") then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({success = false, error = "access denied"})
        return
    end
    local req = http.request()
    local raw_limit = req:query("limit")
    local limit = raw_limit and tonumber(raw_limit) or nil
    if raw_limit and not limit then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({success = false, error = "limit must be an integer"})
        return
    end
    local page, err = funcs.new():call("kickside.users:run_as_candidates", {component_id = req:query("component_id"), q = req:query("q"),
        cursor = req:query("cursor"), limit = limit})
    if err then
        local status = errors.is(err, errors.INVALID) and http.STATUS.BAD_REQUEST
            or (errors.is(err, errors.PERMISSION_DENIED) and http.STATUS.FORBIDDEN or http.STATUS.INTERNAL_ERROR)
        res:set_status(status)
        res:write_json({success = false, error = tostring(err)})
        return
    end
    page.success = true
    res:write_json(page)
end

return M
