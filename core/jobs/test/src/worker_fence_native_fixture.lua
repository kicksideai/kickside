local M: any = {NULL = {}}
function M.reset(stage, source)
    M.stage, M.source, M.rollbacks, M.commits, M.missing, M.value, M.secondary = stage, source, 0, 0, false, nil, nil
end
function M.result(stage, value)
    if M.stage == stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.policy(...) return M.result("policy", {max_row_bytes = 1000, lease_timeout_seconds = 30}) end
function M.future_string(...) return "future" end
function M.rows_affected(result) return result and tonumber(result.rows_affected) or 0 end
function M.check_update(...) local _, err = M.result("size", true); return err end
function M.clear(...) local _, err = M.result("marker", true); return err end
function M.builder(...): any
    local q: any = {}
    for _, name in ipairs({"set", "where", "run_with"}) do q[name] = function(self, ...) return self end end
    function q:exec() return M.result("update", {rows_affected = 1}) end
    return q
end
function M.database(): any
    local db: any = {}
    function db:begin() return M.result("begin", M.database()) end
    function db:type() return M.result("dialect", "sqlite") end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return true, M.secondary end
    function db:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    return db
end
function M.read(job)
    if job and type(job.lease_policy) == "table" then return job.lease_policy, nil end
    return M.policy()
end
function M.load_from(_, job) return M.read(job) end
return M
