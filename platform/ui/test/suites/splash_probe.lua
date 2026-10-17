-- Runs one splash library operation under the caller's actor and scope.

local security = require("security")
local splash = require("splash")

local function run(op: string, id: string?): any
    if op == "resolve" then
        local resolved, err = splash.resolve()
        if err then return nil, err end
        return { splash = resolved }
    end
    if op == "can_admin" then return { ok = security.can("access", "kickside.ui:system_onboarding") == true } end
    local ok, err
    if op == "mark_seen" then
        ok, err = splash.mark_seen(id)
    elseif op == "mark_unseen" then
        ok, err = splash.mark_unseen(id)
    elseif op == "reset" then
        ok, err = splash.reset()
    else
        error("unknown splash probe op " .. tostring(op))
    end
    return { ok = ok, err = err }
end

return { run = run }
