local test = require("test")
local nav = require("nav_subject")
local contract = require("nav_settings_failure")
local function define_tests()
    test.describe("navigation settings", function()
        test.it("propagates a settings outage before resolving navigation", function()
            local value, err = nav.handler()
            test.is_nil(value)
            test.eq(err, contract.failure)
        end)
    end)
end
return {run = test.run_cases(define_tests)}
