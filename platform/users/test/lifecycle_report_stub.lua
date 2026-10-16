-- Harness-owned lifecycle reporter probe. Production appends a durable event
-- through the Core thread contract; this isolated Users harness records the
-- same idempotent reporting contract without booting the lifecycle engine.
local M = {}
M.fail_principal_deleted = false
M.principal_deleted_calls = 0
M.principal_deleted_events = 0

local accepted: { [string]: boolean } = {}

function M.reset()
    M.fail_principal_deleted = false
    M.principal_deleted_calls = 0
    M.principal_deleted_events = 0
    accepted = {}
end

function M.principal_deleted(user_id: string): (boolean, string?)
    M.principal_deleted_calls = M.principal_deleted_calls + 1
    if M.fail_principal_deleted then
        return false, "lifecycle unavailable"
    end
    if not accepted[user_id] then
        accepted[user_id] = true
        M.principal_deleted_events = M.principal_deleted_events + 1
    end
    return true, nil
end

function M.component_deleted(_component_id: string): (boolean, string?)
    return true, nil
end

return M
