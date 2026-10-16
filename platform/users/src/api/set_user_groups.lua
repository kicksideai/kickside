local http = require("http")
local json = require("json")
local security = require("security")
local user_group_sources_repo = require("user_group_sources_repo")
local group_validation = require("group_validation")
local error_response = require("error_response")

local GATE = "kickside.users.api:set_user_groups.endpoint"

local M = {}

local STATUS_BAD_REQUEST: integer = 400
local STATUS_INTERNAL_ERROR: integer = 500
local STATUS_OK: integer = 200

-- process replaces a user's group set after validating every requested group id is
-- a known assignable scope. Returns (status, body) the HTTP shell writes verbatim.
function M.process(user_id: string?, body: string?): (integer, any)
    if not user_id or user_id == "" then
        return STATUS_BAD_REQUEST, { success = false, error = "User ID is required" }
    end

    if not body or body == "" then
        return STATUS_BAD_REQUEST, { success = false, error = "Request body is required" }
    end

    local data, err = json.decode(body)
    if err then
        return STATUS_BAD_REQUEST, { success = false, error = "Invalid JSON: " .. err }
    end

    local valid, validation_err, internal = group_validation.validate(data.groups)
    if not valid then
        return internal and STATUS_INTERNAL_ERROR or STATUS_BAD_REQUEST,
            error_response.body(validation_err)
    end

    local result, set_err = user_group_sources_repo.set_user_groups(user_id, data.groups)
    if set_err then
        return STATUS_INTERNAL_ERROR, error_response.body(set_err)
    end

    return STATUS_OK, { success = true, result = result }
end

function M.handler()
    local req = http.request()
    local res = http.response()

    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", GATE) then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local status, body = M.process(req:param("id"), req:body())
    res:set_status(status)
    res:write_json(body)
end

return M
