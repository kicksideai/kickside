local M: any = {}
function M.reset(mode, stage, source, dialect)
    M.mode, M.stage, M.source, M.dialect = mode, stage, source, dialect
    M.missing, M.proof, M.secondary, M.writes, M.rollbacks, M.commits = false, nil, nil, 0, 0, 0
    M.owner_rows = {{owner_kind = "test", owner_id = "owner"}}
    M.fence_calls, M.writes_at_fence, M.fence_id = 0, nil, nil
end
function M.result(stage, value): (any, error?)
    if stage == M.stage then
        if M.missing then return M.proof, nil end
        if M.source then return nil, M.source end
    end
    return value, nil
end
function M.executor(): any
    return {
        query = function(self, statement, parameters) return M.result("owner", M.owner_rows) end,
        begin = function() return M.result("begin", M.transaction()) end,
        type = function() return M.result("dialect", M.dialect) end,
    }
end
function M.transaction(): any
    return {
        execute = function(self, stage)
            M.writes = M.writes + 1
            return M.result(stage, {rows_affected = 1})
        end,
        rollback = function()
            M.rollbacks = M.rollbacks + 1
            return true, M.secondary
        end,
        commit = function()
            M.commits = M.commits + 1
            return M.result("commit", true)
        end,
    }
end
function M.lock(tx, id): (any, error?)
    M.fence_calls, M.writes_at_fence, M.fence_id = M.fence_calls + 1, M.writes, id
    return M.result("fence", {started = true})
end
function M.clear(tx, id): error?
    local _, err = M.result("marker", true)
    return err
end
return M
