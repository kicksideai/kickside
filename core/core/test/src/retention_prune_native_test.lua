local test = require("test")
local prune = require("prune")
local fixture = require("fixture")
local sql = require("sql")
return {run = test.run_cases(function()
    test.describe("native retention prune dependencies", function()
        for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
            for _, stage in ipairs({"dialect", "thread", "prefix", "delete", "boundary", "begin", "commit"}) do
                if dialect == sql.type.SQLITE or (stage ~= "delete" and stage ~= "boundary") then
                    for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                        errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                        errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                        for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                            test.it(dialect .. "/" .. stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                                local source = errors.new({kind = kind, message = "retention prune dependency failure",
                                    retryable = options.retryable, details = {code = "retention_prune_dependency", nested = {stage = stage, dialect = dialect}}})
                                fixture.reset(stage, source, dialect)
                                local result, err
                                local opts = {cutoff = "2026-01-01", batch_size = 1, max_total = 1}
                                if stage == "begin" or stage == "commit" then
                                    result, err = prune.prune_thread(fixture.database(), "thread", opts)
                                else result, err = prune.prune_tx(fixture.transaction(), "thread", opts) end
                                test.is_nil(result)
                                test.eq(type(err), "userdata")
                                test.eq(err:kind(), source:kind())
                                test.eq(err:retryable(), source:retryable())
                                test.eq(err:details().code, "retention_prune_dependency")
                                test.eq(err:details().nested.stage, stage)
                                test.eq(err:details().nested.dialect, dialect)
                                test.eq(fixture.queries, (stage == "dialect" or stage == "begin") and 0 or stage == "thread" and 1 or 2)
                                local writes = stage == "delete" and 1 or (stage == "boundary" or stage == "commit") and 2 or 0
                                test.eq(fixture.writes, dialect == sql.type.SQLITE and writes or 0)
                                test.eq(fixture.begins, (stage == "begin" or stage == "commit") and 1 or 0)
                                test.eq(fixture.commits, stage == "commit" and 1 or 0)
                                test.eq(fixture.rollbacks, 0)
                            end)
                        end
                    end
                end
            end
            test.it("retains a bounded owned prune transaction/" .. dialect, function()
                fixture.reset("", nil, dialect)
                local result, err = prune.prune_thread(fixture.database(), "thread", {cutoff = "2026-01-01", batch_size = 1, max_total = 1})
                test.is_nil(err)
                test.eq(result.deleted, 1)
                test.eq(result.max_pruned_seq, 5)
                test.eq(fixture.queries, 2)
                test.eq(fixture.writes, dialect == sql.type.SQLITE and 2 or 0)
                test.eq(fixture.begins, 1)
                test.eq(fixture.commits, 1)
                test.eq(fixture.rollbacks, 0)
            end)
        end
    end)
end)}
