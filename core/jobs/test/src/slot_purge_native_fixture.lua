local M: any = {}
function M.reset(stage, source, dialect)
    M.stage, M.source, M.dialect = stage, source, dialect
    M.primary, M.missing, M.value = nil, false, nil
    M.queries, M.writes, M.rollbacks, M.commits, M.releases = 0, 0, 0, 0, 0
    M.empty, M.running, M.remaining, M.continuation = false, false, false, false
    M.thread_owned, M.fences, M.fence_id, M.queries_at_fence = false, 0, nil, nil
end
function M.result(stage, value)
    if stage == M.stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    if stage == "slot" and M.primary then return nil, M.primary end
    return value, nil
end
function M.lock(tx, thread_id)
    M.fences = M.fences + 1
    M.fence_id, M.queries_at_fence = thread_id, M.queries
    return M.result("fence", {started = true})
end
function M.database(): any
    local db: any = {}
    function db:type() return M.result("dialect", M.dialect) end
    function db:begin() return M.result("begin", self) end
    function db:release() M.releases = M.releases + 1 end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end
    function db:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    function db:query(statement, parameters)
        M.queries = M.queries + 1
        local stages = M.dialect == "postgres" and {"slot", "job", "runs", "run_lock", "remaining", "next"}
            or {"slot", "job", "runs", "remaining", "next"}
        local stage = stages[M.queries]
        local value = {{id = "job", status = M.running and "running" or "parked",
            owner_kind = M.thread_owned and "thread" or "external", owner_id = "owner"}}
        if (stage == "slot" or stage == "job") and M.empty == stage then value = {} end
        if stage == "remaining" then value = M.remaining and {{id = "run"}} or {} end
        if stage == "next" then value = M.continuation and {{id = "job"}} or {} end
        return M.result(stage, value)
    end
    function db:execute(statement, parameters)
        M.writes = M.writes + 1
        return M.result(M.writes == 1 and "delete_runs" or "delete_job", {rows_affected = 1})
    end
    return db
end
return M
