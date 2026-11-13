local test = require("test")
local sql = require("sql")
local time = require("time")
local fixture = require("prune_scaffold")
local sweeper = require("sweeper")

local function define_tests()
    test.describe("Default retention backlog", function()
        test.it("drains multiple batches of newly expired events without a cadence pause", function()
            local id = fixture.make_thread()
            fixture.add_bulk_events(id, 10001, 60)
            local db = fixture.open_db()
            local total = 0
            for pass = 1, 3 do
                local result, err = sweeper.run(db)
                test.is_nil(err)
                total = total + result.events
                if pass < 3 then
                    test.eq(result.events, 5000)
                    test.is_true(result.needs_continue)
                    local deadline, deadline_err = sweeper.next_deadline_ms(db)
                    test.is_nil(deadline_err)
                    test.is_true(deadline <= math.floor(time.now():unix_nano() / 1000000))
                end
            end
            db:release()
            test.eq(total, 10001)
            test.eq(#fixture.seqs_of(id), 0)
            test.eq(fixture.boundary_of(id), 10001)
        end)
    end)
end
return test.run_cases(define_tests)
