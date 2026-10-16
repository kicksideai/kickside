local test = require("test")
local context = require("context")
return {run = test.run_cases(function()
    test.describe("native component result annotations", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, annotated in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(annotated), function()
                        local source = errors.new({kind = kind, message = "result failure", retryable = options.retryable,
                            details = {code = "result_source", error_kind = "source_classification", nested = {marker = "kept"},
                                cause = {code = "earlier_cause", nested = {marker = "earlier"}}}})
                        local result: any = {success = false, error = source:message(), kind = source:kind(),
                            retryable = source:retryable(), details = source:details()}
                        if annotated then result.error_kind = "result_classification" end
                        local actual = context.result_error(result, "read")
                        if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "result guard requires failure"})) end
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "result_source"); test.eq(actual:details().nested.marker, "kept")
                        test.eq(actual:details().cause.code, "earlier_cause"); test.eq(actual:details().cause.nested.marker, "earlier")
                        test.eq(actual:details().error_kind, annotated and "result_classification" or "source_classification")
                        test.eq(result.details.error_kind, "source_classification")
                    end)
                end
            end
        end
        test.it("successful annotated result remains successful", function()
            test.is_nil(context.result_error({success = true, error_kind = "result_classification"}, "read"))
        end)
        test.it("missing failure details accept the existing result classification", function()
            local actual = context.result_error({success = false, error = "refused", kind = errors.PERMISSION_DENIED,
                retryable = false, error_kind = "access"}, "read")
            test.eq(actual:kind(), errors.PERMISSION_DENIED); test.is_false(actual:retryable())
            test.eq(actual:details().error_kind, "access")
        end)
    end)
end)}
