local test = require("test")
local sql = require("sql")
local writer = require("writer")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native projection registration rollback failures", function()
        for _, stage in ipairs({"query_1", "write_2"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local db, open_err = sql.get("app:db")
                        if open_err then error(open_err) end
                        if not db then error(errors.new({kind = errors.INTERNAL, message = "rollback guard has no database", retryable = false})) end
                        local dbtype, dialect_err = db:type(); db:release()
                        if dialect_err then error(dialect_err) end
                        local primary = errors.new({kind = errors.CONFLICT, retryable = false,
                            message = "registration refuses", details = {code = "registration_refusal", nested = {stage = stage}}})
                        local source = errors.new({kind = kind, retryable = options.retryable,
                            message = "rollback refuses", details = {code = "rollback_refusal", nested = {stage = stage}}})
                        fixture.reset(dbtype, stage, primary, false)
                        fixture.rollback_source = source
                        local result, err = writer.register_projection(fixture.database(), "thread", {
                            kind = "model", worker_ref = "func://app:test_count_worker", system_identity = true})
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.is_false(err:retryable())
                        test.eq(err:details().cause.retryable, source:retryable())
                        test.eq(err:details().cause.details.cause.retryable, source:retryable())
                        local details = err:details()
                        test.eq(details.code, "rollback_refusal")
                        test.eq(details.nested.stage, stage)
                        local cause = errors.new(details.cause)
                        test.eq(cause:kind(), source:kind())
                        test.eq(cause:retryable(), source:retryable())
                        test.eq(cause:details().code, "rollback_refusal")
                        local preceding = errors.new(details.operation_error)
                        test.eq(preceding:kind(), primary:kind())
                        test.eq(preceding:retryable(), primary:retryable())
                        test.eq(preceding:details().code, "registration_refusal")
                        test.eq(preceding:details().nested.stage, stage)
                        test.eq(fixture.rollbacks, 1)
                        test.eq(fixture.commits, 0)
                        test.eq(fixture.notifications, 0)
                        test.is_nil(source:details().operation_error)
                        test.eq(source:details().nested.stage, stage)
                    end)
                end
            end
        end
    end)
end)}
