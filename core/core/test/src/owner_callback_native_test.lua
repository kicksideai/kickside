local test = require("test")
local hooks = require("hooks")
local fixture = require("fixture")
local function refusal(): error?
    local report, err = hooks.run()
    test.is_nil(err)
    test.eq(report.deleted, 0)
    test.eq(#report.failures, 1)
    test.eq(report.failures[1].owner, "fixture:owner")
    test.eq(fixture.calls, 1)
    test.eq(fixture.queries, 1)
    test.eq(fixture.releases, 1)
    return report.failures[1].error
end
return {run = test.run_cases(function()
    test.describe("native retention owner callback failures", function()
        for _, stage in ipairs({"call", "owner"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "owner callback dependency failure",
                            retryable = options.retryable, details = {code = "owner_callback_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, false, nil)
                        local err = refusal()
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "owner_callback_dependency")
                        test.eq(err:details().nested.stage, stage)
                    end)
                end
            end
        end
        for _, input in ipairs({{name = "missing"}, {name = "false", value = false}}) do
            test.it("refuses an owner failure without its error/" .. input.name, function()
                fixture.reset("owner", input.value, false, nil)
                local err = refusal()
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "retention_owner_discovery_response")
                test.eq(err:details().field, "retention.owner.error")
            end)
        end
        test.it("retains the healthy owner count", function()
            fixture.reset("", nil, false, nil)
            local report, err = hooks.run()
            test.is_nil(err)
            test.eq(report.deleted, 1)
            test.eq(#report.failures, 0)
            test.eq(fixture.calls, 1)
            test.eq(fixture.queries, 1)
            test.eq(fixture.releases, 1)
        end)
    end)
end)}
