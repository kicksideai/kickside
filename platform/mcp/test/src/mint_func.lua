-- Harness wrapper: mints a credential under whatever actor it is invoked as, so the
-- mint-validation suite can drive repo.mint() as a specific owner (via the dispatcher's
-- same with_actor invoke path) and assert the owner-visibility check on the whitelist.
local repo = require("mcp_repo")

local function handler(args)
    local result, err = repo.mint(args)
    return { result = result, error = err and tostring(err) or nil }
end

return { handler = handler }
