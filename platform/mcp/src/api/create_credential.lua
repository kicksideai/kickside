-- POST /mcp/credentials — mint an MCP credential for the current actor. The credential
-- runs AS that actor, confined to whitelist_component_ids (a few component subtrees);
-- an empty whitelist means the whole tree the actor can see. The mint validates the
-- actor can see each whitelisted component, so this handler just shapes input and
-- returns the raw token ONCE.
--   body: { whitelist_component_ids?, label?, allowed_trait_ids?, default_active_trait_ids?, agent_profile?, expires_at? }

local http = require("http")
local security = require("security")
local repo = require("mcp_repo")
local public_url = require("public_url")
local http_headers = require("mcp_http_headers")
local credential_policy = require("credential_policy")


local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return nil, "no http context" end
    http_headers.no_store(res)
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, berr = credential_policy.decode_request(raw, "create")
    if berr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(berr) })
        return
    end

    local policy = {
        allowed_tool_ids = body.allowed_tool_ids or {},
        allowed_trait_ids = body.allowed_trait_ids or {},
        default_active_trait_ids = body.default_active_trait_ids or {},
        agent_profile = body.agent_profile or {},
        preset = body.preset,
        restrict_traits = body.restrict_traits,
    }
    local result, err = repo.mint({
        whitelist_component_ids = body.whitelist_component_ids,
        label = body.label,
        expires_at = body.expires_at,
        policy = policy,
        context = body.context,
    })
    if not result then
        res:set_status(type(err) == "userdata" and err:kind() == errors.UNAVAILABLE
            and http.STATUS.INTERNAL_ERROR or http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local url = public_url.mcp_url()
    local credential = result :: any
    credential.mcp_url = url
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, credential = credential, mcp_url = url })
end

return { handler = handler }
