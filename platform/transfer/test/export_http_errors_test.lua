local test = require("test")
local state = require("state")
local fixture = require("fixture")
local subject = require("subject")

return test.run_cases(function()
    test.describe("transfer download errors", function()
        test.before_each(function()
            state.reset()
            state.allow_mkdir()
            fixture.body = nil
            fixture.status = nil
        end)
        for _, stage in ipairs({ "open", "read", "close", "remove" }) do
            test.it("returns the native bundle " .. stage .. " failure and removes staging", function()
                local source = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                    message = "bundle storage unavailable", details = { marker = stage } })
                if stage == "remove" then state.reject_remove(source)
                else state.reject(stage, source) end
                local result, err = subject.handler()
                test.is_nil(result)
                test.eq(err, source)
                test.eq(state.counters().closed, stage == "open" and 0 or 1)
                test.is_true(state.counters().removed > 0)
            end)
        end
        test.it("streams the bundle and treats native EOF as completion", function()
            local _, err = subject.handler()
            test.is_nil(err)
            test.eq(fixture.status, 200)
            test.eq(fixture.body, "bundle bytes")
            test.eq(state.counters().closed, 1)
            test.is_true(state.counters().removed > 0)
        end)
    end)
end)
