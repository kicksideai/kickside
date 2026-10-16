local M: any = {}
function M.reset(stage, source)
    M.stage, M.source, M.calls, M.actor, M.scope, M.context, M.request = stage, source, 0, nil, nil, nil, nil
    M.find_calls = 0
end
function M.get(id)
    if M.stage == "registry" then return nil, M.source end
    if M.stage == "absent" then return nil, errors.new({kind = errors.NOT_FOUND, retryable = false, message = "implementation entry is absent"}) end
    return {id = id, data = {contracts = {{contract = "kickside.contract:deletable"}}}}, nil
end
function M.can(action, resource)
    M.action, M.resource = action, resource
    if M.stage == "authorization" then error(M.source) end
    return M.stage ~= "denied", nil
end
function M.find(filter)
    M.find_calls = M.find_calls + 1
    M.filter = filter
    if M.stage == "registry" then return nil, M.source end
    if M.stage == "absent" then return {}, nil end
    return {{id = filter[".id"], data = {contracts = {{contract = "kickside.contract:deletable"}}}}}, nil
end
function M.contract_get()
    if M.stage == "contract" then return nil, M.source end
    local definition: any = {}
    function definition:with_actor(actor)
        M.actor = actor
        if M.stage == "actor" then return nil, M.source end
        return self, nil
    end
    function definition:with_scope(scope)
        M.scope = scope
        if M.stage == "scope" then return nil, M.source end
        return self, nil
    end
    function definition:open(impl, context)
        M.impl, M.context = impl, context
        if M.stage == "open" then return nil, M.source end
        local instance: any = {}
        function instance:delete(request)
            M.calls = M.calls + 1; M.request = request
            if M.stage == "delete" then return nil, M.source end
            if M.stage == "reported" then return {success = false, error = M.source}, nil end
            return {success = true}, nil
        end
        return instance, nil
    end
    return definition, nil
end
return M
