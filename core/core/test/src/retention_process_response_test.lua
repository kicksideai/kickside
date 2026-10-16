local test = require("test")
local source = require("source")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("permanent retention process response failures", function()
        local fields = {claim = "singleton.claim", register = "lease.register", subscribe = "events.subscription",
            acquire = "sql.get", recover = "runner.recover", wake = "runner.pass"}
        for stage, field in pairs(fields) do
            local responses = {{}, {value = false}, {value = "invalid"}}
            if stage == "claim" or stage == "register" then responses[#responses + 1] = {value = 1}
            elseif stage == "subscribe" or stage == "acquire" then responses[#responses + 1] = {value = {}}
            else
                responses[#responses + 1] = {value = {deadline_ms = "invalid"}}
                responses[#responses + 1] = {value = {deadline_ms = 0.5}}
            end
            for index, response in ipairs(responses) do
                test.it(stage .. "/" .. tostring(index), function()
                    fixture.reset(stage == "wake" and "wake" or "", nil)
                    fixture.responses[stage] = response
                    local ok, result, err = pcall(source.main)
                    test.is_true(ok)
                    test.is_nil(result)
                    test.eq(type(err), "userdata")
                    test.eq(err:kind(), errors.INTERNAL)
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "retention_process_response")
                    test.eq(err:details().field, field)
                    test.eq(fixture.recoveries, (stage == "recover" or stage == "wake") and 1 or 0)
                    test.eq(fixture.wakes, stage == "wake" and 1 or 0)
                    test.eq(fixture.selects, stage == "wake" and 1 or 0)
                    test.eq(fixture.releases, (stage == "recover" or stage == "wake") and 1 or 0)
                    test.eq(fixture.closes, (stage == "acquire" or stage == "recover" or stage == "wake") and 1 or 0)
                    test.eq(fixture.unlistens, stage == "claim" and 1 or 2)
                    test.eq(fixture.unregisters, stage == "claim" and 0 or 2)
                end)
            end
        end
        test.it("requires a registry event channel", function()
            fixture.reset("", nil)
            local subscription = fixture.subscription()
            subscription.channel = function(self: any): any return nil end
            fixture.responses.subscribe = {value = subscription}
            local ok, result, err = pcall(source.main)
            test.is_true(ok)
            test.is_nil(result)
            test.eq(err:kind(), errors.INTERNAL)
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "retention_process_response")
            test.eq(err:details().field, "events.channel")
            test.eq(fixture.closes, 1)
            test.eq(fixture.acquisitions, 0)
            test.eq(fixture.selects, 0)
        end)
        test.it("keeps native registration errors during cancellation", function()
            fixture.reset("", nil)
            local native = errors.new({kind = errors.CONFLICT, retryable = false, message = "registration refusal",
                details = {code = "registration", nested = {value = 1}}})
            fixture.responses.claim = {value = false, cancel = true, error = native}
            local result, err = source.main()
            test.is_nil(result)
            test.eq(err:kind(), native:kind())
            test.eq(err:retryable(), false)
            test.eq(err:details().code, "registration")
            test.eq(err:details().nested.value, 1)
            test.eq(fixture.registers, 0)
            test.eq(fixture.unlistens, 1)
        end)
        for _, stage in ipairs({"", "wake"}) do
            test.it("retains absent optional deadlines/" .. stage, function()
                fixture.reset(stage, nil)
                fixture.responses.recover, fixture.responses.wake = {value = {}}, {value = {}}
                local result, err = source.main()
                test.is_nil(result)
                test.is_nil(err)
                test.eq(fixture.recoveries, 1)
                test.eq(fixture.wakes, stage == "wake" and 1 or 0)
                test.eq(fixture.selects, stage == "wake" and 2 or 1)
                test.eq(fixture.releases, 1)
                test.eq(fixture.closes, 1)
                test.eq(fixture.unlistens, 2)
                test.eq(fixture.unregisters, 2)
            end)
        end
    end)
end)}
