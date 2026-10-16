local http = require("http")
local security = require("security")
local json = require("json")
local user_agents = require("user_agents")
local http_errors = require("http_errors")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local user_agents = deps.user_agents or user_agents

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

    local result, failure = user_agents.update(component_id, body)
    if failure or type(result) ~= "table" or not result.success then
        local status = http_errors.classify(failure)
        res:set_status(status)
        res:write_json({ success = false, error = tostring(failure or "update failed") })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        component_id = result.component_id,
    })
end

return {
    handler = handler
}
end

local default = new()
default.new = new
return default
