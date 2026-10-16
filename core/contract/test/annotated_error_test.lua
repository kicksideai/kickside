local test = require("test")
local envelope = require("envelope")
return {run = test.run_cases(function()
    test.describe("native annotated error context", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "dependency refusal", retryable = options.retryable,
                        details = {code = "source", reason = "source_reason", cause = {original = true}, nested = {value = 1}}})
                    local wrapped = envelope.wrap(source, "boundary refuses", {reason = "boundary_reason"})
                    test.eq(type(wrapped), "userdata")
                    test.eq(wrapped:kind(), source:kind())
                    test.eq(wrapped:retryable(), source:retryable())
                    local details = wrapped:details()
                    test.eq(details.code, "source")
                    test.eq(details.reason, "boundary_reason")
                    test.eq(details.nested.value, 1)
                    local cause = errors.new(details.cause)
                    test.eq(cause:kind(), source:kind())
                    test.eq(cause:retryable(), source:retryable())
                    test.eq(cause:details().code, "source")
                    test.eq(cause:details().reason, "source_reason")
                    test.eq(cause:details().cause.original, true)
                    test.eq(source:details().reason, "source_reason")
                    test.eq(source:details().cause.original, true)
                end)
            end
        end
    end)
end)}
