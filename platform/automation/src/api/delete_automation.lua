-- DELETE /api/v1/automations/{id} — delete an installable Automation component
-- or an Automation binding through the shared lifecycle dispatcher.
--
-- Optional JSON body { options: {...} } passes per-type delete options
-- (e.g. { keep_thread: true }) to the cleanup handlers. Each binding
-- declares the keys it understands via meta.delete_options. Auth, body
-- parsing, and error shaping are inlined over the http/security primitives.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local component = require("component")
local api_errors = require("api_errors")

local M = {}

-- response_for owns the DELETE policy and response shape independently of the
-- runtime HTTP objects. The automation library classifies binding shells and
-- routes them through their deletable component teardown; installable Automation components
-- replay their rollback chain through uninstall.
function M.response_for(actor: any, component_id: any, options: any, deps: any?): (number, any)
    local d = type(deps) == "table" and deps or {}
    local component_mod = d.component or component
    local automation_mod = d.automations_lib or automations_lib
    local errors_mod = d.api_errors or api_errors

    if not actor then
        return http.STATUS.UNAUTHORIZED, { success = false, error = errors_mod.error("authentication_required", "authentication required") }
    end
    if type(component_id) ~= "string" or component_id == "" then
        return http.STATUS.BAD_REQUEST, { success = false, error = errors_mod.error("missing_parameter", "component id is required") }
    end

    -- Gate before any destructive work. delete_automation repeats the component
    -- lookup under the same access mask when choosing binding vs. installable-component teardown.
    local _, access_err = component_mod.validate_access(component_id :: string, component_mod.ACCESS.DELETE)
    if access_err then
        local status, payload = errors_mod.status(access_err, "access_denied", "delete access required")
        if payload.code == "not_found" or payload.code == "access_denied" then
            -- A readable item reports its canonical denial. The scoped query
            -- keeps inaccessible and missing items behind the neutral 404.
            local visible, read_err = component_mod.query({ component_ids = { component_id },
                access_mask = component_mod.ACCESS.READ })
            if read_err then
                local read_status, read_payload = errors_mod.status(read_err, "delete_failed", "delete visibility check failed")
                return read_status, { success = false, error = read_payload }
            end
            if not visible or not visible[1] then
                status = http.STATUS.NOT_FOUND
                payload = errors_mod.error("not_found", "automation not found or access denied")
            end
        end
        return status, { success = false, error = payload }
    end

    local result, err = automation_mod.delete_automation(component_id :: string, options)
    if err ~= nil then
        local status, payload = errors_mod.status(err, "delete_failed", "delete failed")
        return status, { success = false, error = payload }
    end

    local r = type(result) == "table" and result or {}
    return http.STATUS.OK, {
        success = true,
        id = r.id,
        replayed = r.replayed,
        replay_failed = r.replay_failed,
        discarded = r.discarded,
        status = r.status,
        in_progress = r.in_progress,
        deleted = r.deleted,
        cleanup_pending = r.cleanup_pending,
        retryable = r.retryable,
        kind = r.kind,
        details = r.details,
    }
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local component_id = req:param("id")
    local actor = security.actor()
    -- Preserve the endpoint's auth-first behavior: malformed request bodies must
    -- not reveal parsing details to an unauthenticated caller.
    if not actor then
        local status, payload = M.response_for(nil, component_id, nil)
        res:set_status(status)
        res:write_json(payload)
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
    local options: any = nil
    if type(body) == "table" and type((body :: any).options) == "table" then
        options = (body :: any).options
    end

    local status, payload = M.response_for(actor, component_id, options)
    res:set_status(status)
    res:write_json(payload)
end

M.handler = handler
return M
