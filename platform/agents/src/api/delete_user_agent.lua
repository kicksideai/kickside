local http = require("http")
local security = require("security")
local component = require("component")
local component_envelope = require("component_envelope")
local http_errors = require("http_errors")

local function new(dependencies: any?): any
local deps = dependencies or {}
local http = deps.http or http
local security = deps.security or security
local component = deps.component or component

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local component_id = req:param("id")
    if not component_id or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "id is required" })
        return
    end

    -- Typed access gate: the component client returns a kind-carrying error
    -- (NOT_FOUND / PERMISSION_DENIED) that api_errors maps by kind, not message prose.
    local _, access_err = component.validate_access(component_id, component.ACCESS.DELETE)
    if access_err then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "not found or access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        res:set_status((http_errors.classify(svc_err)))
        res:write_json({ success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return
    end

    -- Access verified above; a failure here is an internal fault, not a client error.
    local result, err = service:delete({ component_id = component_id })
    if not result or not result.success then
        res:set_status((http_errors.classify(err or component_envelope.error_of(result, "delete"))))
        res:write_json({ success = false, error = "delete failed: " .. tostring(err or (result and result.error) or "no result") })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        deleted = result.deleted or false,
    })
end

return {
    handler = handler
}
end

local default = new()
default.new = new
return default
