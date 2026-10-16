-- GET /mcp/credentials — list the current actor's MCP credentials (never the token
-- hash). The raw token is only ever shown at mint; this returns prefixes, the
-- whitelisted component ids, traits, and status for management.

local http = require("http")
local security = require("security")
local repo = require("mcp_repo")
local public_url = require("public_url")

-- The public streamable-HTTP MCP endpoint on the configured public domain
-- (PUBLIC_API_URL, else the request's own host), the same value the create flow
-- shows. One endpoint serves every credential, so it is a single top-level field
-- as well as a per-row convenience.

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

    local rows, err = repo.list(actor:id())
    if not rows then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    -- Decode policy_json (allowed traits/tools) + whitelist_json for the UI; drop the
    -- raw json blobs.
    local url = public_url.mcp_url()
    local out = {}
    for _, r in ipairs(rows :: { any }) do
        local row: any = r
        row.policy_json = nil
        row.whitelist_json = nil
        row.mcp_url = url
        out[#out + 1] = row
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, credentials = out, mcp_url = url })
end

return { handler = handler }
