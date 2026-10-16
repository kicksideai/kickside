-- Session revocation delegates to the SQL transaction primitive. It never opens a
-- token-store handle: the token store and ownership index are two tables in the
-- same configured database and must change together.

local logger = require("logger")
local session_index = require("session_index")
local consts = require("user_consts")

local M = {}
local log = logger:named("session_revoker")

function M.run(request)
    if type(request) ~= "table" then
        return { success = false, revoked = 0, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "request" }
    end
    local user_id = request.user_id and tostring(request.user_id) or ""
    local token = request.token and tostring(request.token) or ""
    if user_id == "" and token == "" and request.group_ids == nil then
        return { success = false, revoked = 0, error = consts.ERROR.MISSING_REQUIRED_FIELD .. "user_id or token" }
    end

    local result, err
    if request.group_ids ~= nil then
        result, err = session_index.invalidate_groups(request.group_ids, {
            allow_only = request.allow_only == true, preserve_sessions = request.preserve_sessions == true,
            previous_group_rules = request.previous_group_rules,
        })
    elseif user_id ~= "" then
        result, err = session_index.invalidate_user(user_id)
    else
        result, err = session_index.invalidate_token(token)
    end
    if err then
        return { success = false, revoked = 0, user_id = user_id ~= "" and user_id or nil, error = tostring(err) }
    end
    log:info(request.preserve_sessions == true and "delegations fenced" or "sessions invalidated", {
        user_id = result and result.user_id or (user_id ~= "" and user_id or nil),
        reason = tostring(request.reason or "unspecified"),
        revoked = result and result.revoked or 0,
    })
    return {
        success = true,
        revoked = result and result.revoked or 0,
        user_id = result and result.user_id or (user_id ~= "" and user_id or nil),
    }
end

return M
