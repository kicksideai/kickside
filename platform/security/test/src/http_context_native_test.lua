local test = require("test")
local funcs = require("funcs")
local http = require("http")
local canonical_json = require("canonical_json")

local function define_tests()
    test.describe("native Security HTTP context failures", function()
        for _, name in ipairs({"list_scopes", "list_policies", "save_scope", "delete_scope"}) do
            test.it("reports native missing HTTP context from " .. name, function()
                local _, source_err = http.response()
                test.is_true(errors.is(source_err, errors.INTERNAL))
                local result, err = funcs.call("kickside.security.api:" .. name)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "http_context_missing")
                local cause = err:details().cause
                test.eq(cause.kind, source_err:kind())
                test.eq(cause.message, source_err:message())
                test.eq(cause.retryable, source_err:retryable())
                test.eq(assert(canonical_json.encode(cause.details)), assert(canonical_json.encode(source_err:details())))
            end)
        end
    end)
end
return {run = test.run_cases(define_tests)}
