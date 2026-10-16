-- POST /ui/splash/{id}/seen — record that the caller has seen a splash, in its
-- scope: the caller's profile for a user splash, the instance completion setting
-- for an instance splash (the splash library enforces the audience and admin
-- write gates). The state-revealing read rides the authed /nav/list.

local http = require("http")
local splash = require("splash")

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local id = req:param("id")
    -- POST /{id}/seen marks one splash seen. DELETE clears: with an id it un-sees
    -- that splash (replay one); without an id (/ui/splash/seen) it resets instance
    -- setup for admins (the Appearance "Show setup again" action).
    local method = tostring(req:method() or "POST"):upper()
    local ok, err
    if method == "DELETE" then
        if type(id) == "string" and id ~= "" then
            ok, err = splash.mark_unseen(id)
        else
            ok, err = splash.reset()
        end
    else
        ok, err = splash.mark_seen(id)
    end
    if not ok then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = err })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true })
end

return { handler = handler }
