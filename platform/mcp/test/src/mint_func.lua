-- Harness wrapper: mints a credential under whatever actor it is invoked as, so the
-- mint-validation suite can drive repo.mint() as a specific owner (via the dispatcher's
-- same with_actor invoke path) and assert the owner-visibility check on the whitelist.
local repo = require("mcp_repo")
local notifier = require("retention_notifier")

local function handler(args)
    local notify = notifier.notify
    local notifications = 0
    notifier.notify = function(change)
        notifications = notifications + 1
        return notify(change)
    end
    local ok, result, err = pcall(repo.mint,args)
    notifier.notify = notify
    if not ok then error(result) end
    return { result = result, error = err and tostring(err) or nil, notifications = notifications }
end

return { handler = handler }
