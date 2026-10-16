local test = require("test")
local sql = require("sql")
local writer = require("writer")

local KINDS = {errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID, errors.PERMISSION_DENIED,
    errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED, errors.CONFLICT, errors.TIMEOUT,
    errors.RATE_LIMITED, errors.UNKNOWN}

local function database(operation, stage, cause, rollback_cause)
    local calls = {queries = 0, writes = 0, commits = 0, rollbacks = 0}
    local tx = {}
    function tx:query()
        calls.queries = calls.queries + 1
        if stage == "query" .. calls.queries then return nil, cause end
        if calls.queries == 1 then return {{id = "thread"}}, nil end
        if operation == "remove_projection" then
            if calls.queries == 2 then return {{id = "projection", kind = "test", projection_key = "default"}}, nil end
            return {}, nil
        end
        return {{id = "cursor", projection_id = "projection", status = operation == "pause" and "active" or "paused",
            generation = 1, job_id = "job"}}, nil
    end
    function tx:execute()
        calls.writes = calls.writes + 1
        if stage == "write" .. calls.writes then return nil, cause end
        return {rows_affected = 1}, nil
    end
    function tx:commit()
        calls.commits = calls.commits + 1
        return nil, cause
    end
    function tx:rollback()
        calls.rollbacks = calls.rollbacks + 1
        if rollback_cause then return nil, rollback_cause end
        return true, nil
    end
    local db = {}
    function db:type()
        if stage == "type" then return nil, cause end
        return sql.type.SQLITE, nil
    end
    function db:begin()
        if stage == "begin" then return nil, cause end
        return tx, nil
    end
    return db, calls
end

local function assert_native(err, cause, uncertain)
    test.is_true(errors.is(err, cause:kind()))
    if uncertain then
        test.is_false(err:retryable())
        test.eq(err:details().cause.kind, cause:kind())
        test.eq(err:details().cause.retryable, cause:retryable())
        test.eq(err:details().cause.details.code, cause:details().code)
        test.eq(err:details().cause.details.nested.marker, cause:details().nested.marker)
    else test.eq(err:retryable(), cause:retryable()) end
    test.eq(err:details().code, cause:details().code)
    test.eq(err:details().nested.marker, cause:details().nested.marker)
end

local function define_tests()
    test.describe("projection control native failures", function()
        local stages = {
            pause = {"type", "begin", "query1", "query2", "write1", "commit"},
            resume = {"type", "begin", "query1", "query2", "write1"},
            remove_projection = {"type", "begin", "query1", "query2", "query3", "write1", "write2", "commit"},
        }
        for operation, failures in pairs(stages) do
            for _, stage in ipairs(failures) do
                test.it("preserves native metadata through " .. operation .. " " .. stage, function()
                    for _, kind in ipairs(KINDS) do
                        for _, retry in ipairs({"absent", "false", "true"}) do
                            local retryable = nil
                            if retry ~= "absent" then retryable = retry == "true" end
                            local details = {code = "control_dependency", nested = {marker = "kept"}}
                            local cause = errors.new({kind = kind, message = "control dependency failure",
                                retryable = retryable, details = details})
                            local db, calls = database(operation, stage, cause)
                            local result, err = writer[operation](db :: any, "thread", {cursor_id = "cursor", projection_id = "projection"})
                            test.is_nil(result)
                            assert_native(err, cause, stage == "commit")
                            test.eq(calls.commits, stage == "commit" and 1 or 0)
                            test.eq(calls.rollbacks, (stage:sub(1, 5) == "query" or stage:sub(1, 5) == "write") and 1 or 0)
                        end
                    end
                end)
            end
        end
        test.it("returns a native rollback failure instead of ignoring it", function()
            local cause = errors.new({kind = errors.INVALID, retryable = false, message = "control read failure", details = {code = "operation_failure", nested = {marker = "operation"}}})
            local rollback_cause = errors.new({kind = errors.UNAVAILABLE, retryable = false,
                message = "rollback failure", details = {code = "rollback_failed", nested = {marker = "kept"}, operation_error = {marker = "original"}}})
            local db, calls = database("pause", "query1", cause, rollback_cause)
            local result, err = writer.pause(db :: any, "thread", {cursor_id = "cursor"})
            test.is_nil(result)
            assert_native(err, rollback_cause, true)
            test.eq(err:details().operation_error.kind, cause:kind())
            test.eq(err:details().operation_error.retryable, cause:retryable())
            test.eq(err:details().operation_error.details.code, cause:details().code)
            test.eq(err:details().operation_error.details.nested.marker, cause:details().nested.marker)
            test.eq(err:details().cause.kind, rollback_cause:kind())
            test.eq(err:details().cause.details.cause.details.operation_error.marker, "original")
            test.eq(err:details().cause.details.operation_error.kind, cause:kind())
            test.eq(err:details().cause.details.cause.retryable, rollback_cause:retryable())
            test.eq(calls.rollbacks, 1)
            test.eq(calls.commits, 0)
        end)
    end)
end

return {run = test.run_cases(define_tests)}
