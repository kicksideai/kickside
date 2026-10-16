local test = require("test")
local writer = require("writer")
local fixture = require("fixture")
local sql = require("sql")
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "registration completion guard requires an error"})) end
    return err
end
local function invoke(): (any, error?)
    return writer.register_projection(fixture.database(), "thread", {kind = "model", worker_ref = "func://app:test_count_worker",
        system_identity = true, reset = true})
end
return {run = test.run_cases(function()
    test.describe("registration native completion outcomes", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, stage in ipairs({"type", "begin", "commit", "rollback", "nudge", "retention"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(dialect .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local cause = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                                details = {code = "register_completion_dependency", nested = {stage = stage}}})
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque operation",
                                details = {code = "register_completion_primary"}})
                            fixture.reset(dialect, stage == "rollback" and "query_1" or stage, stage == "rollback" and primary or cause, false)
                            if stage == "rollback" then fixture.rollback_source = cause end
                            local value, err = invoke(); test.is_nil(value); local actual = required(err)
                            test.eq(actual:kind(), cause:kind()); test.eq(actual:details().code, "register_completion_dependency")
                            test.eq(actual:details().nested.stage, stage)
                            if stage == "type" or stage == "begin" then test.eq(actual:retryable(), cause:retryable())
                            else
                                test.is_false(actual:retryable()); test.eq(actual:details().cause.kind, cause:kind())
                                test.eq(actual:details().cause.retryable, cause:retryable())
                                test.eq(actual:details().cause.details.code, "register_completion_dependency")
                            end
                            if stage == "rollback" then test.eq(actual:details().operation_error.details.code, "register_completion_primary") end
                            test.eq(fixture.commits, (stage == "commit" or stage == "nudge" or stage == "retention") and 1 or 0)
                            test.eq(fixture.rollbacks, stage == "rollback" and 1 or 0)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"type", "begin", "commit", "rollback"}) do
                for index, proof in ipairs({{}, {value = false}, {value = 1}, {value = ""}, {value = {}}}) do
                    test.it("mandatory proof/" .. dialect .. "/" .. stage .. "/" .. tostring(index), function()
                        fixture.reset(dialect, stage == "rollback" and "query_1" or "", stage == "rollback" and errors.new({kind = errors.CONFLICT, retryable = true, message = "opaque"}) or nil, false)
                        fixture.proof_stage, fixture.proof = stage, proof.value
                        local ok, value, err = pcall(invoke); test.is_true(ok); test.is_nil(value); local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "projection_registration_response")
                        test.eq(fixture.notifications, 0); test.eq(fixture.retention_notifications, 0)
                    end)
                end
            end
            test.it("healthy output and no retention subscriber remain valid/" .. dialect, function()
                fixture.reset(dialect, "", nil, false); local value, err = invoke()
                test.is_nil(err); test.not_nil(value); test.is_true(value.created)
                test.eq(fixture.commits, 1); test.eq(fixture.notifications, 1); test.eq(fixture.retention_notifications, 1)
            end)
        end
    end)
end)}
