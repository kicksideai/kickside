-- clock produces a UTC, microsecond, fixed-width timestamp string per dialect.
-- Durable order rides on the per-thread seq, not these strings; this only guarantees
-- the contract the lease/dispatch/retention comparisons rely on: same instant on both
-- dialects, fixed width so the SQLite TEXT form is lexically sortable, and a sub-second
-- value sorts after a second-precision datetime('now') default for the same second.

local test = require("test")
local sql = require("sql")
local time = require("time")
local clock = require("clock")

-- 2023-11-14 22:13:20 UTC, with 123456 microseconds (123456000 ns).
local FIXED = time.unix(1700000000, 123456000)
local FIXED_WHOLE = time.unix(1700000000, 0)
local LATER = time.unix(1700000001, 0)

local function define_tests()
    test.describe("clock format", function()
        test.it("formats a known instant to the dialect's microsecond shape", function()
            test.eq(clock.format(FIXED, sql.type.SQLITE), "2023-11-14 22:13:20.123456")
            test.eq(clock.format(FIXED, sql.type.POSTGRES), "2023-11-14T22:13:20.123456Z")
        end)

        test.it("fraction is fixed six-digit width, never trimmed", function()
            -- whole-second instants still carry six zero digits (unlike RFC3339NANO).
            test.eq(clock.format(FIXED_WHOLE, sql.type.SQLITE), "2023-11-14 22:13:20.000000")
            test.eq(#clock.format(FIXED_WHOLE, sql.type.SQLITE), #clock.format(FIXED, sql.type.SQLITE))
            test.eq(#clock.format(FIXED_WHOLE, sql.type.POSTGRES), #clock.format(FIXED, sql.type.POSTGRES))
        end)

        test.it("is lexically sortable in time order on both dialects", function()
            test.is_true(clock.format(FIXED, sql.type.SQLITE) < clock.format(LATER, sql.type.SQLITE))
            test.is_true(clock.format(FIXED, sql.type.POSTGRES) < clock.format(LATER, sql.type.POSTGRES))
        end)

        test.it("a sub-second value sorts after a second-precision datetime('now') default", function()
            -- SQLite datetime('now') yields no fraction; a Lua-written value for the same
            -- second must sort >= it so ordering stays monotonic across mixed rows.
            local bare_default = "2023-11-14 22:13:20"
            test.is_true(bare_default < clock.format(FIXED_WHOLE, sql.type.SQLITE))
        end)

        test.it("now() returns the current instant in the same shapes", function()
            local s = clock.now(sql.type.SQLITE)
            local p = clock.now(sql.type.POSTGRES)
            -- 'YYYY-MM-DD HH:MM:SS.ffffff' (26 chars) and the RFC3339 'T...Z' form (27).
            test.eq(#s, 26)
            test.is_true(string.sub(s, 11, 11) == " ")
            test.is_true(string.sub(p, 11, 11) == "T")
            test.is_true(string.sub(p, #p, #p) == "Z")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
