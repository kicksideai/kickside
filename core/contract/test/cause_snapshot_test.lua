local test = require("test")
local envelope = require("envelope")
local function same_value(actual: any, expected: any)
    test.eq(type(actual), type(expected))
    if type(expected) ~= "table" then test.eq(actual, expected); return end
    for key, value in pairs(expected) do same_value(actual[key], value) end
    for key, _ in pairs(actual) do test.not_nil(expected[key]) end
end
return {run = test.run_cases(function()
    test.describe("native error cause snapshots", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, carried in ipairs({false, true}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(carried), function()
                        local details: any = {code = "cause_source", nested = {marker = "kept"}}
                        if carried then details.cause = {code = "earlier_cause", nested = {marker = "earlier"}} end
                        local source = errors.new({kind = kind, message = "native failure", retryable = options.retryable, details = details})
                        local snapshot = envelope.with_cause(source)
                        test.eq(snapshot:kind(), source:kind()); test.eq(snapshot:retryable(), source:retryable())
                        test.eq(snapshot:message(), source:message()); test.eq(snapshot:details().code, "cause_source")
                        test.eq(snapshot:details().nested.marker, "kept")
                        local cause = snapshot:details().cause
                        if carried then
                            test.eq(cause.code, "earlier_cause"); test.eq(cause.nested.marker, "earlier")
                            test.eq(source:details().cause.code, "earlier_cause")
                        else
                            test.eq(cause.kind, source:kind()); test.eq(cause.retryable, source:retryable())
                            test.eq(cause.message, source:message()); test.eq(cause.details.code, "cause_source")
                            test.eq(cause.details.nested.marker, "kept"); test.is_nil(source:details().cause)
                        end
                        local repeated = envelope.with_cause(snapshot)
                        test.eq(repeated, snapshot)
                        same_value(repeated:details().cause, cause)
                    end)
                end
            end
        end
    end)
end)}
