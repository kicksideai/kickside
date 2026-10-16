local process = require("process")
local funcs = require("funcs")
local M = {}
M.NAME = "kickside.core.retention.service:sweeper_process"
M.TOPIC = "kickside.core.retention.changed"
M.DELIVER = "kickside.core.retention:notify"

-- Producers publish a change through the retention-owned deliver function,
-- which messages the sweeper under the retention identity.
function M.notify(change: table): (boolean?, error?)
    local delivered, call_err = funcs.call(M.DELIVER, change)
    if call_err then return nil, call_err end
    return delivered == true, nil
end

function M.deliver(change: table): (boolean?, error?)
    local pid, lookup_err = process.registry.lookup(M.NAME, process.registry.CONSISTENT)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return false, nil end
        return nil, errors.wrap(lookup_err, "retention process lookup failed")
    end
    -- A missing process is recovered by its boot sweep before it listens.
    if not pid then return false, nil end
    local _, send_err = process.send(pid :: string, M.TOPIC, change)
    if send_err then
        return nil, errors.wrap(send_err, "retention process message failed")
    end
    return true, nil
end

return M
