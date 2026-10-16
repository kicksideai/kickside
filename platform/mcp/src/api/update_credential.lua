-- PATCH /mcp/credentials/{id} — change a credential's label and/or policy (allowed
-- tools/traits, default active traits, agent profile) without re-minting. Each field
-- group is applied only when present, so a rename never wipes the policy. Actor-gated;
-- the token and whitelist are immutable here (re-mint to change those).
--   body: { label?, allowed_tool_ids?, allowed_trait_ids?, default_active_trait_ids?, agent_profile?, preset? }

local http = require("http")
local security = require("security")
local repo = require("mcp_repo")
local credential_policy = require("credential_policy")

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

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, berr = credential_policy.decode_request(raw, "patch")
    if berr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(berr) })
        return
    end

    local patch = {
        label = body.label,
        allowed_tool_ids = body.allowed_tool_ids,
        allowed_trait_ids = body.allowed_trait_ids,
        default_active_trait_ids = body.default_active_trait_ids,
        agent_profile = body.agent_profile,
        preset = body.preset,
        restrict_traits = body.restrict_traits,
    }
    local updated, uerr = repo.update_management(credential_id, actor:id(), patch)
    if uerr then
        res:set_status(type(uerr) == "userdata" and uerr:kind() == errors.INVALID
            and http.STATUS.BAD_REQUEST or http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(uerr) })
        return
    end
    if not updated then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = "credential not found" })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, credential_id = credential_id })
end

return { handler = handler }
