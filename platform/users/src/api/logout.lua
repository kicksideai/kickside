local http = require("http")
local json = require("json")
local security = require("security")
local revocation = require("revocation")

-- POST /user/logout — ends the caller's own session.
--
-- The presented bearer token is revoked in the token store, so it stops
-- authenticating immediately rather than lingering until its 24h expiry. Body
-- {"all": true} revokes every session the account holds, which is what a user
-- reaching for "log out everywhere" after a suspected compromise needs.
--
-- Revocation itself runs in kickside.users.persist:session_revoker, which carries
-- its own actor and policies; this handler stays unprivileged and only passes the
-- caller's identity and token along.

local function bearer_token(req)
    local header = req:header("Authorization")
    if type(header) ~= "string" or header == "" then
        return nil
    end
    -- "Bearer <token>", case-insensitive scheme, trailing whitespace trimmed.
    local token = header:match("^[Bb][Ee][Aa][Rr][Ee][Rr]%s+(.-)%s*$")
    if not token or token == "" then
        return nil
    end
    return token
end

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

    local all = false
    local body = req:body()
    if body and body ~= "" then
        local data, err = json.decode(body)
        if err then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid JSON: " .. err })
            return
        end
        all = data ~= nil and data.all == true
    end

    local result, revoke_err
    if all then
        -- Every session for this account, including this one.
        result, revoke_err = revocation.revoke_user(tostring(actor:id()), "logout_all")
    else
        local token = bearer_token(req)
        if not token then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "no bearer token presented" })
            return
        end
        result, revoke_err = revocation.revoke_token(token, "logout")
    end

    if revoke_err or not result then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            success = false,
            error = "logout failed",
            details = tostring(revoke_err or "revocation failed"),
        })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        revoked = result.revoked or 0,
        all_sessions = all,
    })
end

return { handler = handler }
