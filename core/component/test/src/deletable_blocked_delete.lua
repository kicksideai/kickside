local ctx = require("ctx")

local function handle(): any
    local mode = ctx.get("blocker")
    local details: table = { cleanup_pending = true }
    if mode == "lease_release" or mode == "eligibility" then details.wait_for = mode
    elseif mode ~= "unclassified" then details.blocked_operation = mode end
    return { success = false, error = errors.new({ message = "cleanup awaits " .. tostring(mode),
        kind = errors.CONFLICT, retryable = true, details = details }) }
end

return { handle = handle }
