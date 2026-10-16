-- Harness wrapper: runs the consent-time grant under the invoking actor, so the
-- OAuth suite can drive flow.grant (which mints via the ambient actor) through
-- the same principal invoke path the dispatcher uses.
local security = require("security")
local flow = require("mcp_oauth_flow")

local function handler(args)
    args = args or {}
    local actor = security.actor()
    local actor_id = actor and tostring(actor:id()) or ""
    local result, err = flow.grant(actor_id, args.params, args.mint)
    return { result = result, error = err and tostring(err) or nil }
end

return { handler = handler }
