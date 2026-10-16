local security = require("security")

local M = {}
function M.can_notify(user_id: string): boolean
    local actor = security.actor()
    if actor and actor:id() == user_id then return true end
    return security.can("realtime.notify", "kickside.realtime:user:" .. user_id) == true
        or security.can("realtime.notify", "kickside.realtime:notify") == true
end
return M
