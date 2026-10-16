-- GET /api/v1/automations/types
--
-- Thin HTTP wrapper around automations_lib.list_types. Optional ?class=<tag>
-- and ?category=<tag> filters.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = api_errors.error("authentication_required", "authentication required") })
        return
    end

    local types, err = automations_lib.list_types({
        class = req:query("class"),
        category = req:query("category"),
    })
    if err then
        local status, payload = api_errors.status(err, "type_catalog_failed", "could not list automation types")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #types,
        types = types,
    })
end

return { handler = handler }
