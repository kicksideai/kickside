-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local http = require("http")
local security = require("security")
local component = require("component")
local envelope = require("envelope")
local http_errors = require("http_errors")
local http_context = require("http_context")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http, security, component = deps.http or http, deps.security or security, deps.component or component
    local function handler()
        local res, req, context_err = http_context.require(http, true)
        if context_err then return nil, context_err end
        res:set_header("Cache-Control", "no-store")
        res:set_content_type(http.CONTENT.JSON)
        if not security.actor() then
            res:set_status(http.STATUS.UNAUTHORIZED)
            res:write_json({success = false, error = "authentication required"})
            return
        end
        local service, service_err = component.get_service()
        local result, err
        if service then result, err = service:get({component_id = req:param("id")})
        else err = service_err end
        err = err or envelope.error_of(result, "get component")
        if err then
            res:set_status((http_errors.classify(err)))
            res:write_json(http_errors.response(err))
            return
        end
        res:set_status(http.STATUS.OK)
        res:write_json(result)
    end
    return {handler = handler}
end
local M = new()
M.new = new
return M
