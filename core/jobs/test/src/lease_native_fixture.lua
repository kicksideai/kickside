local M: any = {}
function M.reset(route, stage, source)
    M.route, M.stage, M.source = route, stage, source
    M.missing, M.value, M.rollback_error = false, nil, nil
    M.rollbacks, M.commits, M.updates = 0, 0, 0
    M.count, M.renewal, M.empty = 1, 0, false
    M.deadline, M.spawn_args = "2026-10-10 00:00:30", nil
    M.future_seconds = nil
    M.releases, M.parses, M.selections, M.renewal_attempts, M.release_error = 0, 0, 0, 0, nil
end
function M.result(stage, value)
    if M.stage == stage then
        if M.missing then return M.value, nil end
        return nil, M.source
    end
    return value, nil
end
function M.policy(...) return M.result("policy", {lease_timeout_seconds = 30, lease_heartbeat_ms = 1000, max_row_bytes = 1000}) end
function M.process_host(...) return "app:process_host" end
function M.now_string(...) return "2026-10-10 00:00:00" end
function M.future_string(_, seconds) M.future_seconds = seconds; return "2026-10-10 00:00:30" end
function M.rows_affected(result) return tonumber(result and result.rows_affected) or 0 end
function M.check_update(...)
    M.renewal_attempts = M.renewal_attempts + 1
    if M.stage == "extend" then return M.source end
    local _, err = M.result("size", true); return err
end
function M.spawn_linked_monitored(target, host, args) M.spawn_args = args; return M.result("spawn", "lease-process") end
function M.database(): any
    local db: any = {}
    function db:begin()
        local tx: any = {}
        function tx:commit() M.commits = M.commits + 1; return M.result("commit", true) end
        function tx:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_error end
        return M.result("begin", tx)
    end
    function db:type() return M.result("dialect", "sqlite") end
    function db:release() M.releases = M.releases + 1; return true, M.release_error end
    function db:query(...) return M.result("read", M.empty and {} or {{needs_renewal = M.renewal, lease_until = M.deadline}}) end
    return db
end
function M.update(...): any
    local query: any = {}
    function query:set(...) return self end
    function query:where(...) return self end
    function query:run_with(...) return self end
    function query:exec() M.updates = M.updates + 1; return M.result("update", {rows_affected = M.count}) end
    return query
end
function M.db_id(...) return "fixture-database" end
function M.get(...) return M.result("database", M.database()) end
function M.notify(job_id, token, sequence, kind, until_at)
    return M.result(kind == "revoked" and "revocation" or "notify", true)
end
function M.read(job)
    if job and type(job.lease_policy) == "table" then return job.lease_policy, nil end
    return M.policy()
end
function M.load_from(_, job) return M.read(job) end
return M
