local test = require("test")
local envelope = require("envelope")
return {run = test.run_cases(function()
    test.describe("native secondary failure context", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(options.retryable), function()
                    local operation = errors.new({kind = errors.CONFLICT, message = "operation refusal",
                        retryable = false, details = {code = "operation", nested = {value = 1}}})
                    local secondary = errors.new({kind = kind, message = "secondary refusal", retryable = options.retryable,
                        details = {code = "secondary", cause = {original = true}, operation_error = {original = true}, nested = {value = 2}}})
                    local wrapped = envelope.wrap_secondary(secondary, operation, "cleanup failed")
                    test.eq(type(wrapped), "userdata")
                    test.eq(wrapped:kind(), secondary:kind())
                    test.eq(wrapped:retryable(), secondary:retryable())
                    local details = wrapped:details()
                    test.eq(details.code, "secondary")
                    test.eq(details.nested.value, 2)
                    test.eq(details.cause.kind, secondary:kind())
                    test.eq(details.cause.message, secondary:message())
                    test.eq(details.cause.retryable, secondary:retryable())
                    test.eq(details.cause.details.cause.original, true)
                    test.eq(details.cause.details.operation_error.original, true)
                    test.eq(details.operation_error.kind, operation:kind())
                    test.eq(details.operation_error.message, operation:message())
                    test.eq(details.operation_error.retryable, false)
                    test.eq(details.operation_error.details.code, "operation")
                    test.eq(details.operation_error.details.nested.value, 1)
                    test.eq(secondary:details().cause.original, true)
                    test.eq(secondary:details().operation_error.original, true)
                    test.eq(operation:details().nested.value, 1)
                end)
            end
        end
    end)
end)}
