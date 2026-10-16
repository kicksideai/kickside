local test = require("test")
local hooks = require("hooks")
local fixture = require("fixture")
local function invoke(stage: string, through_run: boolean): error?
    if through_run then
        local report, err = hooks.run()
        if err then return err end
        if report and #report.failures > 0 then return report.failures[1].error end
        return nil
    end
    if stage == "rows" then local _, err = hooks.applied_ids(fixture.db()); return err end
    local _, _, err = hooks.declarations()
    return err
end
local fields = {version = "registry.current_version", owners = "retention.owners",
    definitions = "retention.definitions", rows = "retention.migration_ids"}
return {run = test.run_cases(function()
    test.describe("native retention owner discovery dependencies", function()
        for _, stage in ipairs({"version", "owners", "definitions", "rows"}) do
            for _, through_run in ipairs({false, true}) do
                for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                    errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                    errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                    for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                        test.it(stage .. "/" .. tostring(through_run) .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                            local source = errors.new({kind = kind, message = "retention discovery dependency failure",
                                retryable = options.retryable, details = {code = "owner_discovery_dependency", nested = {stage = stage}}})
                            fixture.reset(stage, source, false, nil)
                            local err = invoke(stage, through_run)
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "owner_discovery_dependency")
                            test.eq(err:details().nested.stage, stage)
                            test.eq(fixture.calls, 0)
                            test.eq(fixture.queries, stage == "rows" and 1 or 0)
                            test.eq(fixture.releases, stage == "rows" and through_run and 1 or 0)
                            test.eq(fixture.finds, stage == "version" and 0 or stage == "owners" and 1 or
                                stage == "definitions" and 2 or through_run and 3 or 0)
                        end)
                    end
                end
                for _, input in ipairs({{name = "missing"}, {name = "false", value = false},
                    {name = "true", value = true}, {name = "number", value = 42}, {name = "string", value = "response"}}) do
                    if stage ~= "version" or input.name == "missing" or input.name == "false" then
                        test.it(stage .. "/malformed/" .. tostring(through_run) .. "/" .. input.name, function()
                            fixture.reset(stage, nil, true, input.value)
                            local err = invoke(stage, through_run)
                            test.is_true(errors.is(err, errors.INTERNAL))
                            test.eq(err:retryable(), false)
                            test.eq(err:details().code, "retention_owner_discovery_response")
                            test.eq(err:details().field, fields[stage])
                            test.eq(fixture.calls, 0)
                            test.eq(fixture.releases, stage == "rows" and through_run and 1 or 0)
                        end)
                    end
                end
            end
        end
        test.it("retains declarations per version and reads ledgers on every pass", function()
            fixture.reset("", nil, false, nil)
            local entries, definitions, err = hooks.declarations()
            test.is_nil(err)
            local repeated, repeated_definitions, repeated_err = hooks.declarations()
            test.is_nil(repeated_err)
            test.is_true(entries == repeated)
            test.is_true(definitions == repeated_definitions)
            for _ = 1, 2 do
                local report, run_err = hooks.run()
                test.is_nil(run_err)
                test.eq(report.deleted, 1)
                test.eq(#report.failures, 0)
            end
            test.eq(fixture.finds, 3)
            test.eq(fixture.queries, 2)
            test.eq(fixture.releases, 2)
            test.eq(fixture.calls, 2)
        end)
        test.it("propagates version failures before cached declarations", function()
            fixture.reset("", nil, false, nil)
            local _, _, initial_err = hooks.declarations()
            test.is_nil(initial_err)
            fixture.stage = "version"
            fixture.source = errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                message = "registry version denied", details = {code = "version_denied"}})
            local err = invoke("version", true)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "version_denied")
            test.eq(fixture.finds, 2)
            test.eq(fixture.calls, 0)
        end)
        test.it("invalidates declarations and migration discovery for a new version", function()
            for _ = 1, 2 do
                fixture.reset("", nil, false, nil)
                local report, err = hooks.run()
                test.is_nil(err)
                test.eq(report.deleted, 1)
                test.eq(fixture.finds, 3)
                test.eq(fixture.queries, 1)
                test.eq(fixture.releases, 1)
                test.eq(fixture.calls, 1)
            end
        end)
    end)
end)}
