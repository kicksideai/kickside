local test = require("test")
local teardown = require("teardown")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
return {run = test.run_cases(function()
    test.describe("native inherited component cleanup annotations", function()
        for _, kind in ipairs(kinds) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, fence in ipairs({{owns = true}, {owns = false}, {}}) do
                    test.it(kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(fence.owns), function()
                        local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup refused",
                            details = {code = "inherited_cleanup", nested = {marker = "kept"}, discarded = 7,
                                cause = {original = "kept"}}})
                        local actual = teardown.retain_failed_delete(source, fence.owns)
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "inherited_cleanup"); test.eq(actual:details().nested.marker, "kept")
                        test.eq(actual:details().discarded, 7)
                        if fence.owns == true then
                            local pending, more = teardown.cleanup_pending(actual); test.is_false(pending); test.is_false(more)
                            test.eq(actual:details().cause.original, "kept")
                        else
                            local pending, more = teardown.cleanup_pending(actual); test.is_true(pending); test.is_false(more)
                            test.eq(actual:details().wait_for, "cleanup_retry")
                            test.eq(actual:details().cause.kind, source:kind()); test.eq(actual:details().cause.retryable, source:retryable())
                            test.eq(actual:details().cause.details.code, "inherited_cleanup")
                            test.eq(actual:details().cause.details.cause.original, "kept")
                        end
                    end)
                end
                test.it("existing pending/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, retryable = options.retryable, message = "cleanup continues",
                        details = {code = "inherited_cleanup", cleanup_pending = true, needs_continue = true, cause = {marker = "kept"}}})
                    local actual = teardown.retain_failed_delete(source, false)
                    test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                    test.eq(actual:details().code, "inherited_cleanup"); test.eq(actual:details().cause.marker, "kept")
                    local pending, more = teardown.cleanup_pending(actual); test.is_true(pending); test.is_true(more)
                    test.is_nil(actual:details().wait_for)
                end)
            end
        end
    end)
end)}
