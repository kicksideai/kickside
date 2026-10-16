-- PUT /api/v1/automations/{id} { input } — reconfigure an installed automation in
-- place. Thin HTTP wrapper around automations_lib.reconfigure, which dispatches
-- the kind's action. A kind applies its new declaration and source
-- through the one fenced reconfigure command; that command updates, creates or
-- retires timer drives. Only kinds declaring meta.reconfigurable are reachable.

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
    local body_t: any = type(body) == "table" and body or {}

    local result, err = automations_lib.reconfigure(component_id :: string, body_t.input)
    if err ~= nil then
        local status, payload = api_errors.status(err, "reconfigure_failed", "reconfigure failed")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end
    -- A kind refusal rides the result envelope with err == nil; an HTTP 200 for
    -- it is how "PUT succeeded but nothing changed" shipped to production.
    local envelope: any = type(result) == "table" and result or {}
    local inner: any = type(envelope.result) == "table" and envelope.result or envelope
    if inner.success == false then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = api_errors.error("reconfigure_refused", tostring(inner.error or "reconfigure refused")),
        })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        id = result and result.id or component_id,
    })
end

return { handler = handler }
