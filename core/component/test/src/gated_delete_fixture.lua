local M: any = {}
M.ACCESS = {DELETE = 8}
function M.reset(stage, source)
    M.stage, M.source, M.abandon_source, M.absent = stage, source, nil, false
    M.reads, M.begins, M.cleanups, M.abandons, M.unregisters = 0, 0, 0, 0, 0
end
function M.actor() return {id = function() return "actor" end} end
function M.scope() return {} end
function M.reader()
    local reader: any = {}
    function reader:with_user(id) M.user = id; return self end
    function reader:with_components(id) M.id = id; return self end
    function reader:with_access_mask(mask) M.mask = mask; return self end
    function reader:include_options(options) M.options = options; return self end
    function reader:one()
        M.reads = M.reads + 1
        if M.stage == "read" then return nil, M.source end
        if M.absent then return nil, nil end
        return {component_id = "component", impl_id = "fixture:implementation"}, nil
    end
    return reader
end
function M.begin_delete(id, user, policy)
    M.begins = M.begins + 1; M.policy = policy
    if M.stage == "access_check" or M.stage == "access" or M.stage == "commit" then
        return false, M.stage, M.source, true
    end
    return true, nil, nil, true
end
function M.run_deletable()
    M.cleanups = M.cleanups + 1
    if M.stage == "cleanup" or M.stage == "pending" then return true, false, M.source end
    return false, false, nil
end
function M.abandon_delete() M.abandons = M.abandons + 1; return M.abandon_source end
function M.unregister()
    M.unregisters = M.unregisters + 1
    local result = {component_id = "component", deleted = true, changes_made = true}
    if M.stage == "purge" then return result, "purge", M.source end
    return result, nil, nil
end
return M
