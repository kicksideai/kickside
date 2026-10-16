-- GET /api/v1/automations — thin HTTP wrapper around
-- automations_lib.list_installed. Optional ?class=<tag> filters by
-- meta.class entries. Optional ?parent_id=<component> scopes the same canonical
-- rows to Automations placed under one owning component.

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

    local automations, err = automations_lib.list_installed({
        actor_id = actor:id(),
        class = req:query("class"),
        parent_id = req:query("parent_id"),
    })
    if err then
        local status, payload = api_errors.status(err, "automation_list_failed", "could not list automations")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        count = #automations,
        automations = automations,
    })
end

return { handler = handler }
