local sql = require("sql")
local M: any = {}
local phases = {"workers", "fresh", "expired", "wake", "failed", "degraded", "control"}
function M.reset(stage, source)
    M.stage, M.source = stage, source
    M.missing, M.value, M.reads, M.releases = false, nil, 0, 0
end
local function result(stage, value)
    if M.stage == stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.db_id() return "app:db" end
function M.policy(...) return result("policy", {lease_timeout_seconds = 30, health_overdue_grace_ms = 1000}) end
function M.now(...) return "2026-10-10 00:00:00" end
function M.due_backlog(...) return result("backlog", {count = 0, oldest_age_ms = 0, overdue = 0}) end
function M.get(...): any
    local db: any = {}
    function db:type() return sql.type.SQLITE, nil end
    function db:release() M.releases = M.releases + 1; return true, nil end
    function db:query(...)
        M.reads = M.reads + 1
        local phase = phases[M.reads]
        local value: any = {{n = 0}}
        if phase == "workers" then value = {{id = "worker"}} end
        if phase == "fresh" then value = {{worker_id = "worker"}} end
        if phase == "control" then value = {{}} end
        return result(phase, value)
    end
    return db, nil
end
return M
