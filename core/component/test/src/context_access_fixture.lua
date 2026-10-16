local M: any = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source, M.reads, M.opens, M.actors, M.scope_calls = stage, source, 0, 0, 0, 0
end
function M.actor()
    M.actors = M.actors + 1
    if M.stage == "actor" then return nil, M.source end
    return {id = function()
        if M.stage == "actor_id" then return nil, M.source end
        return "11111111-1111-4111-8111-111111111111", nil
    end}, nil
end
function M.scope()
    M.scope_calls = M.scope_calls + 1
    if M.stage == "scope" then return nil, M.source end
    return {}, nil
end
function M.normalize_access_mask(value: integer?, default: integer?): (integer?, error?)
    if M.stage == "mask" then return nil, M.source end
    return value or default, nil
end
function M.new()
    local reader: any = {}
    for _, name in ipairs({"with_user", "with_components", "with_access_mask", "include_options", "with_meta", "limit"}) do reader[name] = function(self, ...) return self end end
    function reader:one()
        M.reads = M.reads + 1
        return {component_id = "component", impl_id = "implementation", access_level = 15, private_context = {marker = "kept"}, context_revision = 9}, nil
    end
    function reader:all() local value, err = self:one(); return {value}, err end
    return reader
end
function M.get(...)
    M.opens = M.opens + 1
    local instance: any = {}
    function instance:with_actor(...) return self, nil end
    function instance:with_scope(...) return self, nil end
    function instance:open(...) return self, nil end
    function instance:get_access_context(...)
        M.reads = M.reads + 1
        return {success = true, access_level = 15, impl_id = "implementation", context = {marker = "kept"}}, nil
    end
    function instance:get_access_context_by_meta(...) return self:get_access_context(...) end
    return instance, nil
end
return M
