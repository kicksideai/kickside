local M: any = {}
function M.reset(operation, stage, source, dialect)
    M.operation, M.stage, M.source, M.dialect = operation, stage, source, dialect
    M.primary, M.missing, M.proof = nil, false, nil
    M.trace, M.rollbacks, M.commits, M.releases = {}, 0, 0, 0
    M.count, M.release_error = 1, nil
end
function M.result(stage, value)
    M.trace[#M.trace + 1] = stage
    if stage == M.stage then
        if M.missing then return M.proof, nil end
        if M.source then return nil, M.source end
    end
    if stage == "worker" and M.primary then return nil, M.primary end
    return value, nil
end
function M.transaction(): any
    return {
        rollback = function() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end,
        commit = function() M.commits = M.commits + 1; return M.result("commit", true) end,
    }
end
function M.database(): any
    return {
        begin = function() return M.result("begin", M.transaction()) end,
        type = function() return M.result("dialect", M.dialect) end,
        release = function() M.releases = M.releases + 1; return true, M.release_error end,
    }
end
function M.builder(operation, table_name): any
    local query = {}
    function query:set(...) return self end
    function query:set_map(...) return self end
    function query:suffix(...) return self end
    function query:where(...) return self end
    function query:run_with(tx) return self end
    function query:exec()
        local stage = operation == "update" and "update" or (table_name == "kickside_job_worker" and "worker" or "registration")
        return M.result(stage, {rows_affected = M.count})
    end
    return query
end
return M
