local M = {}

function M.set_outcome(result, err)
    M.outcome = {result = result, err = err}
end

function M.clear_outcome()
    M.outcome = nil
end

-- Components of these impls model a lifecycle store that fails its record, a
-- storage failure inside the create, update or delete transaction.
M.FAILING_CREATE_IMPL = "kickside.test:failing_lifecycle_create"
M.FAILING_UPDATE_IMPL = "kickside.test:failing_lifecycle_update"
M.FAILING_DELETE_IMPL = "kickside.test:failing_lifecycle_delete"
-- Components of this impl model a lifecycle implementation raising its own
-- typed error (a retryable conflict) from created.
M.TYPED_CREATE_IMPL = "kickside.test:typed_lifecycle_create"
M.fail_audit = false
-- A registration whose thread row names this class models a primary thread row
-- the lifecycle cannot write inside the create transaction.
M.REFUSED_THREAD_CLASS = "test.refused.thread"
-- A process registered under COMMIT_PROBE receives one COMMIT_TOPIC message per
-- committed lifecycle notification.
M.COMMIT_PROBE = "app.component_lifecycle.commit_probe"
M.COMMIT_TOPIC = "app.component_lifecycle.committed"

local function recorder(failing_impl: string): (any) -> any
    return function(payload: any): any
        if M.outcome then return M.outcome.result, M.outcome.err end
        if type(payload) == "table" and payload.impl_id == failing_impl then
            return { success = false, error = "lifecycle store unavailable" }
        end
        return { success = true }
    end
end

local record_created = recorder(M.FAILING_CREATE_IMPL)

M.created = function(payload: any): (any?, any)
    if M.outcome then return M.outcome.result, M.outcome.err end
    if type(payload) == "table" and payload.impl_id == M.TYPED_CREATE_IMPL then
        return nil, errors.new({ message = "lifecycle thread append conflicted", kind = errors.CONFLICT, retryable = true })
    end
    if type(payload) == "table" and type(payload.thread) == "table"
        and payload.thread.thread_class == M.REFUSED_THREAD_CLASS then
        return nil, errors.new({ message = "thread row refused", kind = errors.INVALID })
    end
    return record_created(payload), nil
end
M.updated = recorder(M.FAILING_UPDATE_IMPL)
M.deleted = recorder(M.FAILING_DELETE_IMPL)
M.committed = function(): (any?, any?)
    if M.outcome then return M.outcome.result, M.outcome.err end
    local pid, lookup_err = process.registry.lookup(M.COMMIT_PROBE)
    if lookup_err or not pid then return { success = true }, nil end
    local _, send_err = process.send(pid, M.COMMIT_TOPIC, {})
    if send_err then return nil, send_err end
    return { success = true }, nil
end
M.publish_audit = function(_payload: any): (any?, any?)
    if M.outcome then return M.outcome.result, M.outcome.err end
    if M.fail_audit then
        return nil, errors.new({ message = "audit publication unavailable", kind = errors.UNAVAILABLE, retryable = true })
    end
    return { success = true, inserted = 1, duplicates = 0 }, nil
end

return M
