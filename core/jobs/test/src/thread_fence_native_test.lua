local test = require("test")
local fence = require("fence")
local operations = {
    lock = function(tx) local _, err = fence.lock(tx, "thread-a"); return err end,
    lock_many = function(tx) local _, err = fence.lock_many(tx, {"thread-a"}); return err end,
    admit = function(tx) return fence.admit(tx, {kind = "thread", id = "thread-a"}, "enqueue") end,
}
return {run = test.run_cases(function()
    test.describe("native Jobs thread owner fence dependencies", function()
        for name, operation in pairs(operations) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(name .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "thread fence dependency failure",
                            retryable = options.retryable, details = {code = "thread_fence_dependency", nested = {operation = name}}})
                        local calls = 0
                        local tx: any = {query = function()
                            calls = calls + 1
                            return nil, source
                        end}
                        local err = operation(tx)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "thread_fence_dependency")
                        test.eq(err:details().nested.operation, name)
                        test.eq(calls, 1)
                    end)
                end
            end
            for _, input in ipairs({{name = "missing"}, {name = "false", rows = false},
                {name = "number", rows = 42}, {name = "string", rows = "rows"},
                {name = "numeric row", rows = {42}}, {name = "boolean row", rows = {false}},
                {name = "string row", rows = {"row"}},
                {name = "empty", rows = {}, field = "thread_id"},
                {name = "other thread", rows = {{thread_id = "thread-b", started = false}}, field = "thread_id"}}) do
                test.it(name .. "/malformed/" .. input.name, function()
                    local calls = 0
                    local tx: any = {query = function() calls = calls + 1; return input.rows, nil end}
                    local err = operation(tx)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "job_thread_fence_response")
                    test.eq(err:details().field, input.field or "rows")
                    if input.field then test.eq(err:details().thread_id, "thread-a") end
                    test.eq(calls, 1)
                end)
            end
            test.it(name .. "/success", function()
                local calls = 0
                local tx: any = {query = function()
                    calls = calls + 1
                    return {{thread_id = "thread-a", started = false, next_page_seq = 1}}, nil
                end}
                test.is_nil(operation(tx))
                test.eq(calls, 1)
            end)
        end
        test.it("retains sorted unique lock order and returned state", function()
            local calls = 0
            local tx: any = {query = function(self, query, params)
                calls = calls + 1
                test.eq(#params, 2)
                test.eq(params[1], "thread-a")
                test.eq(params[2], "thread-b")
                return {{thread_id = "thread-a", started = 0, next_page_seq = 1},
                    {thread_id = "thread-b", started = 1, next_page_seq = 3, completed_at = "done"}}, nil
            end}
            local values, err = fence.lock_many(tx, {"thread-b", "thread-a", "thread-b"})
            test.is_nil(err)
            test.is_false(values["thread-a"].started)
            test.is_true(values["thread-b"].started)
            test.eq(values["thread-b"].next_page_seq, 3)
            test.eq(values["thread-b"].completed_at, "done")
            test.eq(calls, 1)
        end)
        test.it("retains empty lock input without a query", function()
            local calls = 0
            local tx: any = {query = function() calls = calls + 1 end}
            local values, err = fence.lock_many(tx, {})
            test.is_nil(err)
            test.eq(next(values), nil)
            test.eq(calls, 0)
        end)
        test.it("retains non-thread admission without a query", function()
            local calls = 0
            local tx: any = {query = function() calls = calls + 1 end}
            test.is_nil(fence.admit(tx, {kind = "system", id = "owner"}, "enqueue"))
            test.eq(calls, 0)
        end)
        test.it("retains deletion admission refusal and details", function()
            local tx: any = {query = function()
                return {{thread_id = "thread-a", started = true, next_page_seq = 1}}, nil
            end}
            local err = fence.admit(tx, {kind = "thread", id = "thread-a"}, "enqueue")
            test.is_true(errors.is(err, errors.CONFLICT))
            test.eq(err:retryable(), false)
            test.eq(err:details().reason, "thread_cleanup")
            test.eq(err:details().status, "blocked_source_deleted")
            test.eq(err:details().scope, "thread:thread-a")
            test.eq(err:details().blocked_operation, "enqueue")
        end)
    end)
end)}
