local test = require("test")
local teardown = require("teardown")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native component teardown causes", function()
        for _, stage in ipairs({"database", "scan", "contract", "open", "purge", "remove_database", "remove", "retry_database", "retry_stamp"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "teardown dependency refusal", retryable = options.retryable,
                            details = {code = "teardown_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source)
                        local count, actual = teardown.reap_pending(1); test.is_nil(count)
                        if not actual then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "teardown guard requires failure"})) end
                        test.eq(actual:kind(), source:kind()); test.eq(actual:retryable(), source:retryable())
                        test.eq(actual:details().code, "teardown_dependency"); test.eq(actual:details().nested.marker, "kept")
                        test.eq(fixture.releases, fixture.acquisitions - ((stage == "database" or stage == "remove_database" or stage == "retry_database") and 1 or 0))
                    end)
                end
            end
        end
        test.it("healthy reap removes one pointer", function()
            fixture.reset("", nil); local count, err = teardown.reap_pending(1)
            test.eq(count, 1); test.is_nil(err); test.eq(fixture.deletes, 1); test.eq(fixture.releases, 2)
        end)
    end)
end)}
