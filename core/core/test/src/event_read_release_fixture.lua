local M = {}
function M.reset(stage: string, source: error?, secondary: error?)
    M.stage, M.source, M.secondary, M.opens, M.reads, M.releases, M.authorizations = stage, source, secondary, 0, 0, 0, 0
end
function M.open_db()
    M.opens = M.opens + 1
    if M.stage == "open" then return nil, M.source end
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "release" then return nil, M.source end
        return nil, M.secondary
    end}, nil
end
function M.read(...)
    M.reads = M.reads + 1
    if M.stage == "read" then return nil, M.source end
    if M.stage == "missing" then return nil, nil end
    return {thread_id = "thread", thread_class = "workspace-class", max_pruned_seq = 2, next_seq = 3, events = {}, id = "event"}, nil
end
function M.can(...)
    M.authorizations = M.authorizations + 1
    if M.stage == "denied" then return false end
    return true
end
return M
