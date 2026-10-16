-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs_fixture")
local trigger = require("trigger")

return {run = test.run_cases(function()
    test.describe("projection request failures", function()
        test.it("propagates a request delivery failure unchanged", function()
            local source = errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                message = "projection request delivery denied", details = {operation = "deliver"}})
            funcs.call = function(_, _) return nil, source end
            local result, err = trigger.trigger({})
            test.is_nil(result)
            test.eq(err, source)
        end)
    end)
end)}
