local test = require("test")
local proc_supervisor = require("proc_supervisor")

local function define_tests()
    test.describe("EE2-2463 lease deadline UTC clock", function()
        test.it("reads an unzoned SQLite deadline as the UTC instant stored by the job clock", function()
            local parsed, err = proc_supervisor.parse_deadline("2026-10-02 16:00:10.123456")
            test.is_nil(err)
            test.not_nil(parsed)
            test.eq(parsed:utc():format("2006-01-02T15:04:05.000000Z07:00"), "2026-10-02T16:00:10.123456Z")
        end)
        test.it("preserves PostgreSQL deadlines with an explicit offset", function()
            local parsed, err = proc_supervisor.parse_deadline("2026-10-02T12:00:10.123456-04:00")
            test.is_nil(err)
            test.not_nil(parsed)
            test.eq(parsed:utc():format("2006-01-02T15:04:05.000000Z07:00"), "2026-10-02T16:00:10.123456Z")
        end)
        test.it("rejects malformed or missing deadlines", function()
            for _, raw in ipairs({ "", "not-a-deadline", "2026-99-99 99:99:99.000000" }) do
                local parsed, err = proc_supervisor.parse_deadline(raw)
                test.is_nil(parsed)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
            end
        end)
    end)
end

return test.run_cases(define_tests)
