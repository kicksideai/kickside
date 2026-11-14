local M: any = {}
M.ACCESS, M.COMMAND_TYPES = {DELETE = 8}, {DELETE_COMPONENT = "delete"}
function M.reset(operation, stage, source)
    M.event, M.event_commits, M.audience_commits, M.recipients = nil, nil, nil, nil
    M.audiences, M.event_effects = 0, nil
    M.absent, M.row_locks, M.pending, M.parent_id = false, 0, false, nil
    M.operation, M.stage, M.source = operation, stage, source
    M.release_source, M.rollback_source = nil, nil
    M.opens, M.releases, M.rollbacks, M.commits, M.effects, M.notifications, M.purges = 0, 0, 0, 0, 0, 0, 0
end
function M.result(stage, value)
    if M.stage == stage then return nil, M.source end
    return value, nil
end
function M.enqueue_tx() return M.result("enqueue", {id = "job"}) end
function M.enroll_delete_tx() return M.result("enqueue", "job") end
function M.nudge_workers() return M.result("nudge", 0) end
M.notify_delete_committed = M.nudge_workers
function M.db_id() return "fixture-db" end
function M.sql_get()
    M.opens = M.opens + 1
    local db: any = {}
    function db:begin() return M.result("begin", M.transaction()) end
    function db:release()
        M.releases = M.releases + 1
        return true, M.releases == 1 and M.release_source or nil
    end
    function db:type() return M.result("dialect", "sqlite") end
    function db:execute() return {rows_affected = 1}, nil end
    return M.result("open", db)
end
function M.transaction(): any
    local tx: any = {}
    function tx:rollback() M.rollbacks = M.rollbacks + 1; return true, M.rollback_source end
    function tx:commit() M.commits = M.commits + 1; return M.result("commit", true) end
    function tx:execute(statement)
        if statement:sub(1,6) == "UPDATE" then M.row_locks = M.row_locks + 1 end
        return M.result(statement:sub(1,6) == "UPDATE" and "lock" or "pointer", {rows_affected = 1})
    end
    function tx:query()
        if M.absent then return {} end
        local row = {}
        if M.operation ~= "begin" then row.deleting_at = "marked" end
        return M.result("fence", {row})
    end
    return tx
end
function M.lock_tree() return select(2, M.result("tree", true)) end
function M.check_user_access() return M.result("access", true) end
function M.validate_delete_tx() return M.result("validate", true) end
function M.mark_deleting_tx() return select(2, M.result("mark", true)) end
function M.component_summary_tx() return M.result("summary", {impl_id = "fixture:implementation", parent_id = M.parent_id}) end
function M.dispatch()
    M.effects = M.effects + 1
    return M.result("dispatch", {changes_made = not M.pending, pending = M.pending})
end
function M.deleted() return select(2, M.result("lifecycle", true)) end
function M.committed() M.notifications = M.notifications + 1; return select(2, M.result("committed", true)) end
function M.contract_get() M.purges = M.purges + 1; return nil, nil end
return M
