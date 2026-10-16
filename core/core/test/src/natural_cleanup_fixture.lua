local M: any = {}
function M.reset(path, stage, primary, secondary)
    M.path, M.stage, M.primary, M.secondary = path, stage, primary, secondary
    M.opens, M.releases, M.registrations, M.completions, M.marks, M.emits = 0, 0, 0, 0, 0, 0
end
function M.result(stage, value)
    if M.stage == stage then return nil, M.primary end
    return value, nil
end
function M.open_db()
    M.opens = M.opens + 1
    local label = M.opens == 1 and "resolve" or M.opens == 2 and (M.path == "created" and "read" or "probe") or "complete"
    local db: any = {}
    function db:release()
        M.releases = M.releases + 1
        if M.stage == label .. "_release" then return false, M.primary end
        if M.secondary and ((M.stage == "resolve" and label == "resolve")
            or (M.stage == "read" and label == "read")
            or ((M.stage == "complete" or M.stage == "mark") and label == "complete")
            or (M.stage == "winner_resolve" and label == "probe")) then return false, M.secondary end
        return true, nil
    end
    return db, nil
end
function M.key(...) return {} end
function M.resolve(...)
    if M.stage == "winner_resolve" and M.opens > 1 then return nil, M.primary end
    if M.path == "v2_reallocated" and M.opens > 1 then
        return {allocate_id = "v8", origin = "v2"}, nil
    end
    return M.result("resolve", (M.path == "existing" or (M.path == "winner" or M.path == "winner_v2" or M.path == "winner_legacy") and M.opens > 1 or M.opens > 2) and {thread_id = "thread", ready = true}
        or {allocate_id = "thread", origin = M.path == "legacy" and "legacy" or "v2"})
end
function M.conflict(code) return errors.new({kind = errors.CONFLICT, retryable = false, message = "conflict", details = {code = code}}) end
function M.register_thread_component(...)
    M.registrations = M.registrations + 1
    if M.path == "created" or M.path == "v2_reallocated" and M.registrations == 2 then
        return M.path == "v2_reallocated" and "v8" or "thread", nil
    end
    return nil, M.conflict("registration_conflict")
end
function M.get(...) return M.result("read", {id = "thread"}) end
function M.get_loaded(...) return M.get(...) end
function M.finish(...)
    M.completions = M.completions + 1
    return M.result("complete", {thread = {id = "thread"}})
end
function M.mark_ready(...)
    M.marks = M.marks + 1
    local _, err = M.result("mark", true)
    return err
end
function M.declared_identity(...) return {system = true}, nil end
function M.actor_id(...) return "actor" end
function M.actor_principal(...) return {}, nil end
function M.is_maintenance_actor(...) return false end
function M.impl_id(...) return "impl", nil end
function M.emit_update(...) M.emits = M.emits + 1; return nil end
return M
