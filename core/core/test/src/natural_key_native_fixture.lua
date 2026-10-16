local M: any = {}
function M.reset(operation, stage, source, dialect, key, legacy)
    M.operation, M.stage, M.source, M.dialect = operation, stage, source, dialect
    M.key, M.legacy, M.primary = key, legacy, nil
    M.queries, M.writes, M.rollbacks, M.commits = 0, 0, 0, 0
end
function M.result(stage, value)
    if stage == M.stage then return nil, M.source end
    if stage == "lock" and M.primary then return nil, M.primary end
    return value, nil
end
function M.database(): any
    local db: any = {}
    function db:type() return M.result("dialect", M.dialect) end
    function db:begin() return M.result("begin", self) end
    function db:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end
    function db:execute(statement, parameters)
        M.writes = M.writes + 1
        local stage = (M.operation == "lock" or M.operation == "resolve") and "lock" or "write"
        return M.result(stage, {rows_affected = 1})
    end
    function db:query(statement, parameters)
        M.queries = M.queries + 1
        if M.operation == "resolve" or M.operation == "resolve_v2" then
            if M.queries == 1 then return M.result("initial", {}) end
            if M.operation == "resolve_v2" then return M.result("binding", {{key_digest = "bound"}}) end
            return M.result("binding", {})
        end
        if M.operation == "capture" then
            if M.queries == 1 then return M.result("mapped", {}) end
            return M.result("thread", {{id = M.legacy, thread_class = M.key.class, attrs = "{}",
                component_id = M.legacy, backing_id = M.legacy}})
        end
        return M.result("lookup", {{key_class = M.key.class, key_ref = M.key.ref, thread_id = M.legacy,
            id = M.legacy, component_id = M.legacy, backing_id = M.legacy}})
    end
    return db
end
return M
