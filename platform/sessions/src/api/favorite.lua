local http = require("http")
local security = require("security")
local session_writer = require("session_writer")
local session_repo = require("session_repo")
local http_errors = require("http_errors")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local session_writer = deps.session_writer or session_writer
    local session_repo = deps.session_repo or session_repo

-- Toggle a session's favorite flag. There is no favorite column; the flag lives
-- in the session's public_meta (the per-session client-facing metadata the list
-- API already returns), set through the standard session writer. The current
-- public_meta is read first so other keys are preserved, and last_message_date
-- is passed back unchanged so favoriting never reorders the list (update_meta
-- otherwise bumps it to now).
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local data, err = req:body_json()
    if err or type(data) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end

    local session_id = data.session_id
    if type(session_id) ~= "string" or session_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "session_id is required" })
        return
    end
    if type(data.favorite) ~= "boolean" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "favorite must be a boolean" })
        return
    end

    -- Ownership is enforced by the repo (returns nil for another user's session).
    local session, get_err = session_repo.get(session_id, actor:id())
    if get_err then
        res:set_status((http_errors.classify(get_err)))
        res:write_json({ success = false, error = tostring(get_err) })
        return
    end
    if not session then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "session not found" })
        return
    end

    local public_meta = (type(session.public_meta) == "table") and session.public_meta or {}
    public_meta.favorite = data.favorite or nil

    local writer, werr = session_writer.new(session_id)
    if werr or not writer then
        local status = http_errors.classify(werr)
        local msg = tostring(werr or "session not found")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local updates: { [string]: any } = { public_meta = public_meta }
    if type(session.last_message_date) == "number" then
        updates.last_message_date = session.last_message_date
    end

    local _, uerr = writer:update_meta(updates)
    if uerr then
        res:set_status((http_errors.classify(uerr)))
        res:write_json({ success = false, error = tostring(uerr) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, favorite = data.favorite })
end

return { handler = handler }
end

local default = new()
default.new = new
return default
