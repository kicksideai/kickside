-- GET /api/v1/automations/{id}/state — read public automation state.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = api_errors.error("authentication_required", "authentication required") })
        return
    end

    local component_id = req:param("id")
    if type(component_id) ~= "string" or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("missing_parameter", "component id is required") })
        return
    end

    local state, err = automations_lib.read_public_state(component_id :: string)
    if err ~= nil then
        local status, payload = api_errors.status(err, "read_state_failed", "read state failed")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, id = component_id, state = state })
end

return { handler = handler }
