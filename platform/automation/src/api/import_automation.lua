-- POST /api/v1/automations/import -- recreate a portable automation artifact.

local http = require("http")
local security = require("security")
local automations_lib = require("automations_lib")
local api_errors = require("api_errors")

type Map = { [string]: any }
local M = {}

local REQUEST_FIELDS: Map = {
    artifact = true,
    parent_id = true,
    input_overrides = true,
}

function M.response_for(actor: any, body: any, engine: any?): (number, any)
    if not actor then
        return http.STATUS.UNAUTHORIZED, {
            success = false,
            error = api_errors.error("authentication_required", "authentication required"),
        }
    end
    if type(body) ~= "table" then
        return http.STATUS.BAD_REQUEST, {
            success = false,
            error = api_errors.error("invalid_request", "request body must be an object"),
        }
    end
    local raw = body :: Map
    for key, _ in pairs(raw) do
        if type(key) ~= "string" or REQUEST_FIELDS[key] ~= true then
            return http.STATUS.BAD_REQUEST, {
                success = false,
                error = api_errors.error("invalid_input", "unsupported request field: " .. tostring(key)),
            }
        end
    end
    local parent_id: string? = nil
    if raw.parent_id ~= nil then
        if type(raw.parent_id) ~= "string" then
            return http.STATUS.BAD_REQUEST, {
                success = false,
                error = api_errors.error("invalid_input", "parent_id must be a string"),
            }
        end
        if raw.parent_id ~= "" then parent_id = raw.parent_id :: string end
    end
    if raw.input_overrides ~= nil and type(raw.input_overrides) ~= "table" then
        return http.STATUS.BAD_REQUEST, {
            success = false,
            error = api_errors.error("invalid_input", "input_overrides must be an object"),
        }
    end
    local imported, err = (engine or automations_lib).import_artifact(
        raw.artifact,
        parent_id,
        raw.input_overrides
    )
    if err or not imported then
        local status, payload = api_errors.status(err, "import_failed", "automation import failed")
        return status, { success = false, error = payload }
    end
    return http.STATUS.OK, {
        success = true,
        id = imported.id,
        type = imported.type,
        created = imported.created,
    }
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() then
        local status, body = M.response_for(nil, nil)
        res:set_status(status)
        res:write_json(body)
        return
    end
    local body: any = nil
    if req:has_body() then
        local parsed, parse_err = req:body_json()
        if parse_err then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({
                success = false,
                error = api_errors.error("invalid_json", "invalid JSON: " .. parse_err:message()),
            })
            return
        end
        body = parsed
    end
    local status, response = M.response_for(security.actor(), body)
    res:set_status(status)
    res:write_json(response)
end

M.handler = handler
return M
