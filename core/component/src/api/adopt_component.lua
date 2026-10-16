-- POST /component-access/adopt/{id} — an instance operator adopts a component
-- no principal holds access to. The component service authorizes the operator
-- capability and refuses an owned component; the caller gains full access and
-- the adoption is recorded in the component identity audit.

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

        if not security.actor() then
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

        local result, adopt_err = component.adopt(component_id)
        if not adopt_err then result, adopt_err = error_envelope.binding(result, nil, nil, "adopt component", "component_http_operation_response") end
        if adopt_err then
            local status = http_errors.classify(adopt_err)
            local payload = http_errors.response(adopt_err)
            payload.error = tostring(adopt_err)
            res:set_status(status)
            res:write_json(payload)
            return
        end

        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, result = {
            component_id = result.component_id,
            adopted_by = result.adopted_by,
            identity_generation = result.identity_generation,
            prior_access = result.prior_access,
        } })
    end

    return { handler = handler }
end

local default = new()
default.new = new
return default
