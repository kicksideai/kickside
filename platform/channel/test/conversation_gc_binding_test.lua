local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local fixture = require("receive_fixture")
local persist = require("persist")
local cleanup = require("cleanup_conversation")
local sessions = require("session_service_stub")

local DB = "app:db"

return test.run_cases(function()
    test.describe("conversation binding owner cleanup", function()
        test.before_each(function()
            fixture.truncate()
            sessions.deleted = {}
            sessions.delete_error = nil
            sessions.delete_result = nil
        end)

        test.it("requires backing-session deletion proof before dropping the pointer", function()
            local external_id = "proof-" .. uuid.v4()
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", external_id, "proof-session"))
            sessions.delete_result = {}
            local result = cleanup.cleanup_conversation({ provider = "discord", external_id = external_id })
            test.is_false(result.success)
            test.is_true(errors.is(result.error, errors.INTERNAL), tostring(result.error))
            test.eq(persist.get(DB, "kickside_channel_sessions", "discord", external_id), "proof-session")
        end)

        test.it("resumes a committed turn page after session delete reports not found", function()
            local external_id = "retry-" .. uuid.v4()
            local session_id = "session-" .. uuid.v4()
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", external_id, session_id))
            local db = assert(sql.get(DB))
            for i = 1, 205 do
                local _, err = db:execute([[INSERT INTO kickside_channel_turns
                    (turn_id,route_json,accepted_at,appended_at,reply_state)
                    VALUES ($1,$2,'2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',$3)]],
                    { external_id .. ":" .. string.format("%03d", i),
                        '{"session_id":"' .. session_id .. '"}', i == 1 and "reserved" or "sent" })
                test.is_nil(err, tostring(err))
            end
            db:release()
            local first = cleanup.cleanup_conversation({ provider = "discord", external_id = external_id })
            test.is_false(first.success)
            test.is_true(errors.is(first.error, errors.CONFLICT), tostring(first.error))
            test.eq(#sessions.deleted, 1)
            db = assert(sql.get(DB))
            local counts, count_err = db:query([[SELECT reply_uncertain FROM kickside_channel_cleanup_counts
                WHERE provider='discord' AND external_id=$1]], { external_id })
            db:release()
            test.is_nil(count_err, tostring(count_err))
            test.eq(tonumber(counts[1].reply_uncertain), 1)
            sessions.delete_error = "Session not found"
            local second = cleanup.cleanup_conversation({ provider = "discord", external_id = external_id })
            test.is_false(second.success)
            test.is_true(errors.is(second.error, errors.CONFLICT), tostring(second.error))
            local third = cleanup.cleanup_conversation({ provider = "discord", external_id = external_id })
            test.is_true(third.success, tostring(third.error))
            test.eq(third.discarded.reply_uncertain, 1)
            test.is_nil(persist.get(DB, "kickside_channel_sessions", "discord", external_id))
            db = assert(sql.get(DB))
            local left, left_err = db:query([[SELECT provider FROM kickside_channel_cleanup_counts
                WHERE provider='discord' AND external_id=$1]], { external_id })
            db:release()
            test.is_nil(left_err, tostring(left_err))
            test.eq(#left, 0)
        end)

        test.it("deletes at most one page of backing sessions before each SQL owner page", function()
            local external_id = "archives-" .. uuid.v4()
            local current_id = "current-" .. uuid.v4()
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", external_id, current_id))
            local db = assert(sql.get(DB))
            for i = 1, 205 do
                local _, err = db:execute([[INSERT INTO kickside_channel_session_archives
                    (old_session_id,new_session_id,provider,external_id,reason,rotated_at)
                    VALUES ($1,$2,'discord',$3,'idle_timeout','2000-01-01T00:00:00Z')]],
                    { external_id .. ":" .. string.format("%03d", i), current_id, external_id })
                test.is_nil(err, tostring(err))
            end
            db:release()
            local first = cleanup.cleanup_conversation({ provider = "discord", external_id = external_id })
            test.is_false(first.success)
            test.is_true(errors.is(first.error, errors.CONFLICT), tostring(first.error))
            test.is_true(#sessions.deleted <= 100, "one call may touch at most 100 backing sessions")
            db = assert(sql.get(DB))
            local rows, read_err = db:query([[SELECT COUNT(*) AS n FROM kickside_channel_session_archives
                WHERE provider='discord' AND external_id=$1]], { external_id })
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.is_true(tonumber(rows[1].n) >= 105)
        end)
    end)
end)
