local test = require("test")
local pin = require("pin")
local fixture = require("fixture")
local cases = {
    {stage = "dialect", method = "lower_tx", queries = 0, writes = 0},
    {stage = "thread_lock", method = "lower_tx", query_fail = 1, queries = 1, writes = 0},
    {stage = "pin_lock", method = "lower_tx", query_fail = 2, queries = 2, writes = 0},
    {stage = "tomb_lock", method = "lower_tx", query_fail = 3, queries = 3, writes = 0},
    {stage = "lower_insert", method = "lower_tx", write_fail = 1, queries = 3, writes = 1},
    {stage = "lower_update", method = "lower_tx", active = true, write_fail = 1, queries = 3, writes = 1},
    {stage = "fence_update", method = "fence_tx", active = true, write_fail = 1, queries = 3, writes = 1},
    {stage = "raise_update", method = "raise_tx", active = true, write_fail = 1, queries = 3, writes = 1},
    {stage = "release_delete", method = "release_tx", active = true, write_fail = 1, queries = 3, writes = 1},
    {stage = "tomb_insert", method = "release_tx", active = true, write_fail = 2, queries = 3, writes = 2},
    {stage = "tomb_update", method = "release_tx", active = true, tomb = true, write_fail = 2, queries = 3, writes = 2},
    {stage = "read", method = "read", query_fail = 1, queries = 1, writes = 0},
    {stage = "begin", method = "pin_lower", queries = 0, writes = 0},
    {stage = "commit", method = "pin_lower", queries = 3, writes = 1},
}
local function request(): table
    return {thread_id = "thread", consumer_key = "consumer", command_id = "new-command",
        command_generation = 2, target_cursor = 0, expected_pin_generation = 1, new_cursor = 5, terminal_op_id = "terminal"}
end
return {run = test.run_cases(function()
    test.describe("native retention pin dependency failures", function()
        for _, case in ipairs(cases) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(case.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "retention pin dependency failure",
                            retryable = options.retryable, details = {code = "retention_pin_dependency", nested = {stage = case.stage}}})
                        fixture.reset(case.stage, source, case.query_fail or 0, case.write_fail or 0,
                            case.active == true, case.tomb == true)
                        local result, err
                        if case.method == "read" then result, err = pin.read({} :: any, "thread", "consumer")
                        elseif case.method == "pin_lower" then result, err = pin.pin_lower(fixture.database(), request())
                        else result, err = pin[case.method](fixture.transaction(), request()) end
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "retention_pin_dependency")
                        test.eq(err:details().nested.stage, case.stage)
                        test.eq(fixture.queries, case.queries)
                        test.eq(fixture.writes, case.writes)
                        test.eq(fixture.begins, case.method == "pin_lower" and 1 or 0)
                        test.eq(fixture.commits, case.stage == "commit" and 1 or 0)
                        test.eq(fixture.rollbacks, 0)
                    end)
                end
            end
        end
        for _, method in ipairs({"lower_tx", "fence_tx", "raise_tx", "release_tx", "cleanup_tombstone_tx", "pin_lower"}) do
            test.it("retains healthy pin operations/" .. method, function()
                fixture.reset("", nil, 0, 0, method ~= "lower_tx" and method ~= "pin_lower", false)
                local result, err
                if method == "pin_lower" then result, err = pin.pin_lower(fixture.database(), request())
                else result, err = pin[method](fixture.transaction(), request()) end
                test.is_nil(err)
                test.eq(type(result), "table")
                test.eq(fixture.queries, 3)
                test.eq(fixture.writes, (method == "release_tx" or method == "cleanup_tombstone_tx") and 2 or 1)
                test.eq(fixture.begins, method == "pin_lower" and 1 or 0)
                test.eq(fixture.commits, method == "pin_lower" and 1 or 0)
                test.eq(fixture.rollbacks, 0)
            end)
        end
    end)
end)}
