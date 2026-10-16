local test = require("test")
local boundary = require("boundary")
local sql = require("sql")
local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "transaction response lacks proof",
        details = {code = "sql_transaction_response", field = field}})
end
local function required(err: error?): error
    if not err then error(response_error("guard.error")) end
    return err
end
local function source(kind: string, retryable: boolean?): error
    return errors.new({kind = kind, retryable = retryable, message = "opaque dependency refusal",
        details = {code = "sql_transaction_dependency", nested = {marker = "kept"}}})
end
return {run = test.run_cases(function()
    test.describe("SQL transaction completion capability", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, has_primary in ipairs({false, true}) do
                    test.it("strict rollback/" .. kind .. "/" .. tostring(policy.retryable) .. "/" .. tostring(has_primary), function()
                        local secondary = source(kind, policy.retryable)
                        local primary = has_primary and source(errors.PERMISSION_DENIED, false) or nil
                        local tx: any = {rollback = function(): (any, error?) return nil, secondary end}
                        local err = required(boundary.rollback(tx, primary, "rollback", response_error))
                        test.eq(err:kind(), secondary:kind()); test.is_false(err:retryable())
                        test.eq(err:details().code, "sql_transaction_dependency")
                        test.eq(err:details().nested.marker, "kept")
                        test.eq(err:details().cause.kind, secondary:kind())
                        test.eq(err:details().cause.retryable, secondary:retryable())
                        if primary then
                            test.eq(err:details().operation_error.kind, primary:kind())
                            test.eq(err:details().operation_error.details.code, "sql_transaction_dependency")
                        end
                        test.eq(secondary:retryable(), policy.retryable)
                        local old = required(boundary.rollback(tx, primary, "rollback"))
                        test.eq(old:kind(), secondary:kind()); test.eq(old:retryable(), secondary:retryable())
                    end)
                end
            end
        end
        for index, proof in ipairs({{}, {value = false}, {value = 1}, {value = "true"}, {value = {}}}) do
            for _, has_primary in ipairs({false, true}) do
                test.it("rollback mandatory proof/" .. tostring(index) .. "/" .. tostring(has_primary), function()
                    local primary = has_primary and source(errors.CONFLICT, true) or nil
                    local tx: any = {rollback = function(): (any, error?) return proof.value, nil end}
                    local err = required(boundary.rollback(tx, primary, "rollback", response_error))
                    test.is_true(errors.is(err, errors.INTERNAL)); test.is_false(err:retryable())
                    test.eq(err:details().code, "sql_transaction_response")
                    test.eq(err:details().field, "transaction.rollback")
                    if primary then test.eq(err:details().operation_error.kind, primary:kind()) end
                end)
            end
        end
        test.it("strict rollback uses the caller's response field", function()
            local tx: any = {rollback = function(): (any, error?) return nil, nil end}
            local err = required(boundary.rollback(tx, nil, "rollback", response_error, "owner.rollback"))
            test.eq(err:details().field, "owner.rollback")
            test.is_false(err:retryable())
        end)
        test.it("confirmed rollback retains the original failure", function()
            local primary = source(errors.UNAVAILABLE, true)
            local tx: any = {rollback = function(): (any, error?) return true, nil end}
            test.eq(boundary.rollback(tx, primary, "rollback", response_error), primary)
            test.is_nil(boundary.rollback(tx, nil, "rollback", response_error))
        end)
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                for _, stage in ipairs({"begin", "operation", "commit", "rollback"}) do
                    test.it("transaction/" .. stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local dependency = source(kind, policy.retryable)
                        local primary = source(errors.PERMISSION_DENIED, false)
                        local commits, rollbacks, calls = 0, 0, 0
                        local tx: any = {
                            commit = function(): (any, error?)
                                commits = commits + 1
                                if stage == "commit" then return nil, dependency end
                                return true, nil
                            end,
                            rollback = function(): (any, error?)
                                rollbacks = rollbacks + 1
                                if stage == "rollback" then return nil, dependency end
                                return true, nil
                            end,
                        }
                        local db: any = {begin = function(): (any, error?)
                            if stage == "begin" then return nil, dependency end
                            return tx, nil
                        end}
                        local result, err = boundary.transaction(db, function(_tx: sql.Transaction): (any, error?)
                            calls = calls + 1
                            if stage == "operation" then return nil, dependency end
                            if stage == "rollback" then return nil, primary end
                            return {ok = true}, nil
                        end, "operation", response_error)
                        test.is_nil(result); local actual = required(err)
                        test.eq(actual:kind(), dependency:kind())
                        if stage == "commit" or stage == "rollback" then test.is_false(actual:retryable())
                        else test.eq(actual:retryable(), dependency:retryable()) end
                        test.eq(actual:details().code, "sql_transaction_dependency")
                        test.eq(actual:details().nested.marker, "kept")
                        if stage == "commit" or stage == "rollback" then
                            test.eq(actual:details().cause.kind, dependency:kind())
                            test.eq(actual:details().cause.retryable, dependency:retryable())
                        end
                        if stage == "rollback" then test.eq(actual:details().operation_error.kind, primary:kind()) end
                        test.eq(calls, stage == "begin" and 0 or 1)
                        test.eq(commits, stage == "commit" and 1 or 0)
                        test.eq(rollbacks, (stage == "operation" or stage == "rollback") and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"begin", "commit", "rollback"}) do
            for index, proof in ipairs({{}, {value = false}, {value = 1}, {value = "true"}, {value = {}}}) do
                test.it("transaction mandatory proof/" .. stage .. "/" .. tostring(index), function()
                    local calls = 0
                    local tx: any = {
                        commit = function(): (any, error?) if stage == "commit" then return proof.value, nil end; return true, nil end,
                        rollback = function(): (any, error?) return proof.value, nil end,
                    }
                    local db: any = {begin = function(): (any, error?)
                        if stage == "begin" then return proof.value, nil end
                        return tx, nil
                    end}
                    local result, err = boundary.transaction(db, function(_tx: sql.Transaction): (any, error?)
                        calls = calls + 1
                        if stage == "rollback" then return nil, source(errors.CONFLICT, true) end
                        return {ok = true}, nil
                    end, "operation", response_error)
                    test.is_nil(result); local actual = required(err)
                    test.is_true(errors.is(actual, errors.INTERNAL)); test.is_false(actual:retryable())
                    test.eq(actual:details().code, "sql_transaction_response")
                    test.eq(calls, stage == "begin" and 0 or 1)
                end)
            end
        end
        test.it("shared transaction commits the callback value once", function()
            local calls, commits, rollbacks = 0, 0, 0
            local expected = {ok = true}
            local tx: any = {commit = function(): (any, error?) commits = commits + 1; return true, nil end,
                rollback = function(): (any, error?) rollbacks = rollbacks + 1; return true, nil end}
            local db: any = {begin = function(): (any, error?) return tx, nil end}
            local value, err = boundary.transaction(db, function(actual: sql.Transaction): (any, error?)
                test.eq(actual, tx); calls = calls + 1; return expected, nil
            end, "operation", response_error)
            test.is_nil(err); test.eq(value, expected)
            test.eq(calls, 1); test.eq(commits, 1); test.eq(rollbacks, 0)
        end)
        test.it("shared transaction capability exists", function()
            test.eq(type(boundary.transaction), "function")
        end)
    end)
end)}
