local M: any = {}
function M.reset(route, stage, source)
    M.route, M.stage, M.source = route, stage, source
    M.missing, M.value, M.rollback_error = false, nil, nil
    M.rollbacks, M.commits = 0, 0
end
local function result(stage, value)
    if M.stage == stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.db_id() return "app:db" end
function M.get(...): any
    local db: any = {}
    function db:type() return "sqlite", nil end
    function db:release() return true, nil end
    function db:begin()
        local tx: any = {}
        function tx:commit() M.commits = M.commits + 1; return result("commit", true) end
        function tx:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_error end
        return result("begin", tx)
    end
    return db, nil
end
function M.carried_identity_error(...) return nil end
function M.owner_locator_error(...) return nil end
function M.identity_parts(params, id) return params.job_identity, nil end
function M.enqueue_job(...) return result("operation", "job") end
function M.cancel_job_tx(...) local value, err = result("operation", 1); return value, err, {} end
function M.complete_tx(...) return result("operation", {owner_locator = {kind = "thread", id = "owner"}}) end
function M.nudge_workers(...) return true, nil end
function M.notify_cancellations(...) return nil end
function M.notify(...) return nil end
return M
