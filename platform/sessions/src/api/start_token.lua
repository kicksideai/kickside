local http = require("http")
local security = require("security")
local start_tokens = require("start_tokens")

-- Packs a session start-token so the UI can restart a chat as a fresh session
-- with the same agent + model. The import closure is only the session token
-- chain (start_tokens transitively imports its own `consts`), kept in its own
-- small pool so it never aliases a component chain's `consts` in a shared pool --
-- the same isolation kickside.agents.api:pack_start_token uses.
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

    local agent = data.agent
    if type(agent) ~= "string" or agent == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "agent is required" })
        return
    end

    local model = type(data.model) == "string" and data.model or ""
    local kind = (type(data.kind) == "string" and data.kind ~= "") and data.kind or "default"

    local token, pack_err = start_tokens.pack({ agent = agent, model = model, kind = kind })
    if pack_err or not token then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = pack_err or "failed to pack start token" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, token = token })
end

return { handler = handler }
