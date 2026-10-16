-- Monotonic deadline for the synchronous part of run admission.
local M = {}

function M.deadline(started_at: any, timeout_ms: number): any
    return started_at:add(timeout_ms * 1000000)
end

function M.expired(now: any, deadline: any): boolean
    return (now:sub(deadline):nanoseconds()) >= 0
end

function M.invoke(clock: any, deadline: any, operation: () -> (any?, any?)): (any?, any?, boolean)
    if M.expired(clock.now(), deadline) then return nil, nil, true end
    local value, err = operation()
    if M.expired(clock.now(), deadline) then return nil, nil, true end
    return value, err, false
end

return M
