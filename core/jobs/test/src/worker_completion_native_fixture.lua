local M: any = {}
function M.reset(operation, stage, source)
    M.operation, M.stage, M.source = operation, stage, source
    M.primary, M.missing = nil, false
    M.trace, M.rollbacks, M.commits, M.notifications = {}, 0, 0, 0
    M.already, M.settled = false, false
end
function M.result(stage, value)
    M.trace[#M.trace + 1] = stage
    if stage == M.stage then
        if M.missing then return nil, nil end
        return nil, M.source
    end
    if M.primary and (stage == "transition" or stage == "failure") then return nil, M.primary end
    return value, nil
end
function M.database(): any
    local tx = {
        rollback = function() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end,
        commit = function() M.commits = M.commits + 1; return M.result("commit", true) end,
    }
    return {begin = function() return M.result("begin", tx) end}
end
return M
