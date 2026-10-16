local M: any = {}
function M.reset(stage, source)
    M.stage, M.source, M.missing = stage, source, false
    M.lookups, M.actors, M.scopes, M.opens, M.emits = 0, 0, 0, 0, 0
    M.actor = {id = function() return "singleton-owner" end}; M.scope = {marker = "ambient"}
end
local binding: any = {}
function binding:with_actor(actor)
    M.actors = M.actors + 1; M.bound_actor = actor
    if M.stage == "actor" then if M.missing then return nil, nil end; return self, M.source end
    return self, nil
end
function binding:with_scope(scope)
    M.scopes = M.scopes + 1; M.bound_scope = scope
    if M.stage == "scope" then if M.missing then return nil, nil end; return self, M.source end
    return self, nil
end
function binding:open(impl, context)
    M.impl, M.context = impl, context
    M.opens = M.opens + 1
    if M.stage == "open" then if M.missing then return nil, nil end; return self, M.source end
    return self, nil
end
function binding:emit(request)
    M.emits = M.emits + 1; M.request = request
    if M.stage == "emit" then return nil, M.source end
    return {accepted = true}, nil
end
function M.security_actor() return M.actor end
function M.security_scope() return M.scope end
function M.get(id)
    M.lookups = M.lookups + 1; M.contract_id = id
    if M.stage == "get" then
        if M.missing then return nil, nil end
        return nil, M.source
    end
    return binding, nil
end
return M
