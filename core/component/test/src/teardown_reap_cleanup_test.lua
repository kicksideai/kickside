local test = require("test")
local teardown = require("teardown")
local fixture = require("fixture")
local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
local function native(actual: error?, source: error)
    test.not_nil(actual); test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
    test.eq(actual:details().code, "reap_cleanup"); test.eq(actual:details().nested.marker, "kept")
end
return {run = test.run_cases(function()
    test.describe("native teardown reap cleanup", function()
        for _, stage in ipairs({"scan", "remove", "retry_stamp"}) do
            for _, kind in ipairs(kinds) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    for _, primary_failure in ipairs({false, true}) do
                        test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable) .. "/" .. tostring(primary_failure), function()
                            local primary = errors.new({kind = errors.INVALID, retryable = false, message = "operation refused",
                                details = {code = "reap_primary", nested = {marker = "primary"}}})
                            local source = errors.new({kind = kind, retryable = options.retryable, message = "release refused",
                                details = {code = "reap_cleanup", nested = {marker = "kept"}}})
                            fixture.reset(primary_failure and stage or "", primary)
                            if stage == "retry_stamp" then fixture.purge_source = primary end
                            fixture.release_sources[stage == "scan" and 1 or 2] = source
                            local count, actual = teardown.reap_pending(1); test.is_nil(count); native(actual, source)
                            test.eq(fixture.releases, stage == "scan" and 1 or 2)
                            test.eq(fixture.deletes, stage == "remove" and 1 or 0)
                            test.eq(fixture.purges, stage == "retry_stamp" and 1 or 0)
                            if primary_failure or stage == "retry_stamp" then
                                local cause = actual:details().operation_error
                                test.not_nil(cause); test.eq(cause.kind, primary:kind()); test.is_false(cause.retryable)
                                test.eq(cause.details.code, "reap_primary"); test.eq(cause.details.nested.marker, "primary")
                            end
                        end)
                    end
                end
            end
        end
        test.it("healthy reap keeps success and continuation", function()
            fixture.reset("", nil); local count, err, more, blocked = teardown.reap_pending(1)
            test.eq(count, 1); test.is_nil(err); test.is_true(more); test.eq(#blocked, 0)
            test.eq(fixture.releases, 2); test.eq(fixture.deletes, 1)
        end)
    end)
end)}
