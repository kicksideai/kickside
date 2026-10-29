local config = require("config")
local M: any = {FAIRNESS_TIERS = {"live", "backfill", "maintenance"}}
function M.reset(route, phase, source)
    M.route, M.phase, M.source = route, phase, source
    M.commits, M.rollbacks, M.updates, M.rollback_error = 0, 0, 0, nil
    M.empty, M.missing, M.value = false, false, nil
end
function M.result(phase, value)
    if M.phase == phase then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.job()
    return {id = "job", owner_kind = "thread", owner_id = "owner", queue_tier = "live", status = "pending", attempts = 0, execution_seq = 0, concurrency_key = "key", scheduled_at = "2026-10-10 00:00:00", job_type = "app:worker"}
end
function M.policy(...) return M.result("policy", {lease_timeout_seconds = 30, max_row_bytes = 1000, worker_claim_batch = 1, fairness_shares = {live = 1, backfill = 0, maintenance = 0}}) end
function M.distribute_shares(...) return {live = 1, backfill = 0, maintenance = 0}, 1 end
function M.now_string(...) return "2026-10-10 00:00:00" end
M.future_string = M.now_string
function M.check_update(...) local _, err = M.result("size", true); return err end
function M.lock_many(...) return M.result("fence", {owner = {started = M.phase == "cancel"}}) end
function M.cancel_job_tx(...) return M.result("cancel", 1) end
function M.start_job_run(...) return M.result("history", {id = "run"}) end
function M.rows_affected(result) return result and tonumber(result.rows_affected) or 0 end
function M.builder(...): any
    local q: any = {}
    for _, method in ipairs({"from", "where", "order_by", "limit", "suffix", "run_with", "set"}) do q[method] = function(self, ...) return self end end
    function q:query() return M.result("select", M.empty and {} or {M.job()}) end
    function q:exec() return M.result("mark", {rows_affected = 1}) end
    return q
end
function M.database(): any
    local db: any = {}
    function db:query(statement, ...)
        local phase, rows
        if statement:find("WITH ordered AS", 1, true) then phase, rows = "keylock", {{concurrency_key = "key", acquired = true}}
        elseif statement:find("SELECT concurrency_key FROM", 1, true) then phase, rows = "keyrecheck", {}
        elseif statement:find("UPDATE kickside_job SET status", 1, true) then
            phase, rows = "lease", M.empty and {} or {{attempts = 1, execution_seq = 1}}; M.updates = M.updates + 1
        elseif statement:find("SELECT COUNT", 1, true) then phase, rows = "backlog", {{n = 1, age_ms = 0, overdue = 0}}
        elseif statement:find("AS candidates ORDER", 1, true) then phase, rows = "candidates", {M.job()}
        else phase, rows = "joblock", {M.job()} end
        return M.result(phase, rows)
    end
    function db:execute(statement, ...)
        local phase = statement == "SAVEPOINT kickside_claim_row" and "savepoint" or statement == "ROLLBACK TO SAVEPOINT kickside_claim_row" and "undo" or "release"
        if M.phase == "undo" and phase == "savepoint" then M.empty = true end
        return M.result(phase, {rows_affected = 0})
    end
    function db:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    function db:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_error end
    function db:begin() return M.result("begin", M.database()) end
    return db
end
M.capture = config.capture
M.resolve_from = M.policy
return M
