local test = require("test")
local envelope = require("envelope")
return {run = test.run_cases(function()
    test.describe("native component envelope causes", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, carried in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(carried), function()
                        local details: any = {code = "envelope_dependency", nested = {marker = "kept"}}
                        if carried then details.cause = {code = "earlier_cause", nested = {marker = "earlier"}} end
                        local source = errors.new({kind = kind, message = "dependency failure", retryable = options.retryable, details = details})
                        for _, context in ipairs({false, "service context"}) do
                            local failed = envelope.from_error(source, context or nil)
                            local client = envelope.error_of(failed, "client", "client context")
                            local call = envelope.call_error(source, "dispatch context")
                            test.eq(failed.kind, source:kind()); test.eq(failed.retryable, source:retryable())
                            test.eq(envelope.kind_of(source), source:kind())
                            for _, actual in ipairs({client, call}) do
                                test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                                local actual_details = actual:details()
                                test.eq(actual_details.code, "envelope_dependency"); test.eq(actual_details.nested.marker, "kept")
                                if carried then
                                    test.eq(actual_details.cause.code, "earlier_cause"); test.eq(actual_details.cause.nested.marker, "earlier")
                                else
                                    test.eq(actual_details.cause.kind, source:kind()); test.eq(actual_details.cause.retryable, source:retryable())
                                    test.eq(actual_details.cause.message, source:message()); test.eq(actual_details.cause.details.code, "envelope_dependency")
                                    test.eq(actual_details.cause.details.nested.marker, "kept")
                                end
                            end
                            if carried then test.eq(source:details().cause.code, "earlier_cause") else test.is_nil(source:details().cause) end
                        end
                    end)
                end
            end
        end
    end)
end)}
