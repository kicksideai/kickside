-- Direct post-commit notification to the single workflows maintenance owner.
-- The wake runs in the maintenance_wake_signal function under the workflows
-- identity, so committing principals need no process messaging authority.
local process = require("process")
local funcs = require("funcs")
local proc_supervisor = require("proc_supervisor")

local M = {}
local PROCESS_NAME = "kickside.workflows.runs:maintenance"
local WAKE_TOPIC = "kickside.workflows.runs:maintenance.wake"
local WAKE_SIGNAL = "kickside.workflows.runs:maintenance_wake_signal"
M.TOPIC = WAKE_TOPIC

function M.register(): (boolean?, error?, boolean)
    local claimed, cancelled, err = proc_supervisor.claim_singleton(PROCESS_NAME, process.events())
    return claimed or nil, err, cancelled
end

function M.unregister(): (boolean?, error?)
    local unregistered, unregister_err = process.registry.unregister(PROCESS_NAME, process.registry.CONSISTENT)
    if unregister_err then return nil, unregister_err end
    return unregistered == true, nil
end

function M.notify(): (boolean?, error?)
    local woken, call_err = funcs.call(WAKE_SIGNAL)
    if call_err then return nil, call_err end
    return woken == true, nil
end

function M.deliver(): (boolean?, error?)
    local pid, lookup_err = process.registry.lookup(PROCESS_NAME, process.registry.CONSISTENT)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return true, nil end
        return nil, (errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = "workflow maintenance owner lookup failed: " .. tostring(lookup_err) }) :: error)
    end
    -- The process service scans committed rows at boot, so commits made while
    -- the maintenance actor is absent remain recoverable by owner recovery.
    if pid == nil then return true, nil end
    local _, send_err = process.send(tostring(pid), WAKE_TOPIC, {})
    if send_err then
        return nil, (errors.new({ kind = errors.UNAVAILABLE, retryable = true,
            message = "workflow maintenance wake failed: " .. tostring(send_err) }) :: error)
    end
    return true, nil
end

return M
