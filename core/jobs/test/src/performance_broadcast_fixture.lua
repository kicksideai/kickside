local ctx = require("ctx")
local security = require("security")
return {broadcast = function(args)
    if ctx.get("performance_refused") then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = false, message = "Delivery refused",
            details = {code = "fixture_delivery_refused", reason = "test"}})
    end
    local allowed = security.can("realtime.broadcast", "kickside.realtime:" .. args.topic) == true
    return {success = allowed}
end}
