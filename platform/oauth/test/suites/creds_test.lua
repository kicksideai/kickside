local test = require("test")
local creds = require("creds")

local function define_tests()
    test.describe("OAuth credential resolver", function()
        test.it("rejects non-canonical credential fields before context lookup", function()
            local value, source = creds.resolve("../secret")
            test.is_nil(value)
            test.is_nil(source)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options: any): any
    return run_cases(options)
end

return { run = run }
