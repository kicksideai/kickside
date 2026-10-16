-- Manual Wippy Hub token management. An admin pastes a Hub registry token
-- (created at https://portal.wippy.ai/account/tokens); it is validated and
-- pushed to the runtime through the native hub.auth seam (no restart). Every
-- subsequent hub call resolves it, so private modules become listable and
-- installable. Writes are admin-only via the router firewall; status is read.

local http = require("http")
local json = require("json")
local hub = require("hub")
local logger = require("logger"):named("kickside.hub.auth")

-- The token seam (status/authenticate/logout) is a native runtime API on the hub
-- module that the typed surface does not yet declare; alias it once.
local hub_auth = (hub :: any).auth

-- GET /hub/auth — current token status. Never returns the token value.
local function status()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local st, err = hub_auth.status()
    if err then
        -- A status read must not hard-fail the UI: a token may be set but the
        -- registry unreachable. Report unauthenticated and surface the reason.
        logger:warn("hub.auth.status failed", { error = tostring(err) })
        res:set_status(http.STATUS.OK)
        res:write_json({ success = true, authenticated = false, auth_error = tostring(err) })
        return
    end

    -- Forward the native status verbatim (authenticated, registry, username,
    -- user_id, scope, expires_at, expired, orgs) so the UI can show the active
    -- identity and orgs. Never includes the token value.
    local out = st :: { [string]: any }
    out.success = true
    res:set_status(http.STATUS.OK)
    res:write_json(out)
end

-- POST /hub/auth { token } — validate and store the token at runtime.
local function authenticate()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, perr = json.decode(raw)
    if perr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    local token = (body :: { [string]: any }).token
    if type(token) ~= "string" or token == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "token required" })
        return
    end

    -- A malformed or expired token is not a transport error: hub.auth returns a
    -- status with authenticated=false, which the UI surfaces to the admin.
    local st, err = hub_auth.authenticate(token)
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local out = st :: { [string]: any }
    out.success = true
    res:set_status(http.STATUS.OK)
    res:write_json(out)
end

-- DELETE /hub/auth — clear the stored token.
local function logout()
    local res = http.response()
    if not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local _, err = hub_auth.logout()
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true })
end

return { status = status, authenticate = authenticate, logout = logout }
