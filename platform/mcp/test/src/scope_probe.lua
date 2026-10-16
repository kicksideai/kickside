local security = require("security")

-- Harness probe: resolves a named scope by id UNDER whatever actor the caller binds
-- (funcs.new():with_actor(...):with_scope(...):call). Used to reproduce the deep-hop
-- condition where the MCP session scope is re-resolved under the synthesized no-groups
-- principal, so a unit test can prove a no-groups actor can bind it.
local function handler(args)
    local scope_id = type(args) == "table" and args.scope_id or ""
    local scope, err = security.named_scope(scope_id)
    local actor = security.actor()
    local groups = {}
    if actor then
        local meta = actor:meta() or {}
        if type(meta.security_groups) == "table" then groups = meta.security_groups end
    end
    return {
        ok = scope ~= nil and err == nil,
        err = err and tostring(err) or nil,
        actor_id = actor and tostring(actor:id()) or "",
        group_count = #groups,
        -- Under the bound scope: a control-plane action must be denied, an ordinary one allowed.
        can_registry_apply = security.can("registry.apply", "some:thing"),
        can_ordinary = security.can("funcs.call", "app:dummy_tool"),
    }
end

return { handler = handler }
