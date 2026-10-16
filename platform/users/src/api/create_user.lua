local http = require("http")
local json = require("json")
local security = require("security")
local admin_repo = require("admin_repo")
local group_validation = require("group_validation")
local consts = require("consts")
local default_groups = require("default_groups")
local error_response = require("error_response")

local function handler()
    local req = http.request()
    local res = http.response()
    res:set_content_type(http.CONTENT.JSON)
    if not security.actor() or not security.can("access", "kickside.users.api:create_user.endpoint") then
        res:set_status(http.STATUS.FORBIDDEN)
        res:write_json({ success = false, error = "access denied" })
        return
    end

    local body = req:body()
    if not body or body == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Request body is required" })
        return
    end

    local data, err = json.decode(body)
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON: " .. err })
        return
    end

    if type(data.email) ~= "string" or data.email == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Email is required" })
        return
    end

    if type(data.password) ~= "string" or data.password == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Password is required" })
        return
    end

    -- Optional fields must be strings when present; they flow straight to the repo.
    if data.full_name ~= nil and type(data.full_name) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "full_name must be a string" })
        return
    end
    if data.status ~= nil and type(data.status) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "status must be a string" })
        return
    end
    if data.user_id ~= nil and type(data.user_id) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "user_id must be a string" })
        return
    end

    -- Caller-supplied groups must come from the caller's assignable catalog; the
    -- declared new-account defaults are application declarations, not input.
    local groups = data.groups
    if groups == nil then
        local defaults_err
        groups, defaults_err = default_groups.resolve(consts.get_config().default_group_id)
        if defaults_err then
            res:set_status(http.STATUS.INTERNAL_ERROR)
            res:write_json({ success = false, error = defaults_err })
            return
        end
    else
        local valid, validation_err, internal = group_validation.validate(groups)
        if not valid then
            res:set_status(internal and http.STATUS.INTERNAL_ERROR or http.STATUS.BAD_REQUEST)
            res:write_json(error_response.body(validation_err))
            return
        end
    end

    -- Account and memberships are one transaction: a group failure never leaves a
    -- half-created account that collides when the administrator retries.
    local result, err = admin_repo.create({
        user_id = data.user_id,
        email = data.email,
        full_name = data.full_name or "",
        password = data.password,
        status = data.status or "active",
    }, groups)

    if err then
        res:set_status(error_response.status(err))
        res:write_json(error_response.body(err))
        return
    end

    res:set_status(http.STATUS.CREATED)
    res:write_json({ success = true, user = result })
end

return { handler = handler }
