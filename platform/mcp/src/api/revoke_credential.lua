-- POST /mcp/credentials/{id}/revoke — revoke one of the current actor's credentials.
-- Actor-gated here; the repo deactivates the row so the token stops resolving.

local http = require("http")
local security = require("security")
local repo = require("mcp_repo")

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

    local credential_id = req:param("id")
    if not credential_id or credential_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "credential id is required" })
        return
    end

    local cred, gerr = repo.get(credential_id)
    if gerr then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(gerr) })
        return
    end
    if not cred or (cred :: any).actor_id ~= actor:id() then
        -- Do not distinguish "not found" from "not yours".
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "credential not found" })
        return
    end

    local ok, rerr = repo.revoke(credential_id, actor:id())
    if not ok then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(rerr) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, credential_id = credential_id })
end

return { handler = handler }
