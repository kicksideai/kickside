-- GET /api/v1/automations/{id}/export -- portable automation declaration.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

local M = {}

function M.response_for(actor: any, component_id: any, engine: any?): (number, any)
    if not actor then
        return http.STATUS.UNAUTHORIZED, {
            success = false,
            error = api_errors.error("authentication_required", "authentication required"),
        }
    end
    if type(component_id) ~= "string" or component_id == "" then
        return http.STATUS.BAD_REQUEST, {
            success = false,
            error = api_errors.error("missing_parameter", "component id is required"),
        }
    end
    local artifact, err = (engine or automations_lib).export_artifact(component_id :: string)
    if err or not artifact then
        local status, payload = api_errors.status(err, "export_failed", "automation export failed")
        return status, { success = false, error = payload }
    end
    return http.STATUS.OK, { success = true, artifact = artifact }
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    local status, body = M.response_for(security.actor(), req:param("id"))
    res:set_status(status)
    res:write_json(body)
end

M.handler = handler
return M
