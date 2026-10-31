local test = require("test")
local sql = require("sql")
local ops = require("ops")
local component_id = "11111111-1111-4111-8111-111111111111"
local cases = {
    {name = "dialect", stage = "dialect", run = function(db) return ops.fence(db, component_id, ops.db_id()) end},
    {name = "fence query", stage = "query", run = function(db) return ops.fence(db, component_id, ops.db_id()) end},
    {name = "summary query", stage = "query", run = function(db) local _, err = ops.component_summary_tx(db, component_id); return err end},
    {name = "set delete mark", stage = "execute", run = function(db) return ops.mark_deleting_tx(db, component_id, true, "lease-token") end},
    {name = "clear delete mark", stage = "execute", run = function(db) return ops.mark_deleting_tx(db, component_id, false, "lease-token") end},
}
return {run = test.run_cases(function()
    test.describe("native component mutation fence dependencies", function()
        for _, entry in ipairs(cases) do
            for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(entry.name .. "/" .. dialect .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "mutation fence dependency failure",
                                retryable = options.retryable, details = {code = "mutation_dependency", nested = {stage = entry.stage}}})
                            local queries, writes = 0, 0
                            local db: any = {
                                db_type = function()
                                    if entry.stage == "dialect" then return nil, source end
                                    return dialect, nil
                                end,
                                query = function(self, ...)
                                    queries = queries + 1
                                    return nil, source
                                end,
                                execute = function(self, ...)
                                    writes = writes + 1
                                    return nil, source
                                end,
                            }
                            local err = entry.run(db)
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, source:details().code)
                            test.eq(err:details().nested.stage, entry.stage)
                            test.eq(queries, entry.stage == "query" and 1 or 0)
                            test.eq(writes, entry.stage == "execute" and 1 or 0)
                        end)
                    end
                end
            end
        end
        for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
            {name = "empty", value = ""}, {name = "numeric", value = 42}}) do
            test.it("rejects malformed dialect: " .. input.name, function()
                local queries = 0
                local db: any = {db_type = function() return input.value, nil end,
                    query = function() queries = queries + 1; return {{deleting_at = nil}}, nil end}
                local err = ops.fence(db, component_id, ops.db_id())
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "component_dialect")
                test.eq(err:details().field, "db.type")
                test.eq(queries, 0)
            end)
        end
        for _, entry in ipairs(cases) do
            for _, dialect in ipairs({sql.type.SQLITE, sql.type.POSTGRES}) do
                test.it(entry.name .. "/" .. dialect .. "/success", function()
                    local queries, writes = 0, 0
                    local db: any = {db_type = function() return dialect, nil end,
                        query = function()
                            queries = queries + 1
                            return {{component_id = component_id, deleting_at = nil}}, nil
                        end,
                        execute = function() writes = writes + 1; return {rows_affected = 1}, nil end}
                    test.is_nil((entry.run(db)))
                    test.eq(queries, entry.stage == "execute" and 0 or 1)
                    test.eq(writes, entry.stage == "execute" and 1 or 0)
                end)
            end
        end
    end)
end)}
