local M: any = {}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.missing, M.proof, M.mark_calls, M.page_calls, M.notify_calls = stage, source, false, nil, 0, 0, 0
    M.warning = nil
end
function M.result(stage: string, value: any): (any, error?)
    if stage == M.stage then
        if M.missing then return M.proof, nil end
        if M.source then return nil, M.source end
    end
    return value, nil
end
function M.executor(): any
    return {query = function(self, statement, args): (any, error?)
        return M.result(statement == "lookup" and "lookup" or "remaining", {{id = "source"}})
    end}
end
function M.mark(db, id): error?
    M.mark_calls = M.mark_calls + 1
    local _, err = M.result("mark", true)
    return err
end
function M.fence_page(db, id): (any, error?)
    if M.stage == "pending_notify" then return nil, errors.new({kind = errors.CONFLICT, retryable = true,
        message = "bounded cleanup continues", details = {code = "fence_pending", cleanup_pending = true, needs_continue = true}}) end
    return M.result("fence", true)
end
function M.run(db, id): (any, error?)
    M.page_calls = M.page_calls + 1
    return M.result("page", {notified = {"subscriber"}, discarded = {events = 2}})
end
function M.notify(change): (any, error?)
    M.notify_calls = M.notify_calls + 1
    return M.result(M.stage == "pending_notify" and "pending_notify" or "notify", true)
end
function M.gate_write(db, id, mask): (any, error?)
    return M.result("gate", {component_id = "source"})
end
function M.remove(id): (any, error?, any)
    local value, err = M.result("remove", true)
    return value, err, M.warning
end
return M
