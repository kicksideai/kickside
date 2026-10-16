local test = require("test")
local common = require("common")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native thread database acquisition dependencies", function()
        for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
            errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
            errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
            for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                test.it(kind .. "/" .. tostring(options.retryable), function()
                    local source = errors.new({kind = kind, message = "database acquisition failure",
                        retryable = options.retryable, details = {code = "database_dependency", nested = {stage = "open"}}})
                    fixture.reset(source, false, nil)
                    local db, err = common.open_db()
                    test.is_nil(db)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), source:kind())
                    test.eq(err:retryable(), source:retryable())
                    test.eq(err:details().code, "database_dependency")
                    test.eq(err:details().nested.stage, "open")
                    test.eq(fixture.calls, 1)
                end)
            end
        end
        for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
            {name = "number", value = 42}, {name = "string", value = "db"}, {name = "table", value = {}}}) do
            test.it("malformed successful DB response/" .. input.name, function()
                fixture.reset(nil, true, input.value)
                local db, err = common.open_db()
                test.is_nil(db)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "thread_database_response")
                test.eq(err:details().field, "sql.get")
                test.eq(fixture.calls, 1)
            end)
        end
        test.it("retains real SDK pooled database acquisition", function()
            fixture.reset(nil, false, nil)
            local db, err = common.open_db()
            test.is_nil(err)
            test.not_nil(db)
            test.eq(type(db), "userdata")
            local _, release_err = (db :: any):release()
            test.is_nil(release_err)
            test.eq(fixture.calls, 1)
        end)
    end)
end)}
