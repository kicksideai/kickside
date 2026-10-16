local http = require("http")
local contract = require("contract")
local component = require("component")
local http_errors = require("http_errors")
local oauth_read_repo = require("oauth_read_repo")
local oauth_types = require("oauth_types")
local security = require("security")
local time = require("time")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component

-- Constants
local DISCOVERY_SERVICE_CONTRACT = "kickside.oauth.discovery:provider_discovery"

local function current_runtime_identity()
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil
    end
    return actor, scope
end

local function handler()
    local res = http.response()
    local req = http.request()

    if not res or not req then
        return nil, "Failed to get HTTP context"
    end

    -- Set JSON content type
    res:set_content_type(http.CONTENT.JSON)

    local actor, scope = current_runtime_identity()
    if not actor or not scope then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "security actor and scope are required" })
        return
    end

    -- Get component ID from URL params
    local component_id = req:param("component_id")
    if not component_id or component_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "Component ID is required"
        })
        return
    end

    local access_level, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err or not access_level or access_level == 0 then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "insufficient permissions")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    -- Get OAuth connection metadata. This management endpoint should not
    -- decrypt token payloads or provider-private profile data.
    local connection, err = oauth_read_repo.get_connection_metadata(component_id)
    if err then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({
            success = false,
            error = "OAuth connection not found: " .. err
        })
        return
    end

    -- Get provider discovery service to get provider information
    local discovery_service, err = contract.get(DISCOVERY_SERVICE_CONTRACT)
    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({
            success = false,
            error = "Discovery service not available: " .. err
        })
        return
    end

    -- Open discovery service
    local discovery_instance, err = discovery_service:with_actor(actor):with_scope(scope):open()
    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({
            success = false,
            error = "Failed to open discovery service: " .. err
        })
        return
    end

    -- Get provider information
    local provider_info, err = discovery_instance:get_provider_info({
        oauth_provider = connection.provider
    })

    -- Discovery translates a registry miss into a {success=false} value with nil err.
    if err or not provider_info or provider_info.success == false then
        -- Provider info not found, but continue with limited information
        provider_info = {
            name = connection.provider,
            title = connection.provider,
            description = "OAuth provider",
            available_scopes = {},
            default_scopes = {}
        }
    end

    -- Prepare response with public metadata only.
    local response = {
        success = true,
        connection = oauth_types.public_details_from_metadata(connection, provider_info, time.now():unix()),
        provider = oauth_types.public_provider_info(provider_info)
    }

    res:set_status(http.STATUS.OK)
    res:write_json(response)
end

return {
    handler = handler
}
end

local default = new()
default.new = new
return default
