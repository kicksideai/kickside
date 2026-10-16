local test = require("test")
local cadence = require("cadence")

local function due(kind, expression, now)
    local value, err = cadence.next_after({ type = kind, expression = expression, timezone = "UTC" }, now)
    if err then error(tostring(err)) end
    return value
end

local function define_tests()
    test.describe("Pure UTC cadence", function()
        test.it("calculates interval and ticker strictly after the supplied instant", function()
            test.eq(due("interval", "90s", "2026-01-01T00:00:00Z"), "2026-01-01T00:01:30Z")
            test.eq(due("ticker", "1h", "2026-01-01T23:30:00Z"), "2026-01-02T00:30:00Z")
        end)

        test.it("fires once only when its due time is still ahead", function()
            test.eq(due("once", "2026-01-02T00:00:00Z", "2026-01-01T00:00:00Z"), "2026-01-02T00:00:00Z")
            test.is_nil(due("once", "2026-01-02T00:00:00Z", "2026-01-02T00:00:00Z"))
        end)

        test.it("jumps field-wise across month and leap-day boundaries", function()
            test.eq(due("cron", "0 0 29 2 *", "2025-03-01T00:00:00Z"), "2028-02-29T00:00:00Z")
            test.eq(due("cron", "15 9 1 * *", "2026-12-01T09:15:00Z"), "2027-01-01T09:15:00Z")
        end)

        test.it("supports lists, ranges, steps and POSIX day-or-weekday", function()
            test.eq(due("cron", "*/15 9-10 * * 1,3", "2026-09-28T09:00:00Z"), "2026-09-28T09:15:00Z")
            test.eq(due("cron", "0 0 1 * 1", "2026-09-26T00:00:00Z"), "2026-09-28T00:00:00Z")
        end)

        test.it("rejects invalid schedules without a default timezone or clock", function()
            local value, err = cadence.next_after({ type = "interval", expression = "0s", timezone = "UTC" }, "2026-01-01T00:00:00Z")
            test.is_nil(value)
            test.not_nil(err)
            value, err = cadence.next_after({ type = "cron", expression = "0 0 * * *", timezone = "America/New_York" }, "2026-01-01T00:00:00Z")
            test.is_nil(value)
            test.not_nil(err)
        end)
    end)
end

return test.run_cases(define_tests)
