-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local process = require("process")
return {run = function()
    local observer = ctx.get("performance_observer")
    if observer then
        local _, err = process.send(observer, "performance.invalidated", {})
        if err then return nil, err end
    end
    if ctx.get("performance_refused") then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = false, message = "Delivery refused",
            details = {code = "fixture_delivery_refused", reason = "test"}})
    end
    return {success = true}, nil
end}
