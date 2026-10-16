local test = require("test")
local tool_result = require("tool_result")

local function define_tests()
    test.describe("Tool Results", function()
        test.it("returns a success value unchanged, whatever its type", function()
            local record = { id = "a1", items = { 1, 2 } }
            local result = tool_result.ok(record)
            test.eq(result, record)
            test.is_nil(result.success)
            test.eq(tool_result.ok("raw body"), "raw body")
            test.eq(tool_result.ok(0), 0)
        end)

        test.it("fails with a typed error of the given kind and details", function()
            local value, err = tool_result.fail(errors.NOT_FOUND, "record not found", { record_id = "r1" })
            test.is_nil(value)
            test.is_true(errors.is(err, errors.NOT_FOUND))
            test.eq(err:message(), "record not found")
            test.eq(err:details().record_id, "r1")
        end)

        test.it("builds a domain error table with structured fields", function()
            local result = tool_result.domain_error("handle is ambiguous", { code = "handle_ambiguous", candidates = { "j1", "j2" } })
            test.eq(result.success, false)
            test.eq(result.error, "handle is ambiguous")
            test.eq(result.code, "handle_ambiguous")
            test.eq(#result.candidates, 2)
            test.is_true(tool_result.is_domain_error(result))
            test.is_false(tool_result.is_domain_error({ id = "a1" }))
            test.is_false(tool_result.is_domain_error("text"))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
