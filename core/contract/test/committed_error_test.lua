local test = require("test")
local committed_error = require("committed_error")

local function define_tests()
    test.describe("native committed failures", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("preserves " .. kind .. " while disabling replay after commit: " .. tostring(policy.retryable), function()
                    local source = errors.new({kind = kind, message = "acknowledgement dependency",
                        retryable = policy.retryable, details = {code = "acknowledgement_dependency",
                            nested = {marker = "retained"}, cause = {marker = "original cause"}}})
                    local err = committed_error.new(source)
                    test.eq(err:kind(), source:kind())
                    test.eq(err:message(), source:message())
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, source:details().code)
                    test.eq(err:details().nested.marker, "retained")
                    local cause = err:details().cause
                    test.eq(cause.kind, source:kind())
                    test.eq(cause.message, source:message())
                    test.eq(cause.retryable, policy.retryable)
                    test.eq(cause.details.code, source:details().code)
                    test.eq(cause.details.nested.marker, "retained")
                    test.eq(cause.details.cause.marker, "original cause")
                    test.eq(source:retryable(), policy.retryable)
                    test.eq(source:details().cause.marker, "original cause")
                end)
            end
        end
        test.it("preserves absent source details in the complete native cause", function()
            local source = errors.new({kind = errors.UNAVAILABLE, message = "acknowledgement unavailable", retryable = true})
            local err = committed_error.new(source)
            test.eq(err:kind(), source:kind())
            test.eq(err:retryable(), false)
            test.is_nil(err:details().cause.details)
            test.is_nil(source:details())
        end)
    end)
end
return {run = test.run_cases(define_tests)}
