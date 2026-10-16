local test = require("test")
local nudge = require("nudge")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native Jobs pool notification dependencies", function()
        for _, stage in ipairs({"lookup", "send"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "pool dependency failure",
                            retryable = options.retryable, details = {code = "pool_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, "pool-pid", true)
                        local count, err = nudge.run()
                        test.eq(count, 0)
                        if stage == "lookup" and kind == errors.NOT_FOUND then
                            test.is_nil(err)
                        else
                            test.eq(type(err), "userdata")
                            test.eq(err:kind(), source:kind())
                            test.eq(err:retryable(), source:retryable())
                            test.eq(err:details().code, "pool_dependency")
                            test.eq(err:details().nested.stage, stage)
                        end
                        test.eq(fixture.lookups, 1)
                        test.eq(fixture.sends, stage == "send" and 1 or 0)
                    end)
                end
            end
        end
        test.it("retains absent-pool durable-demand behavior", function()
            fixture.reset("", nil, nil, true)
            local count, err = nudge.run()
            test.eq(count, 0)
            test.is_nil(err)
            test.eq(fixture.lookups, 1)
            test.eq(fixture.sends, 0)
        end)
        for _, sent in ipairs({true, false}) do
            test.it("retains notification count/" .. tostring(sent), function()
                fixture.reset("", nil, "pool-pid", sent)
                local count, err = nudge.run()
                test.eq(count, sent and 1 or 0)
                test.is_nil(err)
                test.eq(fixture.lookups, 1)
                test.eq(fixture.sends, 1)
            end)
        end
    end)
end)}
