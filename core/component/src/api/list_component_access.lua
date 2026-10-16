-- GET /component-access/grants/{id} — list the grants on a component for the share
-- popup. ADMIN is enforced by the service; display labels are resolved by the
-- caller through the directory seam, so this stays decoupled from any user
-- backend. Goes through the component client library — no direct persistence.

local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local http_context = require("http_context")
local error_envelope = require("error_envelope")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component

    local function handler()
        local res, req, context_err = http_context.require(http, true)
        if context_err then return nil, context_err end
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

        local access, owner, err = component.list_access(component_id)
        if not err then access, err = error_envelope.binding(access, nil, nil, "list component access", "component_http_operation_response") end
        if err then
            local status = http_errors.classify(err)
            local payload = http_errors.response(err)
            payload.error = tostring(err)
            res:set_status(status)
            res:write_json(payload)
            return
        end

        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, count = #access, access = access, owner = owner })
    end

    return { handler = handler }
end

local default = new()
default.new = new
return default
