local test = require("test")
local notifier = require("notifier")
local fixture = require("fixture")
local function check_details(actual: any, expected: any)
    test.eq(type(actual), type(expected))
    if type(expected) ~= "table" then test.eq(actual, expected); return end
    for key, value in pairs(expected) do check_details(actual[key], value) end
    for key, value in pairs(actual) do check_details(value, expected[key]) end
end
local function check(err: any, source: any)
    test.eq(type(err), "userdata")
    test.eq(err:kind(), source:kind())
    test.eq(err:retryable(), source:retryable())
    check_details(err:details(), source:details())
end
return {run = test.run_cases(function()
    test.describe("native retention notification dependencies", function()
        for _, stage in ipairs({"lookup", "send"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "notification dependency failure",
                            retryable = options.retryable, details = {code = "retention_notification_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, "retention-pid")
                        local delivered, err = notifier.deliver({thread_id = "thread"})
                        if stage == "lookup" and errors.is(source, errors.NOT_FOUND) then
                            test.eq(delivered, false)
                            test.is_nil(err)
                        else
                            test.is_nil(delivered)
                            check(err, source)
                            test.eq(err:details().code, "retention_notification_dependency")
                            test.eq(err:details().nested.stage, stage)
                        end
                        test.eq(fixture.lookups, 1)
                        test.eq(fixture.sends, stage == "send" and 1 or 0)
                    end)
                end
            end
        end
        test.it("retains absent-process boot recovery", function()
            fixture.reset("", nil, nil)
            local delivered, err = notifier.deliver({})
            test.eq(delivered, false)
            test.is_nil(err)
            test.eq(fixture.lookups, 1)
            test.eq(fixture.sends, 0)
        end)
        test.it("delivers the original change under the existing topic", function()
            fixture.reset("", nil, "retention-pid")
            local change = {thread_id = "thread", generation = 7}
            local delivered, err = notifier.deliver(change)
            test.eq(delivered, true)
            test.is_nil(err)
            test.eq(fixture.lookups, 1)
            test.eq(fixture.sends, 1)
            test.eq(fixture.sent_pid, "retention-pid")
            test.eq(fixture.sent_topic, notifier.TOPIC)
            test.eq(fixture.sent_data, change)
        end)
        test.it("consumes the real SDK missing-name lookup by kind", function()
            fixture.reset("lookup", nil, nil, true)
            local delivered, err = notifier.deliver({})
            test.eq(delivered, false)
            test.is_nil(err)
            if fixture.source then test.is_true(errors.is(fixture.source, errors.NOT_FOUND)) end
            test.eq(fixture.lookups, 1)
            test.eq(fixture.sends, 0)
        end)
        test.it("preserves the real SDK send refusal", function()
            fixture.reset("send", nil, "native-errors-nonexistent-pid", true)
            local delivered, err = notifier.deliver({})
            test.is_nil(delivered)
            test.eq(type(fixture.source), "userdata")
            check(err, fixture.source)
            test.eq(fixture.lookups, 1)
            test.eq(fixture.sends, 1)
        end)
    end)
end)}
