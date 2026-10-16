local M: any = {}
function M.reset(stage, source)
    M.stage, M.source, M.abandon_source, M.absent = stage, source, nil, false
    M.reads, M.begins, M.cleanups, M.abandons, M.unregisters = 0, 0, 0, 0, 0
end
function M.reader()
    local reader: any = {}
    function reader:with_components(id) M.id = id; return self end
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
    M.begins = M.begins + 1; M.user, M.policy = user, policy
    if M.stage == "preflight" then return false, "transaction", M.source, true end
    return true, nil, nil, true
end
function M.run_deletable(...) M.cleanups = M.cleanups + 1
    if M.stage == "cleanup" then return true, false, M.source end
    return true, true, nil
end
function M.abandon_delete(...) M.abandons = M.abandons + 1; return M.abandon_source end
function M.unregister(...) M.unregisters = M.unregisters + 1
    if M.stage == "unregister" then return nil, "transaction", M.source end
    if M.stage == "pending" then return nil, "pending", M.source end
    if M.stage == "purge" then return 1, "purge", M.source end
    return 1, nil, nil
end
return M
