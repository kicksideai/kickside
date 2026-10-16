local test = require("test")
local envelope = require("envelope")
return {run = test.run_cases(function()
    test.describe("native cleanup error composition", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, primary_kind in ipairs({false, errors.INVALID, errors.UNKNOWN}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(primary_kind), function()
                        local source = errors.new({kind = kind, message = "cleanup failed", retryable = options.retryable,
                            details = {code = "cleanup_source", nested = {marker = "kept"}}})
                        local primary = primary_kind and errors.new({kind = primary_kind, message = "operation failed", retryable = false,
                            details = {code = "operation_source", nested = {marker = "primary"}}}) or nil
                        local actual = envelope.cleanup(function() return nil, source end, primary, "cleanup context")
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "cleanup_source"); test.eq(actual:details().nested.marker, "kept")
                        if primary then
                            local encoded = actual:details().operation_error
                            test.eq(encoded.kind, primary:kind()); test.eq(encoded.retryable, primary:retryable())
                            test.eq(encoded.message, primary:message()); test.eq(encoded.details.code, "operation_source")
                            test.eq(encoded.details.nested.marker, "primary")
                        else test.is_nil(actual:details().operation_error) end
                        test.is_nil(source:details().operation_error)
                    end)
                end
                test.it("successful cleanup keeps primary/" .. kind .. "/" .. tostring(options.retryable), function()
                    local primary = errors.new({kind = kind, message = "operation failed", retryable = options.retryable,
                        details = {code = "operation_source", nested = {marker = "primary"}}})
                    local actual = envelope.cleanup(function() return true, nil end, primary, "cleanup context")
                    test.eq(actual, primary); test.eq(actual:kind(), primary:kind()); test.eq(actual:retryable(), primary:retryable())
                    test.eq(actual:details().code, "operation_source"); test.eq(actual:details().nested.marker, "primary")
                end)
            end
        end
        test.it("successful operation and cleanup return no failure", function()
            test.is_nil(envelope.cleanup(function() return true, nil end, nil, "cleanup context"))
        end)
    end)
end)}
