-- The action wrapper must not mask an in-band handler failure. When an action returns
-- { success = false, error = ... } inside its result envelope (e.g. a pause whose
-- trigger-service/public-state step failed), the wrapper reports an error, not a 200 with
-- top-level success = true. This asserts the detection seam call_action.action_failed uses.

local test = require("test")
local call_action = require("call_action")

type Map = { [string]: any }

local function define_tests()
    test.describe("call_action.action_failed", function()
        test.it("flags an in-band failure envelope and returns its error", function()
            local failed, err = call_action.action_failed({
                id = "c1", method = "pause",
                result = { success = false, error = "could not persist paused state" },
            })
            test.is_true(failed)
            test.eq(err, "could not persist paused state")
        end)

        test.it("does not flag an explicit success envelope", function()
            local failed = call_action.action_failed({ result = { success = true } })
            test.is_false(failed)
        end)

        test.it("does not flag a plain-data result with no success field", function()
            local failed = call_action.action_failed({ result = { runs = 3 } })
            test.is_false(failed)
        end)

        test.it("does not flag a missing result", function()
            local failed = call_action.action_failed({ id = "c1", method = "run" })
            test.is_false(failed)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
local function run(options: any): any
    return run_cases(options)
end
return { run = run }
