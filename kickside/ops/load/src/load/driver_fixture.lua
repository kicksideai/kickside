type Map = { [string]: any }

local support = require("driver_support")
local EVENT_TYPE = support.EVENT_TYPE

local M = {}

-- Local automation bindings consumed by the production round runner. An
-- event automation reads its source thread; a timer automation acquires
-- five-minute interval occurrences.
function M.install_event(input: any): (any, any)
    local data = type(input) == "table" and input or {}
    local thread_id = tostring(data.thread_id or "")
    if thread_id == "" then return nil, "thread_id is required" end
    return {
        source = { source_kind = "event", source_ref = "kickside.load:events",
            source_thread_id = thread_id, event_type = EVENT_TYPE, start = data.start or "new" },
        state = { lane_lod = true }, metadata = { title = "Lane LOD fixture" },
    }, nil
end

function M.install_timer(_input: any): (any, any)
    return {
        source = { source_kind = "timer", schedule = { type = "interval", expression = "5m" } },
        state = { lane_lod = true }, metadata = { title = "Lane LOD interval fixture" },
    }, nil
end

return M
