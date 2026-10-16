local test = require("test")
local fixture = require("fixture")
local api = require("api")
local canonical_json = require("canonical_json")
local error_envelope = require("error_envelope")
local sql = require("sql")
local function encoded(value: any): string
    local data, err = canonical_json.encode(value)
    if err then error(err) end
    if not data then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "create guard requires JSON proof"})) end
    return data
end
local function call(): (any, error?)
    return api.create(fixture.database(), {component_id = "thread", trusted_audit = true}, nil, {system = true}, nil, true)
end
return {run = test.run_cases(function()
    test.describe("native existing-component thread creation transactions", function()
        local kinds = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
            errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}
        for _, stage in ipairs({"begin", "insert", "commit"}) do
            for _, kind in ipairs(kinds) do
                for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local source = errors.new({kind = kind, retryable = policy.retryable, message = "opaque",
                            details = {code = "create_transaction_dependency", nested = {marker = "kept"}}})
                        fixture.reset(stage, source, nil); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), source:kind())
                        if stage == "commit" then test.is_false(err:retryable()) else test.eq(err:retryable(), source:retryable()) end
                        test.eq(err:details().code, source:details().code); test.eq(err:details().nested.marker, "kept")
                        if stage == "commit" then test.eq(encoded(err:details().cause), encoded(error_envelope.encode(source)))
                        else test.eq(encoded(err:details()), encoded(source:details())) end
                        test.eq(fixture.begins, 1); test.eq(fixture.inserts, stage == "begin" and 0 or 1)
                        test.eq(fixture.commits, stage == "commit" and 1 or 0); test.eq(fixture.rollbacks, stage == "insert" and 1 or 0)
                        test.eq(fixture.attachments, 0)
                    end)

                end
            end
        end
        for _, kind in ipairs(kinds) do
            for _, policy in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it("insert and rollback/" .. kind .. "/" .. tostring(policy.retryable), function()
                        local primary = errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "insert refuses", details = {code = "create_insert", nested = {marker = "primary"}}})
                        local secondary = errors.new({kind = kind, retryable = policy.retryable, message = "rollback refuses", details = {code = "create_rollback", nested = {marker = "secondary"}}})
                        fixture.reset("insert", primary, secondary); local value, err = call()
                        test.is_nil(value); test.not_nil(err); test.eq(err:kind(), secondary:kind()); test.is_false(err:retryable())
                        test.eq(err:details().code, "create_rollback"); test.eq(err:details().nested.marker, "secondary")
                        test.eq(encoded(err:details().operation_error), encoded(error_envelope.encode(primary)))
                        test.eq(encoded(err:details().cause.details.cause), encoded(error_envelope.encode(secondary)))
                        test.eq(fixture.rollbacks, 1); test.eq(fixture.commits, 0); test.eq(fixture.attachments, 0)
                    end)
            end
        end
        for _, stage in ipairs({"missing_begin", "invalid_begin", "missing_commit"}) do
            test.it(stage .. "/mandatory proof", function()
                fixture.reset(stage, nil, nil); local value, err = call()
                test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
                test.not_nil(err:details().code); test.eq(fixture.attachments, 0)
            end)
        end
        test.it("missing rollback proof keeps the failed operation", function()
            local primary = errors.new({kind = errors.INVALID, retryable = false, message = "insert refuses", details = {code = "create_insert"}})
            fixture.reset("missing_rollback", primary, nil)
            local value, err = call()
            test.is_nil(value); test.not_nil(err); test.eq(err:kind(), errors.INTERNAL); test.is_false(err:retryable())
            test.eq(err:details().operation_error.kind, primary:kind()); test.eq(err:details().operation_error.details.code, "create_insert")
        end)
        test.it("healthy existing-component attachment keeps its shape", function()
            fixture.reset("", nil, nil); local value, err = call()
            test.is_nil(err); test.eq(value.component_id, "thread"); test.eq(value.thread.marker, "kept")
            test.eq(fixture.commits, 1); test.eq(fixture.rollbacks, 0); test.eq(fixture.attachments, 1)
        end)
        test.it("real transaction lifecycle returns explicit success proof", function()
            local db, err = sql.get("app:db")
            if err then error(err) end
            if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "transaction probe requires a database"})) end
            local tx, begin_err = db:begin()
            if begin_err then error(begin_err) end
            if not tx then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "transaction probe requires a transaction"})) end
            local rolled, rollback_err = tx:rollback()
            if rollback_err then error(rollback_err) end
            local committed_tx, second_begin_err = db:begin()
            if second_begin_err then error(second_begin_err) end
            if not committed_tx then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "transaction probe requires a commit transaction"})) end
            local committed, commit_err = committed_tx:commit()
            local _, release_err = db:release()
            if commit_err then error(commit_err) end
            if release_err then error(release_err) end
            test.is_true(rolled); test.is_true(committed)
        end)
    end)
end)}
