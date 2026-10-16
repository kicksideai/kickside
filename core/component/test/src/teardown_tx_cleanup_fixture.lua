local M: any = {}
M.ACCESS, M.COMMAND_TYPES = {DELETE = 8}, {DELETE_COMPONENT = "delete"}
function M.reset(operation, stage, source)
    M.operation, M.stage, M.source = operation, stage, source
    M.release_source, M.rollback_source = nil, nil
    M.opens, M.releases, M.rollbacks, M.commits, M.effects, M.notifications, M.purges = 0, 0, 0, 0, 0, 0, 0
end
function M.result(stage, value)
    if M.stage == stage then return nil, M.source end
    return value, nil
end
function M.db_id() return "fixture-db" end
function M.sql_get()
    M.opens = M.opens + 1
    local db: any = {}
    function db:begin() return M.result("begin", M.transaction()) end
    function db:release()
        M.releases = M.releases + 1
        return true, M.release_source
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
        return M.result(statement:sub(1,6) == "UPDATE" and "lock" or "pointer", {rows_affected = 1})
    end
    function tx:query()
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
function M.component_summary_tx() return M.result("summary", {impl_id = "fixture:implementation"}) end
function M.dispatch()
    M.effects = M.effects + 1
    return M.result("dispatch", {changes_made = true})
end
function M.deleted() return select(2, M.result("lifecycle", true)) end
function M.committed() M.notifications = M.notifications + 1; return nil end
function M.contract_get() M.purges = M.purges + 1; return nil, nil end
return M
