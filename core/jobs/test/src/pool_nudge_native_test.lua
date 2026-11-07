local test = require("test")
local process = require("process")
local time = require("time")
local channel = require("channel")
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
                        if kind == errors.NOT_FOUND then
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
        test.it("reports a send to an exited process as NOT_FOUND", function()
            local events = process.events()
            local pid, spawn_err = process.spawn_monitored("app:job_sleep_proc", "app:processes", {})
            test.is_nil(spawn_err)
            local deadline = time.after("15s")
            while true do
                local selected = channel.select({ events:case_receive(), deadline:case_receive() })
                test.eq(selected.channel, events, "the test-owned child does not exit")
                if selected.value.kind == process.event.EXIT and tostring(selected.value.from) == tostring(pid) then break end
            end
            local sent, send_err = process.send(tostring(pid), "kickside.core.jobs:wake", {})
            test.is_nil(sent)
            test.not_nil(send_err)
            test.eq(send_err:kind(), errors.NOT_FOUND)
        end)
        test.it("leaves durable demand when the pool exits between lookup and send", function()
            fixture.reset("send", errors.new({kind = errors.NOT_FOUND, message = "process not found", retryable = false}),
                "pool-pid", true)
            local count, err = nudge.run()
            test.eq(count, 0)
            test.is_nil(err)
            test.eq(fixture.lookups, 1)
            test.eq(fixture.sends, 1)
        end)
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
