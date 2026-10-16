local test = require("test")
local migrations = {
    require("migration_1"),
    require("migration_2"),
    require("migration_3"),
    require("migration_4"),
    require("migration_5"),
    require("migration_6"),
    require("migration_7"),
    require("migration_8"),
}

return {run = test.run_cases(function()
    test.describe("native Component migration callback failures", function()
        for _, definition in ipairs(migrations) do
            for _, migration in ipairs(definition.implementations) do
                for _, engine in ipairs({"sqlite", "postgres"}) do
                    for _, direction in ipairs({"up", "down"}) do
                        local callback = migration.database_implementations[engine][direction]
                        local statements = {}
                        callback({execute = function(self, statement)
                            table.insert(statements, statement)
                            return true, nil
                        end})
                        test.it(migration.description .. "/" .. engine .. "/" .. direction .. "/success", function()
                            local calls = 0
                            local ok, err = pcall(callback, {execute = function(self, statement)
                                calls = calls + 1
                                test.eq(statement, statements[calls])
                                return true, nil
                            end})
                            test.is_true(ok)
                            test.is_nil(err)
                            test.eq(calls, #statements)
                        end)
                        for step = 1, #statements do
                            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                                    test.it(migration.description .. "/" .. engine .. "/" .. direction .. "/" .. step .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                                        local source = errors.new({message = "migration dependency failure", kind = kind,
                                            retryable = options.retryable, details = {code = "migration_dependency", nested = {step = step}}})
                                        local calls = 0
                                        local ok, err = pcall(callback, {execute = function(self, statement)
                                            calls = calls + 1
                                            test.eq(statement, statements[calls])
                                            if calls == step then return nil, source end
                                            return true, nil
                                        end})
                                        test.is_false(ok)
                                        test.eq(calls, step)
                                        test.eq(type(err), "userdata")
                                        test.eq(err:kind(), source:kind())
                                        test.eq(err:retryable(), source:retryable())
                                        test.eq(err:details().code, "migration_dependency")
                                        test.eq(err:details().nested.step, step)
                                    end)
                                end
                            end
                        end
                    end
                end
            end
        end
    end)
end)}
