local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

local function handle(install: any): any
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = api_errors.error("authentication_required", "authentication required") })
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

    local type_id = body_t.type
    if type(type_id) ~= "string" or type_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = api_errors.error("missing_parameter", "type is required") })
        return
    end

    local result, err = install(type_id, body_t)
    if err ~= nil then
        local status, payload = api_errors.status(err, "install_failed", "install failed")
        res:set_status(status)
        res:write_json({ success = false, error = payload })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        id = result.id,
        type = result.type,
        metadata = result.metadata,
        created = result.created,
    })
end

return {
    handler = function(): any
        return handle(function(type_id: string, body: any): (any?, any)
            local parent_id = type(body.parent_id) == "string" and body.parent_id ~= "" and body.parent_id or nil
            return automations_lib.install_type(type_id, body.input, parent_id)
        end)
    end,
    selected_handler = function(): any
        return handle(function(type_id: string, body: any): (any?, any)
            return automations_lib.install_type_selected(type_id, body.input, {
                component_id = body.component_id, request_id = body.request_id,
                principal = body.principal, parent_id = body.parent_id,
            })
        end)
    end,
}
