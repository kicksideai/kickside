local http = require("http")
local json = require("json")
local security = require("security")
local link_service = require("link_service")
local consts = require("identity_consts")

-- POST: issue a fresh link code for the authenticated user. The user then proves
-- ownership of an external account by sending "link <code>" to the bot. An
-- optional agent_id in the body pins the DM's starting agent (validated against
-- the user's accessible agents); omitted -> the DM starts on the greeter.
local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, "no http context" end
    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local agent_id: string? = nil
    local raw_body = req:body()
    if type(raw_body) == "string" and raw_body ~= "" then
        local body, body_err = json.decode(raw_body)
        if body_err then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid json" })
            return
        end
        if type(body) == "table" and type((body :: any).agent_id) == "string" then
            agent_id = tostring((body :: any).agent_id)
        end
    end

    local code, err = link_service.generate_code(actor:id(), agent_id)
    if err or not code then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        code = code,
        expires_in_seconds = consts.CODE_TTL_SECONDS,
        instructions = "Send this to the bot in a DM: link " .. tostring(code),
    })
end

return { handler = handler }
