local test = require("test")
local params = require("query_params")

local function req(query: { [string]: any }): any
    return {
        query = function(_self: any, key: string): any
            return query[key]
        end,
    }
end

local function define_tests()
    test.describe("Knowledge API query params", function()
        test.it("parses optional bounded query integers", function()
            local value, err = params.query_int(req({ limit = "20" }), "limit", nil, { min = 1, max = 100 })
            test.is_nil(err)
            test.eq(value, 20)

            local defaulted, derr = params.query_int(req({}), "limit", 10, { min = 1, max = 100 })
            test.is_nil(derr)
            test.eq(defaulted, 10)
        end)

        test.it("rejects malformed and out-of-range query integers", function()
            local _, malformed = params.query_int(req({ limit = "20.5" }), "limit", nil, { min = 1, max = 100 })
            test.contains(malformed, "limit must be an integer")

            local _, high = params.query_int(req({ limit = "101" }), "limit", nil, { min = 1, max = 100 })
            test.contains(high, "limit must be between 1 and 100")
        end)

        test.it("parses JSON numeric values without string coercion", function()
            local value, err = params.value_int(25, "limit", nil, { min = 1, max = 100 })
            test.is_nil(err)
            test.eq(value, 25)

            local _, string_err = params.value_int("25", "limit", nil, { min = 1, max = 100 })
            test.contains(string_err, "limit must be an integer")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
