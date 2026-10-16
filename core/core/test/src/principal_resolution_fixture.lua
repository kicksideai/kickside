local M = {}
local principal = {kind = "user", id = "principal"}
function M.reset(route: string, source: error?, cleanup: error?)
    M.route, M.source, M.cleanup = route, source, cleanup
    M.key_reads, M.meta_reads, M.opens, M.releases, M.registers, M.ensures, M.writes, M.appends = 0, 0, 0, 0, 0, 0, 0, 0
end
function M.actor()
    if M.route == "absent_actor" then return nil end
    return {id = function() return (M.route == "maintenance" or M.route == "maintenance_metadata") and "system:test-maintenance" or "actor" end, meta = function()
        if M.route == "actor_key" or M.route == "empty_key" or M.route == "maintenance" then return {} end
        return {principal = principal}
    end}
end
function M.principal_of_key(...)
    M.key_reads = M.key_reads + 1
    if M.route == "empty_key" then return nil, nil end
    if M.route == "maintenance" then
        return nil, errors.new({kind = errors.INVALID, retryable = false, message = "framework actor has no selectable principal", details = {error_category = "declaration"}})
    end
    if M.route == "key" or M.route == "actor_key" or M.route == "emit_key" or M.route == "audit_key" or M.route == "audit_cleanup" then return nil, M.source end
    return principal, nil
end
function M.check_principal(...)
    M.meta_reads = M.meta_reads + 1
    if M.route == "meta" or M.route == "create_meta" or M.route == "ensure_meta" or M.route == "emit_meta" or M.route == "upsert_meta" then return nil, M.source end
    return principal, nil
end
function M.later_error(): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "fixture reaches work after principal refusal", details = {code = "unexpected_principal_work"}})
end
function M.open_db(): (any, error?)
    M.opens = M.opens + 1
    return {release = function() M.releases = M.releases + 1; return M.cleanup == nil, M.cleanup end,
        query = function() return {}, nil end}, nil
end
function M.register_thread_component(...)
    M.registers = M.registers + 1
    return nil, M.later_error()
end
function M.ensure_thread_component(...)
    M.ensures = M.ensures + 1
    return nil, false, M.later_error()
end
function M.write(...)
    M.writes = M.writes + 1
    return nil, M.later_error()
end
function M.append(...)
    M.appends = M.appends + 1
    return nil, M.later_error()
end
return M
