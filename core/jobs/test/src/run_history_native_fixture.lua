local M: any = {}
function M.reset(route, stage, source)
    M.route, M.stage, M.source = route, stage, source
    M.missing, M.value, M.rollback_error = false, nil, nil
    M.count, M.encoding, M.commits, M.rollbacks = route == "existing" and 0 or 1, 0, 0, 0
end
function M.result(stage, value)
    if M.stage == stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.policy(...) return M.result("policy", {max_row_bytes = 1000}) end
function M.now(...) return "2026-10-10 00:00:00" end
function M.format(...) return "2026-10-10 00:00:00" end
function M.check(...) local _, err = M.result("size", true); return err end
M.check_update = M.check
function M.encode_object(...)
    M.encoding = M.encoding + 1
    return M.result(M.encoding == 1 and "encode.result" or "encode.actions", "{}")
end
function M.database(): any
    local db: any = {}
    function db:execute(...) return M.result("insert", {rows_affected = M.count}) end
    function db:query(...) return M.result("read", {{id = "run", lease_token = "token", status = "running"}}) end
    function db:begin()
        local tx = M.database(); tx.db_type = function() return "sqlite" end
        function tx:commit() M.commits = M.commits + 1; return M.result("commit", true) end
        function tx:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_error end
        return M.result("begin", tx)
    end
    return db
end
function M.builder(...): any
    local query: any = {}
    function query:set(...) return self end
    function query:set_map(...) return self end
    function query:suffix(...) return self end
    function query:placeholder_format(...) return self end
    function query:where(...) return self end
    function query:run_with(...) return self end
    function query:to_sql() local result, err = M.result("build", "INSERT"); return result, {}, err end
    function query:exec() return M.result("update", {rows_affected = M.count}) end
    return query
end
return M
