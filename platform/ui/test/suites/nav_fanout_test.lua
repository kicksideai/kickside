-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local time = require("time")

local function collect(mode)
    local future, err = funcs.new():async("kickside.ui:nav_fanout_probe", { mode = mode })
    test.is_nil(err)
    local response = future:response()
    local deadline = time.after("1s")
    local selected = channel.select({ response:case_receive(), deadline:case_receive() })
    if selected.channel == deadline then future:cancel() end
    test.neq(selected.channel, deadline, "nav fan-out exceeded the 1s test deadline")
    test.eq(selected.ok, true)
    local result, result_err = selected.value:data()
    test.is_nil(result_err)
    return result
end

local function define_tests()
    test.describe("Nav provider closed-channel fan-out", function()
        test.it("returns both providers after their response channels close", function()
            local result = collect("both")
            test.is_nil(result.code)
            test.eq(#result.collected.items, 2)
            test.eq(result.collected.items[1].id, "fast")
            test.eq(result.collected.items[2].id, "other")
            test.eq(result.cancelled.fast, false)
            test.eq(result.cancelled.other, false)
        end)

        test.it("times out and cancels a pending provider after a fast response", function()
            local result = collect("pending")
            test.is_nil(result.collected)
            test.eq(result.code, "nav_provider_timeout")
            test.eq(result.cancelled.fast, false)
            test.eq(result.cancelled.other, true)
        end)

        test.it("returns a result error when a provider closes without a value", function()
            local result = collect("closed")
            test.is_nil(result.collected)
            test.eq(result.code, "nav_provider_response_channel")
            test.eq(result.cancelled.fast, false)
            test.eq(result.cancelled.other, false)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
