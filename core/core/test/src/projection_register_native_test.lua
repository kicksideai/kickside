local test = require("test")
local sql = require("sql")
local writer = require("writer")
local fixture = require("fixture")
local routes = {
    {stage = "type"}, {stage = "begin"}, {stage = "query_1"}, {stage = "encode_1"},
    {stage = "query_2"}, {stage = "encode_2", existing = true},
    {stage = "write_1"}, {stage = "write_1", existing = true},
    {stage = "query_3"}, {stage = "pin_read", existing = true}, {stage = "pin_release", existing = true}, {stage = "write_2"}, {stage = "write_2", existing = true},
    {stage = "write_3"}, {stage = "write_4"}, {stage = "commit"},
}
return {run = test.run_cases(function()
    test.describe("native projection registration dependencies", function()
        for _, route in ipairs(routes) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(route.stage .. "/" .. tostring(route.existing) .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local db, open_err = sql.get("app:db")
                        if open_err then error(open_err) end
                        if not db then error(errors.new({kind = errors.INTERNAL, message = "registration guard has no database", retryable = false})) end
                        local dbtype, dialect_err = db:type()
                        db:release()
                        if dialect_err then error(dialect_err) end
                        local source = errors.new({kind = kind, message = "registration dependency refusal", retryable = options.retryable,
                            details = {code = "registration_dependency", nested = {stage = route.stage}}})
                        fixture.reset(dbtype, route.stage, source, route.existing == true)
                        local result, err = writer.register_projection(fixture.database(), "thread", {
                            kind = "model", worker_ref = "func://app:test_count_worker", system_identity = true})
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        if route.stage == "commit" then
                            test.is_false(err:retryable())
                            test.eq(err:details().cause.kind, source:kind())
                            test.eq(err:details().cause.retryable, source:retryable())
                            test.eq(err:details().cause.details.code, "registration_dependency")
                            test.eq(err:details().cause.details.nested.stage, route.stage)
                        else test.eq(err:retryable(), source:retryable()) end
                        test.eq(err:details().code, "registration_dependency")
                        test.eq(err:details().nested.stage, route.stage)
                        test.eq(fixture.notifications, 0)
                        test.eq(fixture.commits, route.stage == "commit" and 1 or 0)
                        test.eq(fixture.rollbacks, (route.stage ~= "type" and route.stage ~= "begin" and route.stage ~= "commit") and 1 or 0)
                        if route.stage == "type" or route.stage == "begin" then test.eq(fixture.queries, 0) end
                        if route.stage:sub(1, 6) == "write_" then test.eq(fixture.writes, tonumber(route.stage:sub(7))) end
                        if route.stage:sub(1, 6) == "query_" then test.eq(fixture.queries, tonumber(route.stage:sub(7))) end
                        test.eq(source:details().nested.stage, route.stage)
                    end)
                end
            end
        end
        for _, route in ipairs({{stage = "encode_1", field = "body"}, {stage = "encode_2", field = "merged_body", existing = true}}) do
            test.it("missing encoded registration proof/" .. route.field, function()
                local db, open_err = sql.get("app:db")
                if open_err then error(open_err) end
                if not db then error(errors.new({kind = errors.INTERNAL, message = "registration guard has no database", retryable = false})) end
                local dbtype, dialect_err = db:type(); db:release()
                if dialect_err then error(dialect_err) end
                fixture.reset(dbtype, route.stage, nil, route.existing == true)
                local result, err = writer.register_projection(fixture.database(), "thread", {
                    kind = "model", worker_ref = "func://app:test_count_worker", system_identity = true})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "projection_registration_response")
                test.eq(err:details().field, route.field)
                test.eq(fixture.commits, 0)
                test.eq(fixture.rollbacks, 1)
                test.eq(fixture.notifications, 0)
            end)
        end
        for _, existing in ipairs({false, true}) do
            test.it("valid registration/" .. tostring(existing), function()
                local db, err = sql.get("app:db")
                if err then error(err) end
                if not db then error(errors.new({kind = errors.INTERNAL, message = "registration guard has no database", retryable = false})) end
                local dbtype, dialect_err = db:type(); db:release()
                if dialect_err then error(dialect_err) end
                fixture.reset(dbtype, "", nil, existing)
                local result, register_err = writer.register_projection(fixture.database(), "thread", {
                    kind = "model", worker_ref = "func://app:test_count_worker", system_identity = true})
                test.is_nil(register_err)
                test.not_nil(result)
                test.eq(result.created, not existing)
                test.eq(fixture.commits, 1)
                test.eq(fixture.notifications, 1)
                test.eq(fixture.rollbacks, 0)
            end)
        end
    end)
end)}
