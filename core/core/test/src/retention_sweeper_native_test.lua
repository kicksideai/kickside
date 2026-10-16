local test = require("test")
local sweeper = require("sweeper")
local fixture = require("fixture")
local sql = require("sql")
local cases = {
    {method = "run", stage = "policy", policies = 1, types = 0, queries = 0, prunes = 0, purges = 0},
    {method = "run", stage = "type", policies = 1, types = 1, queries = 0, prunes = 0, purges = 0},
    {method = "run", stage = "heads", policies = 1, types = 1, queries = 1, prunes = 0, purges = 0},
    {method = "run", stage = "prune", policies = 1, types = 1, queries = 1, prunes = 1, purges = 0},
    {method = "run", stage = "purge", policies = 1, types = 1, queries = 1, prunes = 1, purges = 1},
    {method = "next_deadline_ms", stage = "policy", policies = 1, types = 0, queries = 0, prunes = 0, purges = 0},
    {method = "next_deadline_ms", stage = "type", policies = 1, types = 1, queries = 0, prunes = 0, purges = 0},
    {method = "next_deadline_ms", stage = "heads", policies = 1, types = 1, queries = 1, prunes = 0, purges = 0},
    {method = "next_deadline_ms", stage = "receipts", policies = 1, types = 1, queries = 2, prunes = 0, purges = 0},
    {method = "run_for_thread", stage = "type", policies = 0, types = 1, queries = 0, prunes = 0, purges = 0},
    {method = "run_for_thread", stage = "heads", policies = 0, types = 1, queries = 1, prunes = 0, purges = 0},
    {method = "run_for_thread", stage = "policy", policies = 1, types = 1, queries = 1, prunes = 0, purges = 0},
    {method = "run_for_thread", stage = "prune", policies = 1, types = 1, queries = 1, prunes = 1, purges = 0},
}
return {run = test.run_cases(function()
    test.describe("native retention sweeper dependencies", function()
        for _, case in ipairs(cases) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(case.method .. "/" .. case.stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "retention sweeper dependency failure",
                            retryable = options.retryable, details = {code = "retention_sweeper_dependency", nested = {stage = case.stage}}})
                        fixture.reset(case.method, case.stage, source, sql.type.SQLITE)
                        local result, err = sweeper[case.method](fixture.database(), "thread")
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "retention_sweeper_dependency")
                        test.eq(err:details().nested.stage, case.stage)
                        test.eq(fixture.policies, case.policies)
                        test.eq(fixture.types, case.types)
                        test.eq(fixture.queries, case.queries)
                        test.eq(fixture.prunes, case.prunes)
                        test.eq(fixture.purges, case.purges)
                    end)
                end
            end
        end
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, method in ipairs({"run", "run_for_thread", "next_deadline_ms"}) do
                test.it("retains healthy sweep/deadline behavior/" .. dialect .. "/" .. method, function()
                    fixture.reset(method, "", nil, dialect)
                    local result, err = sweeper[method](fixture.database(), "thread")
                    test.is_nil(err)
                    if method == "next_deadline_ms" then
                        test.eq(type(result), "number")
                        test.eq(fixture.queries, 2)
                        test.eq(fixture.prunes, 0)
                        test.eq(fixture.purges, 0)
                    else
                        test.eq(result.events, 1)
                        test.eq(fixture.queries, 1)
                        test.eq(fixture.prunes, 1)
                        test.eq(fixture.purges, method == "run" and 1 or 0)
                        if method == "run" then
                            test.eq(result.write_receipts, 0)
                            test.eq(result.needs_continue, false)
                        end
                    end
                    test.eq(fixture.policies, 1)
                    test.eq(fixture.types, 1)
                end)
            end
        end
    end)
end)}
