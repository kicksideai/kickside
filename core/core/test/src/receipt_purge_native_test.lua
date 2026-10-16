local test = require("test")
local purge = require("purge")
local fixture = require("fixture")
local executor = fixture.executor
return {run = test.run_cases(function()
    test.describe("native committed receipt purge dependencies", function()
        for _, owned in ipairs({true, false}) do
            local stages = owned and {"query", "begin", "delete", "commit"} or {"query", "delete"}
            for _, stage in ipairs(stages) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(stage .. "/" .. tostring(owned) .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "receipt purge dependency refusal",
                                retryable = options.retryable, details = {code = "receipt_purge_dependency", nested = {stage = stage}}})
                            local db, counts = executor(stage, source, owned)
                            local result, err = purge.run(db, "2020-01-01T00:00:00Z", 5)
                            test.is_nil(result)
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "receipt_purge_dependency")
                            test.eq(err:details().nested.stage, stage)
                            test.eq(counts.queries, 1)
                            test.eq(counts.begins, owned and stage ~= "query" and 1 or 0)
                            test.eq(counts.deletes, (stage == "delete" or stage == "commit") and 1 or 0)
                            test.eq(counts.commits, stage == "commit" and 1 or 0)
                            test.eq(counts.rollbacks, owned and stage == "delete" and 1 or 0)
                        end)
                    end
                end
            end
            test.it("retains transaction ownership/" .. tostring(owned), function()
                local db, counts = executor("", nil, owned)
                local result, err = purge.run(db, "2020-01-01T00:00:00Z", 5)
                test.is_nil(err)
                test.eq(result.deleted, 1)
                test.eq(counts.queries, 1)
                test.eq(counts.deletes, 1)
                test.eq(counts.begins, owned and 1 or 0)
                test.eq(counts.commits, owned and 1 or 0)
                test.eq(counts.rollbacks, 0)
            end)
        end
    end)
end)}
