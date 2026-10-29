local M: any = {}
function M.reset(stage, source)
    M.stage, M.source, M.opens, M.releases, M.spawns = stage, source, 0, 0, 0
    M.settled, M.release_error, M.release_at = false, nil, nil
end
function M.result(stage, value)
    if M.stage == stage then return nil, M.source end
    return value, nil
end
function M.policy(...) return {proc_max_execution_ms = 1000}, nil end
function M.db_id(...) return "fixture-db" end
function M.process_host(...) return "fixture-host" end
function M.resolve_max_execution_ms(...) return 1000, nil end
M.PROC_TIMEOUT_MARKER = "fixture-timeout"
function M.job_still_running(...)
    if M.stage == "lease" then return false, M.source, nil end
    return M.stage ~= "settle_database" and M.stage ~= "settle_dialect", nil, "future"
end
function M.finish_cancellation(...) return M.settled, nil end
function M.prepare_termination(...) local _, err = M.result("fence", true); return err end
function M.get(...)
    M.opens = M.opens + 1
    local stage = M.opens == 1 and "database" or M.stage == "fence_database" and "fence_database" or "settle_database"
    local db: any = {}
    function db:type() return M.result(M.opens == 1 and "dialect" or "settle_dialect", "sqlite") end
    function db:release() M.releases = M.releases + 1; return true, (M.release_at == nil or M.releases == M.release_at) and M.release_error or nil end
    return M.result(stage, db)
end
function M.execution_name(...) return "fixture-supervisor" end
function M.parse_deadline(...) return {}, nil end
function M.supervise_loop(hooks, pid, opts)
    if M.stage == "fence_database" or M.stage == "fence" then return nil, hooks.prepare_termination(), nil, false end
    if M.stage == "exit" then
        local output, err = opts.interpret_exit(M.exit_value)
        return output, err, nil, false
    end
    return {ok = true}, nil, nil, false
end
M.CONTROL_TOPIC, M.TERMINATE_GRACE_MS = "fixture-control", 2000
function M.read(job)
    if job and type(job.lease_policy) == "table" then return job.lease_policy, nil end
    return M.policy()
end
function M.load_from(_, job) return M.read(job) end
return M
