local M: any = {ACCESS = {WRITE = 2}, COMMAND_TYPES = {CREATE_COMPONENT = "create", GRANT_ACCESS = "grant"}}
function M.reset(stage, source)
    M.stage, M.source = stage, source
    M.opens, M.begins, M.creates, M.grants, M.events, M.commits, M.rollbacks, M.releases, M.notifications = 0, 0, 0, 0, 0, 0, 0, 0, 0
    M.rollback_source, M.release_source, M.denied = nil, nil, false
end
function M.result(stage, result)
    if M.stage == stage then return nil, M.source end
    return result, nil
end
function M.db_id() return "fixture-db" end
function M.get()
    M.opens = M.opens + 1
    local db: any = {}
    function db:begin()
        M.begins = M.begins + 1
        return M.result("begin", {rollback = function() M.rollbacks = M.rollbacks + 1; return true, M.rollback_source end,
            commit = function() M.commits = M.commits + 1; return M.result("commit", true) end})
    end
    function db:type() return M.result("dbtype", "sqlite") end
    function db:release()
        M.releases = M.releases + 1
        if M.stage == "release" then return nil, M.source end
        return true, M.release_source
    end
    return M.result("open", db)
end
function M.actor() return {id = function() return "11111111-1111-4111-8111-111111111111" end} end
function M.check_user_access()
    if M.denied then return false, nil end
    return M.result("parent_access", true)
end
function M.dispatch(tx, db, command)
    if command.type == M.COMMAND_TYPES.CREATE_COMPONENT then
        M.creates = M.creates + 1; M.creation = command.payload
        return M.result("create", {component_id = command.payload.component_id, changes_made = true})
    end
    M.grants = M.grants + 1; M.grant = command.payload
    return M.result("access", {changes_made = true})
end
function M.component_summary_tx() return M.result("parent", {impl_id = "parent-impl"}) end
function M.created(input) M.events = M.events + 1; M.event = input; return M.stage == "lifecycle" and M.source or nil end
function M.committed() M.notifications = M.notifications + 1; return M.stage == "notify" and M.source or nil end
return M
