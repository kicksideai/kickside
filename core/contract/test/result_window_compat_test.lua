local test = require("test")
local legacy_tool = require("legacy_tool")
local result_window = require("result_window")

local function define_tests()
    test.describe("published tool compatibility", function()
        test.it("loads a published tool that imports result_window.wrap", function()
            local page = { items = { { id = "document" } }, next_offset = 1 }
            local result, err = legacy_tool.summaries(page)
            test.eq(result, page)
            test.is_nil(err)
        end)

        test.it("keeps the original function and all return values", function()
            local fn = function(...) return ... end
            local wrapped = result_window.wrap(fn)
            test.eq(wrapped, fn)
            local first, second, third = wrapped("first", nil, "third")
            test.eq(first, "first")
            test.is_nil(second)
            test.eq(third, "third")
        end)

        test.it("preserves native error results", function()
            local failure = errors.new("storage unavailable")
            local result, err = legacy_tool.summaries(nil, failure)
            test.is_nil(result)
            test.eq(err, failure)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
