local M: any = {ACCESS = {WRITE = 2}}
function M.reset(trusted: boolean, stage: string, source: error?)
    M.trusted, M.stage, M.source = trusted, stage, source
    M.opens, M.begins, M.writes, M.events, M.commits, M.rollbacks, M.releases, M.committed_calls, M.notifications = 0, 0, 0, 0, 0, 0, 0, 0, 0
    M.access_calls, M.summary_calls, M.placement, M.lifecycle_input = 0, 0, false, nil
    M.rollback_source, M.release_source, M.changed, M.denied, M.reply_field, M.last_command = nil, nil, true, false, nil, nil
end
function M.result(stage, value)
    if M.reply_field == stage then return nil, nil end
    if M.stage == stage then return nil, M.source end
    return value, nil
end
function M.db_id() return "fixture-db" end
function M.get(...)
    M.opens = M.opens + 1
    local db: any = {}
    function db:begin()
        M.begins = M.begins + 1
        return M.result("begin", {rollback = function()
            M.rollbacks = M.rollbacks + 1; return true, M.rollback_source
        end, commit = function()
            M.commits = M.commits + 1; return M.result("commit", true)
        end})
    end
    function db:type() return M.result("dbtype", "sqlite") end
    function db:release()
        M.releases = M.releases + 1
        if M.stage == "release" then return nil, M.source end
        return true, M.release_source
    end
    return M.result("open", db)
end
function M.actor()
    return M.result("actor", {id = function() return M.result("actor_id", "user-1") end})
end
function M.can(...)
    return M.result("permission", not M.denied)
end
function M.check_user_access(...)
    M.access_calls = M.access_calls + 1
    return M.result(M.access_calls == 1 and "access" or "parent_access", not M.denied)
end
function M.lock_component_tx(...) return M.stage == "lock" and M.source or nil end
function M.component_summary_tx(...)
    M.summary_calls = M.summary_calls + 1
    local stage = M.summary_calls == 1 and "summary" or M.summary_calls == 2 and "parent_summary" or "previous_summary"
    return M.result(stage, {impl_id = "implementation"})
end
function M.set_public_meta(...)
    M.writes = M.writes + 1
    if M.stage == "metadata" then return nil, nil, M.source end
    return {label = "kept"}, M.changed, nil
end
function M.public_meta_tx(...) return M.result("snapshot", {label = "kept"}) end
function M.registry_get(...) return M.result("registry", {meta = {class = "component"}}) end
function M.updated(input) M.lifecycle_input = input; M.events = M.events + 1; return M.stage == "lifecycle" and M.source or nil end
function M.committed() M.committed_calls = M.committed_calls + 1; return M.stage == "committed" and M.source or nil end
function M.call(...)
    M.notifications = M.notifications + 1
    return M.result("notify", {success = true})
end
M.COMMAND_TYPES = {SET_CONTEXT = "set_context", PATCH_CONTEXT = "patch_context", SET_META = "set_meta", SET_PLACEMENT = "set_placement"}
function M.check_context_revision(...) return M.stage == "expected" and M.source or nil end
function M.context_revision_tx(...) return M.result("revision", 9) end
function M.dispatch(tx, db, command)
    M.writes = M.writes + 1; M.last_command = command
    local result: any = {changes_made = M.changed, component_id = command.payload.component_id}
    if M.placement then
        result.parent_id = command.payload.parent_id
        result.previous_parent_id = "previous-parent"
        result.position = command.payload.position
        result.previous_position = "previous-position"
    end
    return M.result("dispatch", result)
end
return M
