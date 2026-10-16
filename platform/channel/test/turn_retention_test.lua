local test = require("test")
local sql = require("sql")
local time = require("time")
local retention = require("channel_retention")
local tick = require("channel_retention_tick")
local policy = require("retention_policy_source")
local fixture = require("receive_fixture")
local conversation = require("channel_conversation")
local persist = require("persist")

local function resolve(retention: any): (any?, error?)
    return policy.resolve({ retention = retention, limits = { max_row_bytes = 4194304 } })
end

local DB = "app:db"

local function stamp(hours: integer): string
    return time.now():utc():add(hours * time.HOUR):format_rfc3339()
end

local function seed(id: string, accepted_at: string, appended: boolean, reply_state: string?)
    local db = assert(sql.get(DB))
    local _, err = db:execute([[INSERT INTO kickside_channel_turns
        (turn_id,route_json,accepted_at,appended_at,reply_state)
        VALUES ($1,$2,$3,$4,$5)]],
        { id, '{"session_id":"session-' .. id .. '"}', accepted_at,
          appended and accepted_at or sql.NULL, reply_state or sql.NULL })
    db:release()
    test.is_nil(err)
end

local function ids(): { string }
    local db = assert(sql.get(DB))
    local rows, err = db:query("SELECT turn_id FROM kickside_channel_turns ORDER BY turn_id")
    db:release()
    test.is_nil(err)
    local result: { string } = {}
    for _, row in ipairs(rows) do result[#result + 1] = row.turn_id end
    return result
end

local function define_tests()
    test.describe("channel accepted-turn retention", function()
        test.before_each(fixture.truncate)

        test.it("reclaims only appended turns with expired reply proofs and settled receipts", function()
            seed("old-plain", stamp(-72), true)
            seed("old-sent", stamp(-72), true, "sent")
            seed("reserved", stamp(-72), true, "reserved")
            seed("unappended", stamp(-72), false)
            seed("fresh", stamp(-1), true, "sent")
            local deleted, err = retention.prune_settled(DB, stamp(-48), 10)
            test.is_nil(err)
            test.eq(deleted, 2)
            test.eq(table.concat(ids(), ","), "fresh,reserved,unappended")
        end)

        test.it("leaves a fenced conversation's settled turns to owner cleanup", function()
            seed("owner-delete", stamp(-72), true, "sent")
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", "owner-delete", "session-owner-delete"))
            test.is_nil(conversation.begin_delete(DB, "discord", "owner-delete"))
            local deleted, err = retention.prune_settled(DB, stamp(-48), 10)
            test.is_nil(err, tostring(err))
            test.eq(deleted, 0)
            test.eq(table.concat(ids(), ","), "owner-delete")
        end)

        test.it("drains a bounded batch on successive retention ticks", function()
            for i = 1, 3 do seed("settled-" .. i, stamp(-72), true) end
            local first, err = retention.prune_settled(DB, stamp(-48), 2)
            test.is_nil(err)
            test.eq(first, 2)
            test.eq(#ids(), 1)
            local second, second_err = retention.prune_settled(DB, stamp(-48), 2)
            test.is_nil(second_err)
            test.eq(second, 1)
            test.eq(#ids(), 0)
        end)

        test.it("runs through the owner's existing retention callback", function()
            seed("settled", stamp(-72), true, "sent")
            seed("uncertain", stamp(-72), true, "reserved")
            local result = tick.run()
            test.is_true(result.success, tostring(result.error))
            test.eq(result.deleted, 1)
            test.eq(table.concat(ids(), ","), "uncertain")
        end)

        test.it("rejects a retention window shorter than the reply proof lifetime", function()
            local settings, err = resolve({ settled_turns = "24h", batch_turns = 500,
                archived_sessions = "30d", batch_archives = 50, idle_sessions = "30d", batch_idle = 50 })
            test.is_nil(settings)
            test.not_nil(err)
            settings, err = resolve({ settled_turns = "48h", batch_turns = 501,
                archived_sessions = "30d", batch_archives = 50, idle_sessions = "30d", batch_idle = 50 })
            test.is_nil(settings)
            test.not_nil(err)
            settings, err = resolve({ settled_turns = "48h", batch_turns = 500,
                archived_sessions = "30d", batch_archives = 50, idle_sessions = "30d", batch_idle = 50 })
            test.is_nil(err)
            test.eq(settings.settled_turns_ms, 48 * 60 * 60 * 1000)
            test.eq(settings.idle_sessions_ms, 30 * 24 * 60 * 60 * 1000)
            settings, err = resolve({ settled_turns = "48h", batch_turns = 500,
                archived_sessions = "30d", batch_archives = 50, idle_sessions = "30d", batch_idle = 51 })
            test.is_nil(settings)
            test.not_nil(err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
