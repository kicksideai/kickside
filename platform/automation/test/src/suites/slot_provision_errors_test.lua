local test = require("test")
local slots = require("slots")

return test.run_cases(function()
    test.describe("slot provisioning errors", function()
        for _, failed_key in ipairs({ "first", "second" }) do
            test.it("returns the native provisioning failure for " .. failed_key, function()
                local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                    message = "slot backend unavailable", details = { marker = failed_key } })
                local calls = {}
                local wake_calls = 0
                local err = slots.provision_slots({ slot = {
                    provision = function(_id, key)
                        calls[#calls + 1] = key
                        if key == failed_key then return nil, source end
                        return "job", nil
                    end,
                    wake_dispatcher = function() wake_calls = wake_calls + 1; return true, nil end,
                }, logger = { named = function() return { error = function() end } end } },
                    "automation", { "first", "second", "third" })
                test.eq(err, source)
                test.eq(#calls, failed_key == "first" and 1 or 2)
                test.eq(wake_calls, 0)
            end)
        end
        test.it("provisions every requested drive on success", function()
            local calls = {}
            local err = slots.provision_slots({ slot = { provision = function(id, key)
                calls[#calls + 1] = id .. "/" .. key
                return "job", nil
            end } }, "automation", { "first", "second" })
            test.is_nil(err)
            test.eq(#calls, 2)
            test.eq(calls[1], "automation/first")
            test.eq(calls[2], "automation/second")
        end)
    end)
end)
