local security = require("security")
local execution_identity = require("execution_identity")

local M = {}

function M.capture()
    local actor = assert(security.actor(), "native execution frame has no actor")
    local identity, capture_err = execution_identity.capture()
    assert(not capture_err, tostring(capture_err))
    return {
        actor_id = actor:id(),
        identity = identity,
        allowed = security.can("identity.capture.restricted", "identity:restricted") == true,
        broad = security.can("identity.capture.broad", "identity:broad") == true,
    }
end

return M
