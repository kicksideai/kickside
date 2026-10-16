local test = require("test")
local list_tools = require("list_tools")

local function entry(id: string): any
    return {
        id = id,
        kind = "function.lua",
        meta = { title = id, type = "tool", public = true, input_schema = "{}" },
    }
end

local function define_tests()
    test.describe("agent tool catalog paging", function()
        test.it("returns stable bounded pages and a cursor for the next page", function()
            test.is_true(list_tools.entry_visible(entry("tool:a")))
            local page, next_cursor = list_tools.page({ entry("tool:c"), entry("tool:a"), entry("tool:b") }, {
                limit = 2,
                offset = 0,
            })
            test.eq(#page, 2)
            test.eq(page[1].id, "tool:a")
            test.eq(page[2].id, "tool:b")
            test.eq(next_cursor, "2")

            local final, final_cursor = list_tools.page({ entry("tool:c"), entry("tool:a"), entry("tool:b") }, {
                limit = 2,
                offset = tonumber(next_cursor),
            })
            test.eq(#final, 1)
            test.eq(final[1].id, "tool:c")
            test.is_nil(final_cursor)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
