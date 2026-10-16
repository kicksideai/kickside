local http = require("http")
local contract = require("contract")
local component = require("component")
local http_errors = require("http_errors")
local oauth_repo = require("oauth_repo")
local oauth_read_repo = require("oauth_read_repo")
local update_consistency = require("update_consistency")
local security = require("security")
local time = require("time")

local STATUS = http.STATUS
local CONTENT = http.CONTENT
local DISCOVERY_SERVICE_CONTRACT = "kickside.oauth.discovery:provider_discovery"

local function load_component_meta(component_id: string): (any?, string?)
    local service, service_err = component.get_service()
    if service_err or not service then
        return nil, "component service unavailable: " .. tostring(service_err)
    end
    local result, get_err = service:get({ component_id = component_id })
    if get_err or not result or result.success == false then
        return nil, "component metadata unavailable: "
            .. tostring(get_err or (result and result.error) or "not found")
    end
    return type(result.meta) == "table" and result.meta or {}, nil
end

local function apply_update(component_id: string, current_connection: any, fields: any): (any?, string?)
    return update_consistency.apply(component_id, current_connection, fields, {
        get_meta = load_component_meta,
        update_repo = oauth_repo.update_connection,
        set_meta = component.set_meta,
    })
end

local function handler()
    local req = http.request()
    local res = http.response()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    res:set_content_type(CONTENT.JSON)

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        res:set_status(STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "security actor and scope are required" })
        return
    end

    if req:method() ~= "PUT" then
        res:set_status(STATUS.METHOD_NOT_ALLOWED)
        res:write_json({ success = false, error = "Method not allowed. Use PUT." })
        return
    end

    local component_id = req:param("component_id")
    if not component_id or component_id == "" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Component ID is required in URL path" })
        return
    end

    local body, parse_err = req:body_json()
    if parse_err or type(body) ~= "table" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON request body: " .. tostring(parse_err or "expected a JSON object") })
        return
    end

    if not body.connection_name or body.connection_name == "" then
        res:set_status(STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Connection name is required" })
        return
    end

    local access_level, access_err = component.validate_access(component_id, component.ACCESS.WRITE)
    if access_err or not access_level or access_level == 0 then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "insufficient permissions")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local connection, err = oauth_read_repo.get_connection(component_id)
    if err then
        res:set_status(STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "OAuth connection not found: " .. err })
        return
    end

    local repo_result, update_err = apply_update(component_id, connection, {
        connection_name = body.connection_name,
        connection_description = body.connection_description or ""
    })
    if update_err then
        res:set_status(STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = update_err })
        return
    end

    -- Provider info decorates the response; the provider name is the fallback
    -- when discovery is unavailable.
    local provider_info = nil
    local discovery_service, err = contract.get(DISCOVERY_SERVICE_CONTRACT)
    if not err then
        local discovery_instance, open_err = discovery_service:with_actor(actor):with_scope(scope):open()
        if not open_err then
            local info, info_err = discovery_instance:get_provider_info({
                oauth_provider = connection.provider
            })
            -- Discovery translates a registry miss into a {success=false} value with nil err.
            if not info_err and info and info.success ~= false then
                provider_info = info
            end
        end
    end
    if not provider_info then
        provider_info = {
            name = connection.provider,
            title = connection.provider
        }
    end

    res:set_status(STATUS.OK)
    res:write_json({
        success = true,
        component_id = component_id,
        connection_name = body.connection_name,
        connection_description = body.connection_description or "",
        provider = {
            name = provider_info.name,
            title = provider_info.title
        },
        updated_at = repo_result and repo_result.updated_at or time.now():utc():format_rfc3339()
    })
end

return { handler = handler }
