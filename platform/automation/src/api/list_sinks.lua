-- GET /api/v1/automations/sinks
--
-- Thin HTTP wrapper around automations_lib.list_sinks: the catalog of
-- kickside.data:writable bindings Data Sync and other create UIs offer as sinks.

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

    local sinks, err = automations_lib.list_sinks()
    if err then
        local status, payload = api_errors.status(err, "sink_catalog_failed", "could not list sinks")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, count = #sinks, sinks = sinks })
end

return { handler = handler }
