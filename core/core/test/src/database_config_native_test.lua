local test = require("test")
local database = require("database")
local fixture = require("fixture")
local registry = require("registry")
return {run = test.run_cases(function()
    test.describe("native Core database configuration failures", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it("registry/" .. kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "database configuration dependency failure",
                        retryable = options.retryable, details = {code = "database_config_dependency", nested = {stage = "registry"}}})
                    fixture.reset(source, false, nil)
                    local ok, err = pcall(database.id)
                    test.is_false(ok)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "database_config_dependency")
                    test.eq(err:details().nested.stage, "registry")
                    test.eq(fixture.calls, 1)
                end)
            end
        end
        for _, field in ipairs({"entry", "meta", "meta.db_id"}) do
            for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
                {name = "true", value = true}, {name = "number", value = 42}, {name = "string", value = ""},
                {name = "table", value = {}}}) do
                if input.name ~= "table" or field == "meta.db_id" then
                    test.it(field .. "/" .. input.name, function()
                        local value = input.value
                        if field == "meta" then value = {meta = input.value} end
                        if field == "meta.db_id" then value = {meta = {db_id = input.value}} end
                        fixture.reset(nil, true, value)
                        local ok, err = pcall(database.id)
                        test.is_false(ok)
                        test.is_true(errors.is(err, errors.INTERNAL))
                        test.eq(err:retryable(), false)
                        test.eq(err:details().code, "core_database_config")
                        test.eq(err:details().field, field)
                        test.eq(err:details().entry, database.CONFIG)
                        test.eq(fixture.calls, 1)
                    end)
                end
            end
        end
        for _, id in ipairs({"app:db", "configured_database"}) do
            test.it("retains a configured database identifier/" .. id, function()
                fixture.reset(nil, true, {meta = {db_id = id}})
                test.eq(database.id(), id)
                test.eq(fixture.calls, 1)
            end)
        end
        test.it("retains the actual namespace-expanded registry configuration", function()
            local entry, err = registry.get(database.CONFIG)
            test.is_nil(err)
            test.eq(type(entry), "table")
            test.eq(type(entry.meta.db_id), "string")
            fixture.reset(nil, false, nil)
            test.eq(database.id(), entry.meta.db_id)
            test.eq(fixture.calls, 1)
        end)
    end)
end)}
