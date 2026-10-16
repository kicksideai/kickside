local test = require("test")
local writer = require("writer")
local fixture = require("fixture")
local sql = require("sql")
local function required(err: error?): error
    if not err then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "transaction guard requires an error"})) end
    return err
end
local function invoke(): (any, error?) return writer.pause(fixture.database(), "thread", {cursor_id = "cursor"}) end
return {run = test.run_cases(function()
    test.describe("projection transaction native outcomes", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, stage in ipairs({"dialect", "begin", "operation", "commit", "rollback"}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
                    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(dialect .. "/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                            local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                                details = {code = "projection_transaction_dependency", nested = {marker = "kept"}}})
                            local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "opaque operation",
                                details = {code = "projection_transaction_primary"}})
                            fixture.reset(stage == "rollback" and "operation" or stage, stage == "rollback" and primary or source,
                                stage == "rollback" and source or nil, dialect)
                            local value, err = invoke(); test.is_nil(value); local actual = required(err)
                            test.eq(actual:kind(), source:kind()); test.eq(actual:details().code, "projection_transaction_dependency")
                            test.eq(actual:details().nested.marker, "kept")
                            if stage == "commit" or stage == "rollback" then
                                test.is_false(actual:retryable()); test.eq(actual:details().cause.kind, source:kind())
                                test.eq(actual:details().cause.retryable, source:retryable())
                            else test.eq(actual:retryable(), source:retryable()) end
                            if stage == "rollback" then test.eq(actual:details().operation_error.details.code, "projection_transaction_primary") end
                            test.eq(fixture.commits, stage == "commit" and 1 or 0)
                            test.eq(fixture.rollbacks, (stage == "operation" or stage == "rollback") and 1 or 0)
                            test.eq(fixture.notifications, 0)
                        end)
                    end
                end
            end
            for _, stage in ipairs({"dialect", "begin", "commit", "rollback"}) do
                for index, proof in ipairs({{}, {value = false}, {value = 1}, {value = ""}, {value = {}}}) do
                    test.it("mandatory proof/" .. dialect .. "/" .. stage .. "/" .. tostring(index), function()
                        fixture.reset(stage == "rollback" and "operation" or "", stage == "rollback" and errors.new({kind = errors.CONFLICT, retryable = true, message = "opaque"}) or nil, nil, dialect)
                        fixture.proof_stage, fixture.proof = stage, proof.value
                        local ok, value, err = pcall(invoke)
                        test.is_true(ok); test.is_nil(value); local actual = required(err)
                        test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                        test.eq(actual:details().code, "projection_transaction_response")
                        test.eq(fixture.notifications, 0)
                    end)
                end
            end
            test.it("healthy projection transaction/" .. dialect, function()
                fixture.reset("", nil, nil, dialect); local value, err = invoke()
                test.is_nil(err); test.eq(value.cursor_id, "cursor"); test.eq(value.status, "paused")
                test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0); test.eq(fixture.notifications, 1)
            end)
        end
    end)
end)}
