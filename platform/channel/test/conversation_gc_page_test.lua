local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local persist = require("persist")
local fixture = require("receive_fixture")
local conversation = require("channel_conversation")

local DB = "app:db"

return test.run_cases(function()
    test.describe("channel conversation owner pages", function()
        test.it("retains the owner pointer until all turns drain in bounded pages", function()
            local external_id = "gc-page-" .. uuid.v4()
            local session_id = "gc-session-" .. uuid.v4()
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", external_id, session_id))
            local db = assert(sql.get(DB))
            for i = 1, 205 do
                local state = i == 1 and "reserved" or "sent"
                local _, insert_err = db:execute([[INSERT INTO kickside_channel_turns
                    (turn_id,route_json,accepted_at,appended_at,reply_state)
                    VALUES ($1,$2,'2000-01-01T00:00:00Z','2000-01-01T00:00:00Z',$3)]],
                    { external_id .. ":" .. string.format("%03d", i),
                        '{"session_id":"' .. session_id .. '"}', state })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            test.is_nil(conversation.begin_delete(DB, "discord", external_id))
            local first, first_err = persist.remove_conversation(DB, "discord", external_id, { session_id })
            db = assert(sql.get(DB))
            local rows, read_err = db:query([[SELECT COUNT(*) AS n FROM kickside_channel_turns
                WHERE route_json LIKE $1]], { "%" .. session_id .. "%" })
            local mapping, map_err = db:query([[SELECT session_id FROM kickside_channel_sessions
                WHERE provider='discord' AND external_id=$1]], { external_id })
            db:release()
            local second, second_err = persist.remove_conversation(DB, "discord", external_id, { session_id })
            local third, third_err = persist.remove_conversation(DB, "discord", external_id, { session_id })
            test.is_nil(read_err, tostring(read_err))
            test.is_nil(map_err, tostring(map_err))
            test.is_nil(first)
            test.is_true(errors.is(first_err, errors.CONFLICT), tostring(first_err))
            test.is_true((first_err :: any):details().cleanup_pending)
            test.eq((first_err :: any):details().discarded.reply_uncertain, 1)
            test.is_true(tonumber(rows[1].n) >= 105, "one call must delete at most 100 turns")
            test.eq(#mapping, 1, "the owner mapping is the continuation pointer")
            test.is_nil(second)
            test.is_true(errors.is(second_err, errors.CONFLICT), tostring(second_err))
            test.not_nil(third)
            test.is_nil(third_err, tostring(third_err))
        end)
    end)
end)
