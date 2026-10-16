local test = require("test")
local keyset = require("keyset")

local function define_tests()
    test.describe("Keyset Pages", function()
        local rows = { { id = "c" }, { id = "a" }, { id = "d" }, { id = "b" }, { id = "e" } }

        test.it("pages rows in key order and ends without a cursor", function()
            local first, first_cursor = keyset.page(rows, keyset.field("id"), 2, nil)
            test.eq(#first, 2)
            test.eq(first[1].id, "a")
            test.eq(first[2].id, "b")
            test.eq(first_cursor, "b")

            local second, second_cursor = keyset.page(rows, keyset.field("id"), 2, first_cursor)
            test.eq(second[1].id, "c")
            test.eq(second[2].id, "d")
            test.eq(second_cursor, "d")

            local last, last_cursor = keyset.page(rows, keyset.field("id"), 2, second_cursor)
            test.eq(#last, 1)
            test.eq(last[1].id, "e")
            test.is_nil(last_cursor)
        end)

        test.it("returns every row with no cursor when the page holds them all", function()
            local page, cursor = keyset.page(rows, keyset.field("id"), 5, nil)
            test.eq(#page, 5)
            test.is_nil(cursor)
        end)

        test.it("validates limit and cursor", function()
            local limit, cursor, err = keyset.args({})
            test.is_nil(err)
            test.eq(limit, keyset.DEFAULT_LIMIT)
            test.is_nil(cursor)

            local _, _, high_err = keyset.args({ limit = 101 })
            test.is_true(errors.is(high_err, errors.INVALID))
            local _, _, fraction_err = keyset.args({ limit = 1.5 })
            test.is_true(errors.is(fraction_err, errors.INVALID))
            local _, _, cursor_err = keyset.args({ cursor = 3 })
            test.is_true(errors.is(cursor_err, errors.INVALID))
            local capped, _, capped_err = keyset.args({ limit = 10 }, 10)
            test.is_nil(capped_err)
            test.eq(capped, 10)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
