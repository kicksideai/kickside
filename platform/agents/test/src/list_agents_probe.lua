local security = require("security")
local list_agents = require("list_agents")

local function run(args)
    args = type(args) == "table" and args or {}
    local actor = security.actor()
    if not actor then
        return { status = 401 }
    end
    local payload, status = list_agents.list(actor, {
        required_class = args.class or "public",
        launch = args.launch == true,
    })
    return { status = status, payload = payload }
end

return { run = run }
