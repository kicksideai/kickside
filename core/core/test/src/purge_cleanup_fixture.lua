local M: any = {}
function M.reset(stage, source, secondary, reply)
    M.stage, M.source, M.secondary, M.reply = stage, source, secondary, reply
    M.opens, M.purges, M.releases = 0, 0, 0
end
function M.open_db(): (any, error?)
    M.opens = M.opens + 1
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "release" then return false, M.source end
        if M.secondary then return false, M.secondary end
        return true, nil
    end}, nil
end
function M.purge_thread(...): (any, error?)
    M.purges = M.purges + 1
    if M.stage == "operation" then return nil, M.source end
    if M.stage == "reply" then return M.reply.value, nil end
    return {purged = true, discarded = {events = 3}}, nil
end
return M
