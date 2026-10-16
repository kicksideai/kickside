local test = require("test")
local funcs = require("funcs")
local security = require("security")

local function define_tests()
    test.describe("canonical tool failures", function()
        test.it("returns a typed invocation failure for a blank title without a success payload", function()
            local exec = funcs.new():with_actor(security.new_actor("blank_tool_contract", {}))
                :with_scope(security.named_scope("kickside.inbox.tool_errors:tool_errors_scope"))
            local result, err = exec:call("kickside.inbox.traits:inbox_submit_tool", { title = " \t\n", content = "fixture" })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(tostring(err), "title is required")
        end)

        test.it("kickside.inbox.traits:inbox_submit_tool rejects failures through the error return", function()
            local exec = funcs.new():with_actor(security.new_actor("tool_error_contract", {}))
                :with_scope(security.named_scope("kickside.inbox.tool_errors:tool_errors_scope"))
            local result, err = exec:call("kickside.inbox.traits:inbox_submit_tool", { title = "" })
            test.is_nil(result, "a failing tool must not return a successful result")
            test.not_nil(err, "a failing tool must return an invocation error")
            test.is_true(errors.is(err, errors.INVALID), "error kind: " .. tostring(err))
            test.is_true(tostring(err):find("title is required", 1, true) ~= nil, tostring(err))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
