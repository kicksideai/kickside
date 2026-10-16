local http = require("http")
local contract = require("contract")
local security = require("security")

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

    local actor, scope = current_runtime_identity()
    if not actor or not scope then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({ success = false, error = "security actor and scope are required" })
        return
    end

    -- Get discovery service
    local discovery_service, err = contract.get("kickside.oauth.discovery:provider_discovery")
    if not discovery_service then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Discovery service not available"
        })
        return
    end

    -- Open service instance
    local service, err = discovery_service:with_actor(actor):with_scope(scope):open()
    if not service then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Failed to open discovery service"
        })
        return
    end

    -- Parse query parameters - only class filter supported
    local class = req:query("class")

    -- Build request DTO
    local request_dto = {}

    -- Add filters if provided
    if class and class ~= "" then
        request_dto.filters = {
            classes = { class }
        }
    end

    -- Call discovery service
    local result, err = service:list_available_providers(request_dto)
    if not result then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = "Service call failed"
        })
        return
    end

    -- Check for service errors
    if not result.success then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:set_content_type(http.CONTENT.JSON)
        res:write_json({
            success = false,
            error = result.error or "Service returned error"
        })
        return
    end

    -- Return successful response
    res:set_status(http.STATUS.OK)
    res:set_content_type(http.CONTENT.JSON)
    res:write_json({
        success = true,
        count = #result.providers,
        total = result.total_count,
        available_classes = result.available_classes,
        providers = result.providers,
        filters = {
            class = class
        }
    })
end

return {
    handler = handler
}
