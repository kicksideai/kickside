-- POST /api/v1/automations/{id}/actions/{method} — thin HTTP wrapper
-- around automations_lib.call_action.
--
-- The metadata allowlist dispatch + lifecycle filtering all live in the
-- lib. We just shape the HTTP request/response over the http/security
-- runtime primitives.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

type Map = { [string]: any }

-- action_failed detects an in-band failure the action handler reported inside its result
-- envelope ({ success = false, error = ... }). The wrapper must surface that as a real error
-- instead of a 200 with top-level success = true -- a failed pause/disable that never changed
-- state must reach the caller as an error, not masquerade as success. An action that returns
-- plain data or an explicit success = true is successful.
local function action_failed(result: any): (boolean, any)
    local inner = type(result) == "table" and (result :: Map).result or nil
    if type(inner) == "table" and (inner :: Map).success == false then
        return true, (inner :: Map).error
    end
    return false, nil
end

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
    local method_name = req:param("method")
    if type(component_id) ~= "string" or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("missing_parameter", "component id is required") })
        return
    end
    if type(method_name) ~= "string" or method_name == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("missing_parameter", "method is required") })
        return
    end

    local body: any = nil
    if req:has_body() then
        local parsed, parse_err = req:body_json()
        if parse_err then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = api_errors.error("invalid_json", "invalid JSON: " .. parse_err:message()) })
            return
        end
        body = parsed
    end
    local args: any = type(body) == "table" and body or {}

    local result, err = automations_lib.call_action(
        component_id :: string,
        method_name :: string,
        args
    )
    if err ~= nil then
        local status, payload = api_errors.status(err, "action_failed", "action failed")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    local failed, inner_err = action_failed(result)
    if failed then
        local status, payload = api_errors.status(inner_err, "action_failed", "action failed")
        res:set_status(status)
        res:write_json({
            success = false,
            id = result.id,
            method = result.method,
            error = payload,
        })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        id = result.id,
        method = result.method,
        result = result.result,
    })
end

return { handler = handler, action_failed = action_failed }
