-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local jobs = require("jobs")
local wake = require("wake")
local fixture = require("fixture")

return { run = test.run_cases(function()
    for _, route in ipairs({ "public", "persist" }) do
        local entry = route == "public" and "kickside.core.jobs:nudge_workers" or "kickside.core.jobs.persist:pool_nudge"
        local function invoke(): (integer, error?)
            if route == "public" then return jobs.nudge_workers() end
            return wake.nudge_workers()
        end
        test.describe("worker notification response/" .. route, function()
            for index, case in ipairs({ {}, { value = false }, { value = {} }, { value = "" },
                { value = "bad" }, { value = -1 }, { value = 0.5 }, { value = math.huge }, { value = 0/0 } }) do
                test.it("malformed response/" .. tostring(index), function()
                    fixture.reset("nudge", "nudge", nil)
                    fixture.missing, fixture.value = true, case.value
                    local count, err = invoke()
                    test.eq(count, 0)
                    test.not_nil(err)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.is_false(err:retryable())
                    test.eq(err:details().code, "job_notification_response")
                    test.eq(err:details().field, "nudge")
                    test.eq(fixture.called_entry, entry)
                    test.eq(fixture.calls, 1)
                end)
            end
            for _, count in ipairs({ 0, 1, "0", "1" }) do
                test.it("valid count/" .. type(count) .. "/" .. tostring(count), function()
                    fixture.reset("nudge", "nudge", nil)
                    fixture.missing, fixture.value = true, count
                    local sent, err = invoke()
                    test.is_nil(err)
                    test.eq(sent, tonumber(count))
                    test.eq(fixture.called_entry, entry)
                    test.eq(fixture.calls, 1)
                end)
            end
            for _, kind in ipairs({ errors.PERMISSION_DENIED, errors.UNAVAILABLE, errors.CONFLICT }) do
                for _, retryable in ipairs({ false, true }) do
                    test.it("native error/" .. kind .. "/" .. tostring(retryable), function()
                        local source = errors.new({ kind = kind, retryable = retryable, message = "transport refused",
                            details = { code = "transport_refusal", nested = { marker = "kept" } } })
                        fixture.reset("nudge", "nudge", source)
                        local sent, err = invoke()
                        test.eq(sent, 0)
                        test.is_true(errors.is(err, kind))
                        test.eq(err:retryable(), retryable)
                        test.eq(err:details().nested.marker, "kept")
                        test.eq(fixture.called_entry, entry)
                        test.eq(fixture.calls, 1)
                    end)
                end
            end
        end)
    end
end) }
