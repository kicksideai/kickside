local security = require("security")
local mcp_security = require("mcp_security")

-- Harness probe: runs mcp_security.invoke under the actor and scope the caller
-- binds. The suite binds the public MCP endpoint's actor and policy set, so owner
-- resolution and tool execution run with exactly the endpoint's capabilities.
local function handler(args)
    local a = type(args) == "table" and args or {}
    local result, err = mcp_security.invoke(a.tool_id, a.tool_args or {}, a.principal, {})
    local actor = security.actor()
    return {
        ok = err == nil and result ~= nil,
        err = err and tostring(err) or nil,
        result = result,
        actor_id = actor and tostring(actor:id()) or "",
        can_registry_apply = security.can("registry.apply", "x:y"),
    }
end

return { handler = handler }
