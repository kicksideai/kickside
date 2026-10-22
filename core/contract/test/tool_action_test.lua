local test = require("test")
local tool_action = require("tool_action")

local CONTRACTS = {
    install = { required = { "type", "input" }, optional = { "parent_id" } },
    pause = { required = { "id" } },
}

local function define_tests()
    test.describe("Tool Actions", function()
        test.it("returns the action when the call matches its contract", function()
            test.eq(tool_action.check({ action = "install", type = "t", input = {} }, CONTRACTS), "install")
            test.eq(tool_action.check({ action = "install", type = "t", input = {}, parent_id = "p" }, CONTRACTS), "install")
            test.eq(tool_action.check({ action = "pause", id = "a1" }, CONTRACTS), "pause")
        end)

        test.it("rejects an unknown or missing action and lists the actions", function()
            for _, args in ipairs({ { action = "explode" }, {}, { action = 7 } }) do
                local action, err = tool_action.check(args, CONTRACTS)
                test.is_nil(action)
                test.is_true(errors.is(err, errors.INVALID), tostring(err))
                test.contains(err:message(), "unknown action")
                test.contains(err:message(), "install, pause")
            end
        end)

        test.it("names every missing required field", function()
            local action, err = tool_action.check({ action = "install" }, CONTRACTS)
            test.is_nil(action)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.eq(err:message(), "type is required for action=install (missing: type, input)")
            test.eq(err:details().missing[2], "input")
            local _, single_err = tool_action.check({ action = "install", type = "t" }, CONTRACTS)
            test.eq(single_err:message(), "input is required for action=install")
        end)

        test.it("rejects fields another action owns and lists the accepted fields", function()
            local action, err = tool_action.check({ action = "pause", id = "a1", input = {}, parent_id = "p" }, CONTRACTS)
            test.is_nil(action)
            test.is_true(errors.is(err, errors.INVALID), tostring(err))
            test.eq(err:message(), "action=pause does not accept input, parent_id; accepted fields: action, id")
            test.eq(#err:details().rejected, 2)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
