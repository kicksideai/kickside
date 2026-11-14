local http = require("http")
local json = require("json")
local envelope = require("envelope")
local component = require("component")
local http_errors = require("http_errors")
local update_policy = require("update_policy")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local component = deps.component or component

-- Authn + endpoint authz are enforced by the router firewall. The WRITE check
-- below is domain access on the specific connection component, not a
-- permission/role check.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local component_id = req:param("id")
    if not component_id or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "id is required" })
        return
    end

    -- Component WRITE authority covers metadata and declared credential changes.
    -- Generic private-context replacement remains outside this HTTP surface.
    local _, access_err = component.validate_access(component_id, component.ACCESS.WRITE)
    if access_err then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, body_err = json.decode(raw)
    if body_err or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    local fields, command_err = update_policy.fields(body)
    if command_err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = command_err })
        return
    end

    if body.secrets ~= nil then
        local service, service_err = component.get_service()
        if service_err or not service then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({success = false, error = tostring(service_err or "component service unavailable")})
            return
        end
        local commands = {{type = "PATCH_CONTEXT", payload = {patch = {}, secret_changes = body.secrets}}}
        if fields and next(fields) ~= nil then
            commands[#commands + 1] = {type = "SET_META", payload = {fields = fields}}
        end
        local result, write_err = service:update({component_id = component_id, commands = commands,
            expected_revision = body.expected_revision})
        if write_err or not result or result.success ~= true then
            local failure = write_err or envelope.error_of(result, "update")
            res:set_status((http_errors.classify(failure)))
            res:write_json({success = false, error = tostring(failure or "credential update failed")})
            return
        end
    elseif fields and next(fields) ~= nil then
        local ok, err = component.set_meta(component_id, fields)
        if not ok then
            res:set_status((http_errors.classify(err)))
            res:write_json({ success = false, error = tostring(err or "update failed") })
            return
        end
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        component_id = component_id,
    })
end

return {
    handler = handler
}
end

local default = new()
default.new = new
return default
