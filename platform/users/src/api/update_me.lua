local http = require("http")
local json = require("json")
local security = require("security")
local user_repo = require("user_repo")
local user_credentials_repo = require("user_credentials_repo")
local user_lifecycle_repo = require("user_lifecycle_repo")
local consts = require("consts")
local error_response = require("error_response")

-- PUT /user/me — the authenticated user updates their OWN profile. Self-service:
-- the target is derived from the security actor (never a path id), and only the
-- self-writable fields are accepted. Email, status, and group membership stay
-- admin-managed and are ignored here.
local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end
    local user_id = actor:id()
    if not user_id then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "unable to determine user identity" })
        return
    end

    local body = req:body()
    if not body or body == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "request body is required" })
        return
    end
    local data, err = json.decode(body)
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid JSON: " .. err })
        return
    end

    local update_data = {}
    if type(data.full_name) == "string" and data.full_name ~= "" then
        update_data.full_name = data.full_name
    end
    if type(data.password) == "string" and data.password ~= "" then
        update_data.password = data.password
    end

    if not next(update_data) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "no editable fields supplied" })
        return
    end

    -- Changing the password is a re-authentication event, not an ordinary profile edit.
    if update_data.password then
        local current = data.current_password
        if type(current) ~= "string" or current == "" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({
                success = false,
                error = "current_password is required to change your password",
            })
            return
        end

        local result, update_err = user_credentials_repo.update_self_password(user_id, current, update_data)
        if update_err then
            -- A concurrent credential/security change deliberately converges on
            -- the same response as a wrong current password.
            if update_err ~= consts.ERROR.INVALID_PASSWORD then
                res:set_status(http.STATUS.INTERNAL_ERROR)
                res:write_json(error_response.body(update_err))
                return
            end
            res:set_status(http.STATUS.UNAUTHORIZED)
            res:write_json({ success = false, error = "current password is incorrect" })
            return
        end

        res:set_status(http.STATUS.OK)
        res:write_json({
            success = true,
            user = { id = user_id, full_name = update_data.full_name },
            sessions_revoked = result.sessions_revoked or 0,
            reauthentication_required = true,
        })
        return
    end

    local result, uerr = user_lifecycle_repo.update(user_id, update_data)
    if uerr then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json(error_response.body(uerr))
        return
    end

    local response = { success = true, user = { id = user_id, full_name = update_data.full_name } }
    res:set_status(http.STATUS.OK)
    res:write_json(response)
end

return { handler = handler }
