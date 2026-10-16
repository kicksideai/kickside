-- Typed claim refusals the worker pool tells apart. An occupied worker marker
-- contradicts the idle notice that offered the slot.

local job_types = require("job_types")

local refusal = {}

local function reason_of(err: any): string?
    if err == nil or type(err.details) ~= "function" then return nil end
    local details = err:details()
    if type(details) ~= "table" then return nil end
    return details.reason
end

function refusal.is_marker_occupied(err: any): boolean
    return reason_of(err) == job_types.CLAIM_REFUSAL.WORKER_MARKER_OCCUPIED
end

return refusal
