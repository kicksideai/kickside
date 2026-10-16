local native = require("native")
local M: any = {NULL = native.NULL}
function M.reset(stage, source)
    M.stage, M.source, M.primary = stage, source, nil
    M.missing, M.value, M.empty, M.running = false, nil, false, false
    M.rollbacks, M.commits, M.checks, M.markers, M.updates = 0, 0, 0, 0, 0
end
function M.result(stage, value)
    if stage == M.stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    if stage == "size" and M.primary then return nil, M.primary end
    return value, nil
end
function M.check_update(...): error?
    M.checks = M.checks + 1
    local _, err = M.result("size", true)
    return err
end
function M.cancel(...): error? return M.check_update(...) end
function M.clear(...): error?
    M.markers = M.markers + 1
    local _, err = M.result("marker", true)
    return err
end
function M.database(): any
    local db: any = {}
    function db:begin() return M.result("begin", self) end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return M.result("rollback", true) end
    function db:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    return db
end
function M.builder(): any
    local q: any = {}
    function q:from(...) return self end
    function q:where(...) return self end
    function q:limit(...) return self end
    function q:suffix(...) return self end
    function q:set(...) return self end
    function q:run_with(...) return self end
    function q:query()
        local rows = M.empty and {} or {{id = "job", status = M.running and "running" or "pending", lease_token = M.running and "token" or nil,
            execution_seq = 1}}
        return M.result("lookup", rows)
    end
    function q:exec()
        M.updates = M.updates + 1
        return M.result("update", {rows_affected = 1})
    end
    return q
end
return M
