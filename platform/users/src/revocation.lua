-- Logout-side adapter for the session revoker's dedicated database actor.
-- Account mutations revoke inside their own persistence transactions; this adapter
-- is only for explicit single-session and logout-all requests.

local funcs = require("funcs")
local logger = require("logger")

local M = {}

local REVOKER = "kickside.users.persist:session_revoker"

local log = logger:named("revocation")

local function call(request, description)
    local result, call_err = funcs.new():call(REVOKER, request)
    if call_err or not result or result.success ~= true then
        local detail = tostring(call_err or (result and result.error) or "revocation failed")
        -- Explicit logout cannot roll back another domain mutation. Keep the
        -- failure visible and let the endpoint fail closed.
        log:error("session revocation failed", {
            target = description,
            reason = tostring(request.reason or "unspecified"),
            error = detail,
        })
        return nil, detail
    end
    return result, nil
end

-- revoke_user ends every session the account holds for logout-all.
---@param user_id string
---@param reason string
function M.revoke_user(user_id, reason)
    if not user_id or user_id == "" then
        return nil, "user_id is required"
    end
    return call({ user_id = tostring(user_id), reason = reason }, tostring(user_id))
end

-- revoke_token ends exactly one session.
---@param token string
---@param reason string
function M.revoke_token(token, reason)
    if not token or token == "" then
        return nil, "token is required"
    end
    return call({ token = tostring(token), reason = reason }, "single session")
end

return M
