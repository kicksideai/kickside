local process = require("process")
local cfg = require("config")

local M = {}

-- Notify the registered worker pool. This function runs under the Jobs
-- service identity, so producers need no process messaging authority. Jobs
-- can be used without the worker service (migration and isolated suites);
-- an absent pool leaves durable demand for the next worker boot recovery.
function M.run(): (integer, error?)
    local pool_pid, lookup_err = process.registry.lookup(cfg.POOL_NAME, process.registry.CONSISTENT)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return 0, nil end
        return 0, errors.wrap(lookup_err, "worker pool lookup failed")
    end
    if not pool_pid then return 0, nil end
    local sent, send_err = process.send(tostring(pool_pid), cfg.WAKE_TOPIC, {})
    if send_err then
        return 0, errors.wrap(send_err, "worker pool nudge send failed")
    end
    return sent == true and 1 or 0, nil
end

return M
