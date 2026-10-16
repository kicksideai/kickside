local test = require("test")
local funcs = require("funcs")

local function pull(occurrence)
    local result, err = funcs.call("kickside.automation:timer_pullable", {
        config = { automation_id = "automation-1", drive_key = "daily", occurrence = occurrence },
        limit = 1,
        idempotency_key = "attempt-1",
    })
    if err then error(tostring(err)) end
    return result
end

local function define_tests()
    test.describe("Timer pullable", function()
        test.it("replays one persisted occurrence across attempts", function()
            local occurrence = {
                occurrence_seq = 4,
                occurrence_due_at = "2026-01-02T03:04:05Z",
                occurrence_key = "daily:4",
                occurrence_payload_json = '{"fired_at":"2026-01-02T03:04:05Z"}',
            }
            local first = pull(occurrence)
            test.is_true(first.success)
            test.eq(#first.items, 1)
            test.eq(first.items[1].dedup_key, "daily:4")
            test.eq(first.items[1].item_key, "daily:4")
            test.eq(first.items[1].op, "upsert")
            test.eq(first.items[1].payload.fired_at, occurrence.occurrence_due_at)
            test.eq(first.items[1].occurred_at, occurrence.occurrence_due_at)
            test.eq(first.next_cursor, "daily:4")
            test.is_false(first.has_more)
            test.eq(pull(occurrence).items[1].dedup_key, first.items[1].dedup_key)
        end)

        test.it("refuses an occurrence key that does not match the drive and sequence", function()
            local result = pull({ occurrence_seq = 4, occurrence_due_at = "2026-01-02T03:04:05Z", occurrence_key = "other:4",
                occurrence_payload_json = '{"fired_at":"2026-01-02T03:04:05Z"}' })
            test.is_false(result.success)
            test.eq(result.error.code, "invalid_config")
        end)
    end)
end

return test.run_cases(define_tests)
