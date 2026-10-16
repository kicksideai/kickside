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
    test.describe("Connection API query params", function()
        test.it("parses optional bounded integer query params", function()
            local value, err = params.query_int(req({ limit = "20" }), "limit", nil, { min = 1, max = 100 })
            test.is_nil(err)
            test.eq(value, 20)

            local defaulted, derr = params.query_int(req({}), "limit", 10, { min = 1, max = 100 })
            test.is_nil(derr)
            test.eq(defaulted, 10)
        end)

        test.it("rejects malformed and out-of-range integers", function()
            local _, fractional = params.query_int(req({ limit = "20.5" }), "limit", nil, { min = 1, max = 100 })
            test.contains(fractional, "limit must be an integer")

            local _, scientific = params.query_int(req({ limit = "1e2" }), "limit", nil, { min = 1, max = 100 })
            test.contains(scientific, "limit must be an integer")

            local _, low = params.query_int(req({ limit = "0" }), "limit", nil, { min = 1, max = 100 })
            test.contains(low, "limit must be between 1 and 100")

            local _, high = params.query_int(req({ limit = "101" }), "limit", nil, { min = 1, max = 100 })
            test.contains(high, "limit must be between 1 and 100")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
