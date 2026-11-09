local test = require("test")
local sql = require("sql")
local time = require("time")
local retention = require("channel_retention")
local tick = require("channel_retention_tick")
local policy = require("retention_policy_source")
local fixture = require("receive_fixture")
local conversation = require("channel_conversation")
local persist = require("persist")
local notifier = require("retention_notifier")
local recovery = require("turn_recovery")

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

        test.it("drains a backlog through callback continuation and schedules retained turns", function()
            local db = assert(sql.get(DB))
            local _, seed_err = db:execute([[WITH RECURSIVE n(x) AS (
                SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<1001)
                INSERT INTO kickside_channel_turns(turn_id,route_json,accepted_at,appended_at)
                SELECT 'chain-' || CAST(x AS TEXT),'{}',$1,$1 FROM n]], {stamp(-72)})
            db:release()
            test.is_nil(seed_err, tostring(seed_err))
            seed("retained", stamp(-1), true)
            local passes = 0
            repeat
                local result = tick.run()
                test.is_true(result.success, tostring(result.error))
                passes = passes + 1
                if not result.needs_continue then break end
                test.is_true(passes < 5)
            until false
            test.eq(table.concat(ids(), ","), "retained")
            test.eq(passes, 3)
            local result = tick.run()
            test.not_nil(result.deadline_ms)
            test.is_true(result.deadline_ms > math.floor(time.now():unix_nano()/1000000))
        end)

        test.it("holds a continuous settled-turn stream at rate times its 48-hour window", function()
            local base = assert(time.parse(time.RFC3339,"2099-01-01T00:00:00Z"))
            for hour = 1,60 do
                for n = 1,3 do
                    seed("stream-" .. tostring(hour) .. "-" .. tostring(n),
                        base:add(hour*time.HOUR):format_rfc3339(), true)
                end
                local pages = 0
                repeat
                    local _, err, progress = retention.prune_settled(DB,
                        base:add((hour-48)*time.HOUR):format_rfc3339(),2)
                    test.is_nil(err, tostring(err))
                    pages = pages + 1
                    test.is_true(pages < 5)
                    if not progress.needs_continue then break end
                until false
                test.eq(#ids(), math.min(hour,48)*3)
            end
        end)

        test.it("wakes retention after committed turn settlement and session changes", function()
            notifier.calls = 0
            seed("wake-settled",stamp(-72),false)
            local scheduled, schedule_err = recovery.schedule_retry(DB,"wake-settled",100)
            test.is_nil(schedule_err,tostring(schedule_err))
            test.is_true(scheduled)
            test.eq(notifier.calls,0,"a retry does not create cleanup eligibility")
            local cleared, clear_err = recovery.clear_retry(DB,"wake-settled")
            test.is_nil(clear_err,tostring(clear_err))
            test.is_true(cleared)
            test.eq(notifier.calls,0,"retry bookkeeping does not advance cleanup")
            local marked,err = recovery.mark_appended(DB,"wake-settled")
            test.is_nil(err,tostring(err))
            test.is_true(marked)
            test.eq(notifier.calls,1,"settlement establishes an expiry deadline")
            notifier.calls = 0
            test.is_nil(persist.set(DB,"kickside_channel_sessions","discord","wake-room","wake-session"))
            test.eq(notifier.calls,1,"a mapping establishes its idle deadline")
            notifier.calls = 0
            test.is_nil(persist.set(DB,"kickside_channel_sessions","discord","wake-room","wake-session"))
            test.eq(notifier.calls,0,"refreshing an existing mapping only postpones its deadline")
            notifier.calls = 0
            local rotated,rotate_err = persist.rotate_with_archive(DB,"kickside_channel_sessions",
                "discord","wake-room","wake-session","test")
            test.is_nil(rotate_err,tostring(rotate_err))
            test.not_nil(rotated)
            test.eq(notifier.calls,1,"rotation establishes its archive deadline")
            notifier.calls = 0
            local acquired,created,acquire_err = persist.get_or_create(DB,"kickside_channel_sessions","discord","wake-new")
            test.is_nil(acquire_err,tostring(acquire_err))
            test.not_nil(acquired)
            test.is_true(created)
            test.eq(notifier.calls,1,"first acquisition establishes its idle deadline")
        end)

        test.it("locks each composite conversation identity in a stable tuple order", function()
            seed("lock-a",stamp(-72),true)
            seed("lock-b",stamp(-72),true)
            local db = assert(sql.get(DB))
            test.is_nil(select(2,db:execute([[UPDATE kickside_channel_turns
                SET owner_provider=$1,owner_external_id=$2 WHERE turn_id=$3]],{"a","b:c","lock-a"})))
            test.is_nil(select(2,db:execute([[UPDATE kickside_channel_turns
                SET owner_provider=$1,owner_external_id=$2 WHERE turn_id=$3]],{"a:b","c","lock-b"})))
            db:release()
            local original = conversation.lock_tx
            local locks = {}
            conversation.lock_tx = function(tx,dbtype,provider,external_id)
                locks[#locks+1] = {provider=provider,external_id=external_id}
                return original(tx,dbtype,provider,external_id)
            end
            local ok,removed,err = pcall(retention.prune_settled,DB,stamp(-48),10)
            conversation.lock_tx = original
            test.is_true(ok,tostring(removed))
            test.is_nil(err,tostring(err))
            test.eq(removed,2)
            test.eq(#locks,2,"distinct tuple identities each acquire their own owner lock")
            test.eq(locks[1].provider,"a")
            test.eq(locks[2].provider,"a:b")
        end)

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
