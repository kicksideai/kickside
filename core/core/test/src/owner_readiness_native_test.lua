local test = require("test")
local hooks = require("hooks")
local fixture = require("fixture")
local fields = {migrations = "retention.owner_migrations", database = "sql.get", exists = "migration.table_exists"}
local function refusal(): error?
    local report, err = hooks.run()
    test.is_nil(err)
    test.eq(report.deleted, 0)
    test.eq(#report.failures, 1)
    test.eq(report.failures[1].owner, "fixture:owner")
    return report.failures[1].error
end
return {run = test.run_cases(function()
    test.describe("native retention owner readiness dependencies", function()
        for _, stage in ipairs({"migrations", "database", "exists"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "owner readiness dependency failure",
                            retryable = options.retryable, details = {code = "owner_readiness_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, false, nil)
                        local err = refusal()
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "owner_readiness_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(fixture.calls, 0)
                        test.eq(fixture.queries, 0)
                        test.eq(fixture.gets, stage == "migrations" and 0 or 1)
                        test.eq(fixture.releases, stage == "exists" and 1 or 0)
                    end)
                end
            end
            for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
                {name = "true", value = true}, {name = "number", value = 42}, {name = "string", value = "response"},
                {name = "table", value = {}}}) do
                if (stage ~= "database" or input.name == "missing" or input.name == "false")
                    and (stage ~= "migrations" or input.name ~= "table")
                    and (stage ~= "exists" or (input.name ~= "false" and input.name ~= "true")) then
                    test.it(stage .. "/response/" .. input.name, function()
                        fixture.reset(stage, nil, true, input.value)
                        local err = refusal()
                        test.is_true(errors.is(err, errors.INTERNAL))
                        test.eq(err:retryable(), false)
                        test.eq(err:details().code, "retention_owner_discovery_response")
                        test.eq(err:details().field, fields[stage])
                        test.eq(fixture.calls, 0)
                        test.eq(fixture.queries, 0)
                        test.eq(fixture.gets, stage == "migrations" and 0 or 1)
                        test.eq(fixture.releases, stage == "exists" and 1 or 0)
                    end)
                end
            end
        end
        test.it("keeps an owner idle until its migration ledger exists", function()
            fixture.reset("exists", nil, true, false)
            local report, err = hooks.run()
            test.is_nil(err)
            test.eq(report.deleted, 0)
            test.eq(#report.failures, 0)
            test.eq(fixture.calls, 0)
            test.eq(fixture.queries, 0)
            test.eq(fixture.gets, 1)
            test.eq(fixture.releases, 1)
        end)
        test.it("keeps an owner idle until all declared migrations apply", function()
            fixture.reset("rows", nil, true, {})
            local report, err = hooks.run()
            test.is_nil(err)
            test.eq(report.deleted, 0)
            test.eq(#report.failures, 0)
            test.eq(fixture.calls, 0)
            test.eq(fixture.queries, 1)
            test.eq(fixture.gets, 1)
            test.eq(fixture.releases, 1)
        end)
        test.it("runs a ready owner and retains immutable migration discovery", function()
            fixture.reset("", nil, false, nil)
            for _ = 1, 2 do
                local report, err = hooks.run()
                test.is_nil(err)
                test.eq(report.deleted, 1)
                test.eq(#report.failures, 0)
            end
            test.eq(fixture.finds, 3)
            test.eq(fixture.queries, 2)
            test.eq(fixture.gets, 2)
            test.eq(fixture.releases, 2)
            test.eq(fixture.calls, 2)
        end)
    end)
end)}
