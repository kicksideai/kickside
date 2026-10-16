local M: any = {}
M.ACCESS = {ADMIN = 16}
M.KIND = {USER = "user"}
M.actor_id = "11111111-1111-4111-8111-111111111111"
function M.reset(operation, stage, source)
    M.operation, M.stage, M.source = operation, stage, source
    M.opens, M.begins, M.accesses, M.effects, M.commits, M.rollbacks, M.releases = 0, 0, 0, 0, 0, 0, 0
    M.rollback_source, M.release_source, M.denied, M.permission, M.confined, M.maintenance = nil, nil, false, true, false, false
end
function M.result(stage, value)
    if M.stage == stage then return nil, M.source end
    return value, nil
end
function M.db_id() return "fixture-db" end
function M.get()
    M.opens = M.opens + 1
    local db: any = {}
    function db:begin() M.begins = M.begins + 1; return M.result("begin", M.transaction()) end
    function db:release()
        M.releases = M.releases + 1
        if M.stage == "release" then return nil, M.source end
        return true, M.release_source
    end
    return M.result("open", db)
end
function M.transaction(): any
    return {rollback = function() M.rollbacks = M.rollbacks + 1; return true, M.rollback_source end,
        commit = function() M.commits = M.commits + 1; return M.result("commit", true) end}
end
function M.actor() return {id = function() return M.actor_id end} end
function M.can() return M.permission end
function M.is_maintenance_key() return M.maintenance end
function M.principal_of_key() return {kind = "user", id = M.actor_id}, nil end
function M.access_filter() return M.confined and {"prefix"} or nil, nil end
function M.check_user_access()
    M.accesses = M.accesses + 1
    if M.denied then return false, nil end
    return M.result("access", true)
end
function M.work()
    M.effects = M.effects + 1
    return M.result("work", {component_id = "component", affected = 3, changes_made = true,
        adopted_by = {kind = "user", id = M.actor_id}, identity_generation = 2, request_id = "request", prior_access = {}})
end
function M.apply_subtree_access(tx, db, root, subject, mask, revoke, subject_type)
    M.root, M.subject, M.mask, M.revoke, M.subject_type = root, subject, mask, revoke, subject_type
    return M.work()
end
function M.adopt_tx(tx, db, id, adopter) M.adopter = adopter; return M.work() end
return M
