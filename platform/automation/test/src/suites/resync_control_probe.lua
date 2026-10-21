local engine = require("automation_test_engine")
local pin = require("retention_pin")

return {run = function(request: any): (any?, error?)
    local unavailable = {}
    for key, value in pairs(pin) do unavailable[key] = value end
    unavailable.pin_lower = function(): (any?, error?)
        return nil, errors.new({kind = errors.UNAVAILABLE, message = "pin store unavailable", retryable = true})
    end
    local instance = engine.new({retention_pin = unavailable})
    return instance.control(request.id, request.control)
end}
