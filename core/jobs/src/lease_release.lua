-- Jobs owns the release signal, not the cleanup it unblocks. A consumer
-- registers before reading durable pending work, so a missing consumer recovers
-- on boot. Transaction owners call notify only after committing settlement;
-- delivery runs in the lease_release_signal function under the Jobs identity,
-- so settling principals need no process messaging authority.
local process = require("process")
local funcs = require("funcs")
local M = {}
M.NAME = "kickside.core.jobs:lease_release_listener"
M.TOPIC = "kickside.jobs.lease_released"
M.SIGNAL = "kickside.core.jobs:lease_release_signal"

function M.notify(id: string, execution_seq: number?, owner_locator: table?): error?
    local _, call_err = funcs.call(M.SIGNAL, id, execution_seq, owner_locator)
    return call_err
end

function M.deliver(id: string, execution_seq: number?, owner_locator: table?): (boolean, error?)
    local pid, lookup_err = process.registry.lookup(M.NAME, process.registry.CONSISTENT)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return false, nil end
        return false, errors.wrap(lookup_err, "lease release listener lookup failed")
    end
    if not pid then return false, nil end
    local _, send_err = process.send(pid :: string, M.TOPIC,
        { kind = "lease_released", job_id = id, execution_seq = execution_seq, owner_locator = owner_locator })
    if send_err then
        return false, errors.wrap(send_err, "lease release notification failed")
    end
    return true, nil
end

return M
