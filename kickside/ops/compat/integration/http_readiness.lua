local system = require("system")
local time = require("time")

local M = {}

local function elapsed_milliseconds(deadline)
    return time.now():sub(deadline.started):milliseconds()
end

local function state_diagnostic(state)
    return "id=" .. tostring(state.id) .. ", status=" .. tostring(state.status) ..
        ", desired=" .. tostring(state.desired) .. ", retry_count=" .. tostring(state.retry_count) ..
        ", last_update=" .. tostring(state.last_update) .. ", started_at=" .. tostring(state.started_at) ..
        ", details=" .. tostring(state.details)
end

function M.deadline(timeout_seconds)
    local deadline = {started = time.now()}
    if timeout_seconds ~= nil then deadline.timeout_milliseconds = timeout_seconds * 1000 end
    return deadline
end

function M.await_running(service_id, deadline)
    while true do
        local state, err = system.supervisor.state(service_id)
        if err then error("supervisor state query failed: " .. tostring(err)) end
        if not state then error("supervisor returns no state for " .. service_id) end
        if state.status == "running" then return end
        if state.status == "failed" or state.status == "stopped" or state.status == "exited" then
            error("supervisor reports terminal service state: " .. state_diagnostic(state))
        end
        if deadline.timeout_milliseconds and elapsed_milliseconds(deadline) >= deadline.timeout_milliseconds then
            error("service does not become running before request deadline: " .. state_diagnostic(state))
        end
        time.sleep("10ms")
    end
end

function M.remaining_timeout(deadline)
    if not deadline.timeout_milliseconds then return nil end
    local remaining = deadline.timeout_milliseconds - elapsed_milliseconds(deadline)
    if remaining <= 0 then error("request deadline expires before dispatch") end
    return tostring(remaining) .. "ms"
end

return M
