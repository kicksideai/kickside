local security = require("security")
local ctx = require("ctx")

local function handler(input: any): any
    input = type(input) == "table" and input or {}
    local actor = security.actor()
    return {
        actor_id = actor and actor:id() or nil,
        to_agent_id = ctx.get("to_agent_id"),
        from_agent_id = ctx.get("from_agent_id"),
        workspace_id = ctx.get("workspace_id"),
        host_kind = ((ctx.get("agent_run") or {}).host or {}).kind,
        call_id = ctx.get("call_id"),
        message = input.message,
    }
end

return { handler = handler }
