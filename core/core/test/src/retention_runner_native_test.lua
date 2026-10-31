local test = require("test")
local runner = require("runner")
local fixture = require("fixture")
return {run = test.run_cases(function()
    test.describe("native retention pass failures", function()
        for _, stage in ipairs({"sweep", "owner", "send", "deadline"}) do
            for _, kind in ipairs({errors.NOT_FOUND, errors.ALREADY_EXISTS, errors.INVALID,
                errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.INTERNAL, errors.CANCELED,
                errors.CONFLICT, errors.TIMEOUT, errors.RATE_LIMITED, errors.UNKNOWN}) do
                for _, options in ipairs({{}, {retryable = false}, {retryable = true}}) do
                    test.it(stage .. "/" .. kind .. "/" .. tostring(options.retryable), function()
                        local source = errors.new({kind = kind, message = "retention pass dependency failure",
                            retryable = options.retryable, details = {code = "retention_pass_dependency", nested = {stage = stage}}})
                        fixture.reset(stage, source, false, nil)
                        local result, err = runner.recover({} :: any, "retention-pid")
                        test.is_nil(result)
                        test.eq(type(err), "userdata")
                        test.eq(err:kind(), source:kind())
                        test.eq(err:retryable(), source:retryable())
                        test.eq(err:details().code, "retention_pass_dependency")
                        test.eq(err:details().nested.stage, stage)
                        test.eq(fixture.sweeps, 1)
                        test.eq(fixture.owners, stage == "sweep" and 0 or 1)
                        test.eq(fixture.sends, stage == "send" and 1 or 0)
                        test.eq(fixture.deadlines, stage == "deadline" and 1 or 0)
                    end)
                end
            end
        end
        for _, stage in ipairs({"sweep", "owner"}) do
            for _, input in ipairs({{name = "nil"}, {name = "false", value = false}}) do
                test.it(stage .. " missing response/" .. input.name, function()
                    fixture.reset(stage, nil, true, input.value)
                    local result, err = runner.recover({} :: any, "retention-pid")
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(err:retryable(), false)
                    test.eq(err:details().code, "retention_pass_response")
                    test.eq(err:details().field, stage == "sweep" and "sweeper.run" or "owner_hooks.run")
                    test.eq(fixture.sweeps, 1)
                    test.eq(fixture.owners, stage == "sweep" and 0 or 1)
                    test.eq(fixture.sends, 0)
                    test.eq(fixture.deadlines, 0)
                end)
            end
        end
        for _, method in ipairs({"recover", "on_deadline", "on_wake", "on_wakes"}) do
            test.it("retains healthy pass/" .. method, function()
                fixture.reset("", nil, false, nil)
                local change = method == "on_wakes" and {{kind = "changed"}, {kind = "other"}} or {kind = "changed"}
                local result, err = runner[method]({} :: any, "retention-pid", change)
                test.is_nil(err)
                test.eq(result.stats.events, 0)
                test.eq(result.stats.write_receipts, 0)
                test.eq(result.deadline_ms, 12345)
                test.eq(#result.owner_failures, 0)
                test.eq(#result.owner_blocked, 0)
                test.eq(fixture.sweeps, 1)
                test.eq(fixture.owners, 1)
                test.eq(fixture.sends, 0)
                test.eq(fixture.deadlines, 1)
            end)
        end
        test.it("retains successful continuation topic and owner locator", function()
            fixture.reset("send", nil, false, nil)
            local result, err = runner.on_wake({} :: any, "retention-pid", {kind = "changed", owner_locator = {id = "owner"}})
            test.is_nil(err)
            test.eq(result.stats.needs_continue, true)
            test.eq(result.deadline_ms, 12345)
            test.eq(fixture.sends, 1)
            test.eq(fixture.sent_topic, "kickside.core.retention.changed")
            test.eq(fixture.sent_change.kind, "continue")
            test.eq(fixture.sent_change.owner_locator.id, "owner")
            test.eq(fixture.deadlines, 1)
        end)
        for _, case in ipairs({{name = "owner before Core", core = 9000, owner = 3000, expected = 3000},
            {name = "Core before owner", core = 3000, owner = 9000, expected = 3000},
            {name = "owner only", owner = 3000, expected = 3000},
            {name = "neither"}, {name = "already due", core = 9000, owner = 0, expected = 0}}) do
            for _, method in ipairs({"recover", "on_deadline", "on_wake", "on_wakes"}) do
                test.it("selects the effective deadline/" .. method .. "/" .. case.name, function()
                    fixture.reset("", nil, false, nil)
                    fixture.core_deadline, fixture.owner_deadline = case.core, case.owner
                    local changes = method == "on_wakes" and {{kind = "changed", owner_locator = {id = "first"}},
                        {kind = "changed", owner_locator = {id = "second"}}} or {kind = "changed"}
                    local result, err = runner[method]({} :: any, "retention-pid", changes)
                    test.is_nil(err); test.eq(result.deadline_ms, case.expected)
                    local passes = method == "on_wakes" and 2 or 1
                    test.eq(fixture.sweeps, passes); test.eq(fixture.owners, passes)
                    test.eq(fixture.deadlines, passes); test.eq(fixture.sends, 0)
                    test.is_true(result.stats.needs_continue ~= true)
                end)
            end
        end
    end)
end)}
