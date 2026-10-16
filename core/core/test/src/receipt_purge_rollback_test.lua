local test = require("test")
local purge = require("purge")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native receipt purge rollback failures", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(options.retryable), function()
                    local operation = errors.new({kind = errors.INVALID, message = "receipt operation refusal",
                        retryable = false, details = {code = "receipt_operation", nested = {value = 1}}})
                    local rollback = errors.new({kind = kind, message = "rollback refusal", retryable = options.retryable,
                        details = {code = "receipt_rollback", nested = {value = 2}}})
                    local db, counts = fixture.executor("delete", operation, true)
                    counts.rollback_error = rollback
                    local result, err = purge.run(db, "2020-01-01T00:00:00Z", 5)
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), rollback:kind())
                    test.eq(err:retryable(), rollback:retryable())
                    local details = err:details()
                    test.eq(details.code, "receipt_rollback")
                    test.eq(details.nested.value, 2)
                    test.eq(details.cause.kind, rollback:kind())
                    test.eq(details.cause.message, rollback:message())
                    test.eq(details.cause.retryable, rollback:retryable())
                    test.eq(details.cause.details.code, "receipt_rollback")
                    test.eq(details.operation_error.kind, operation:kind())
                    test.eq(details.operation_error.message, operation:message())
                    test.eq(details.operation_error.retryable, false)
                    test.eq(details.operation_error.details.code, "receipt_operation")
                    test.eq(details.operation_error.details.nested.value, 1)
                    test.eq(counts.rollbacks, 1)
                    test.eq(counts.commits, 0)
                    test.eq(counts.deletes, 1)
                end)
            end
        end
    end)
end)}
