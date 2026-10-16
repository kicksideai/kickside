local http = require("http")
local json = require("json")
local security = require("security")
local admin_repo = require("admin_repo")
local group_validation = require("group_validation")
local error_response = require("error_response")

local M = {}

local STATUS_BAD_REQUEST: integer = 400
local STATUS_INTERNAL_ERROR: integer = 500
local STATUS_OK: integer = 200

-- process resolves the {id} path param (user_id OR email) to the canonical user_id
-- and applies the requested field updates. Returns (status, body) the HTTP shell
-- writes verbatim. An unknown identifier is a 404, not a repo 500.
function M.process(identifier: string?, body: string?): (integer, any)
    if not identifier or identifier == "" then
        return STATUS_BAD_REQUEST, { success = false, error = "User ID is required" }
    end

    if not body or body == "" then
        return STATUS_BAD_REQUEST, { success = false, error = "Request body is required" }
    end

    local data, err = json.decode(body)
    if err then
        return STATUS_BAD_REQUEST, { success = false, error = "Invalid JSON: " .. err }
    end

    local update_data: { [string]: any } = {}
    if data.email and data.email ~= "" then
        update_data.email = data.email
    end
    if data.full_name and data.full_name ~= "" then
        update_data.full_name = data.full_name
    end
    if data.status and data.status ~= "" then
        update_data.status = data.status
    end
    if data.password and data.password ~= "" then
        update_data.password = data.password
    end

    local groups = data.groups
    if groups ~= nil then
        local valid, validation_err, internal = group_validation.validate(groups)
        if not valid then
            return internal and STATUS_INTERNAL_ERROR or STATUS_BAD_REQUEST,
                error_response.body(validation_err)
        end
    end

    if not next(update_data) and groups == nil then
        return STATUS_BAD_REQUEST, { success = false, error = "No fields to update" }
    end

    local result, update_err = admin_repo.update(identifier, update_data, groups)
    if update_err then
        return error_response.status(update_err), error_response.body(update_err)
    end

    return STATUS_OK, { success = true, result = result }
end

function M.handler()
    local req = http.request()
    local res = http.response()

    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", "kickside.users.api:update_user.endpoint") then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local status, body = M.process(req:param("id"), req:body())
    res:set_status(status)
    res:write_json(body)
end

return M
