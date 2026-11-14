-- Jobs health read for administrators. Only an actor holding the access grant on
-- the health endpoint receives the report; Jobs computes it.
local security = require("security")
local jobs = require("jobs")

local GATE = "kickside.core.threads.api:health.endpoint"

local function read(): (table?, error?)
    if not security.actor() or not security.can("access", GATE) then
        return nil, (errors.new({ kind = errors.PERMISSION_DENIED, retryable = false, message = "access denied" }) :: error)
    end
    return jobs.health()
end

return { read = read }
