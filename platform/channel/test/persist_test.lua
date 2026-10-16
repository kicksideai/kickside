local test = require("test")
local persist = require("persist")
local acquire = require("session_acquire")
local sql = require("sql")
local time = require("time")
local policy = require("retention_policy_stub")
local channel = require("channel")

local DB = "app:db"
local TABLE = "kickside_channel_sessions"

local function truncate()
    local db = sql.get(DB)
    if not db then error("missing test db") end
    db:execute("DELETE FROM " .. TABLE)
    db:execute("DELETE FROM kickside_channel_session_archives")
    db:execute("DELETE FROM kickside_channel_session_owner")
    db:execute("DELETE FROM kickside_channel_conversation")
    db:release()
end

local function define_tests()
    test.describe("channel persist", function()
        test.before_each(function()
            truncate()
        end)

        test.it("rotates session identities past any former per-conversation count", function()
            local first, _, first_err = persist.get_or_create(DB, TABLE, "discord", "unbounded")
            test.is_nil(first_err)
            if not first then error("missing initial session identity") end
            local current = first
            for _ = 1, 3 do
                local next_id, rotate_err = persist.rotate_with_archive(DB, TABLE, "discord", "unbounded", current, "test")
                test.is_nil(rotate_err)
                if not next_id then error("missing rotated session identity") end
                current = next_id
            end
            test.eq(persist.get(DB, TABLE, "discord", "unbounded"), current)
            local db = assert(sql.get(DB))
            local rows = assert(db:query([[SELECT COUNT(*) AS n FROM kickside_channel_session_owner
                WHERE provider='discord' AND external_id='unbounded']]))
            db:release()
            test.eq(tonumber(rows[1].n), 4)
        end)

        test.it("serializes competing rotations of one session under the conversation owner row", function()
            local first, _, first_err = persist.get_or_create(DB, TABLE, "discord", "race")
            test.is_nil(first_err)
            if not first then error("missing initial session identity") end
            local outcomes = channel.new(2)
            for _ = 1, 2 do
                coroutine.spawn(function()
                    local next_id, err = persist.rotate_with_archive(DB, TABLE, "discord", "race", first, "test")
                    outcomes:send({ next_id = next_id, err = err })
                end)
            end
            local a, b = outcomes:receive(), outcomes:receive()
            local success = (a.next_id and 1 or 0) + (b.next_id and 1 or 0)
            test.eq(success, 1)
            local db = assert(sql.get(DB))
            local rows = assert(db:query([[SELECT COUNT(*) AS n FROM kickside_channel_session_owner
                WHERE provider='discord' AND external_id='race']]))
            db:release()
            test.eq(tonumber(rows[1].n), 2)
        end)

        test.it("reuses the winning first ingress when it committed after lookup", function()
            local db = assert(sql.get(DB))
            local absent = assert(db:query([[SELECT session_id FROM kickside_channel_sessions
                WHERE provider='discord' AND external_id='first-ingress']]))
            db:release()
            test.eq(#absent, 0) -- loser has observed absence before the winner commits
            local winner, created, winner_err = persist.get_or_create(DB, TABLE, "discord", "first-ingress")
            local inserted, loser_err = acquire.insert_new(DB, TABLE, "discord", "first-ingress",
                "losing-first-ingress")
            test.is_nil(winner_err)
            test.is_true(created)
            test.is_nil(loser_err)
            test.is_false(inserted)
            test.eq(persist.get(DB, TABLE, "discord", "first-ingress"), winner)
            db = assert(sql.get(DB))
            local rows = assert(db:query([[SELECT COUNT(*) AS n FROM kickside_channel_session_owner
                WHERE provider='discord' AND external_id='first-ingress']]))
            db:release()
            test.eq(tonumber(rows[1].n), 1)
        end)

        test.it("get returns nil for an unmapped conversation", function()
            local sid, err = persist.get(DB, TABLE, "discord", "chan-x")
            test.is_nil(err)
            test.is_nil(sid)
        end)

        test.it("rejects a missing conversation session list result", function()
            local fake = { query = function() return nil, nil end }
            local ids, err = persist._conversation_sessions_on_db(fake, "discord", "chan-x")
            test.is_nil(ids)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
        end)

        test.it("limits the backing-session read to one owner page", function()
            local statement, args
            local fake = { query = function(_self: any, query: string, params: any): (any?, any?)
                statement, args = query, params
                return {}, nil
            end }
            local ids, err = persist._conversation_sessions_on_db(fake, "discord", "chan-x")
            test.is_nil(err, tostring(err))
            test.eq(#ids, 0)
            test.is_true(statement:find("LIMIT $3", 1, true) ~= nil)
            test.is_true(type(args[3]) == "number" and args[3] <= 100)
        end)

        test.it("get_or_create mints once then reuses", function()
            local first, created1, e1 = persist.get_or_create(DB, TABLE, "discord", "chan-1")
            test.is_nil(e1)
            test.is_true(created1)
            test.is_true(type(first) == "string" and first ~= "")

            local second, created2, e2 = persist.get_or_create(DB, TABLE, "discord", "chan-1")
            test.is_nil(e2)
            test.is_false(created2)
            test.eq(second, first)
        end)

        test.it("get_or_create rotates an idle mapping when a cutoff is supplied", function()
            local first, created1, e1 = persist.get_or_create(DB, TABLE, "discord", "chan-idle")
            test.is_nil(e1)
            test.is_true(created1)

            local db = sql.get(DB)
            if not db then error("missing test db") end
            local old = time.now():utc():add(-3 * time.HOUR):format_rfc3339()
            db:execute(
                "UPDATE " .. TABLE .. " SET updated_at = $1 WHERE provider = $2 AND external_id = $3",
                { old, "discord", "chan-idle" })
            db:release()

            local second, created2, e2 = persist.get_or_create(DB, TABLE, "discord", "chan-idle", 2 * 60 * 60)
            test.is_nil(e2)
            test.is_true(created2)
            test.is_true(type(second) == "string" and second ~= first)
            db = sql.get(DB)
            if not db then error("missing test db") end
            local archives, archive_err = db:query([[SELECT new_session_id,reason
                FROM kickside_channel_session_archives WHERE old_session_id=$1]], { first })
            db:release()
            test.is_nil(archive_err)
            test.eq(#archives, 1)
            test.eq(archives[1].new_session_id, second)
            test.eq(archives[1].reason, "idle_timeout")
        end)

        test.it("get_or_create reuses a fresh mapping below the idle cutoff", function()
            local first, created1, e1 = persist.get_or_create(DB, TABLE, "discord", "chan-fresh")
            test.is_nil(e1)
            test.is_true(created1)

            local second, created2, e2 = persist.get_or_create(DB, TABLE, "discord", "chan-fresh", 2 * 60 * 60)
            test.is_nil(e2)
            test.is_false(created2)
            test.eq(second, first)
        end)

        test.it("a stale touch cannot recreate an idle mapping after retention detaches it", function()
            persist.set(DB, TABLE, "discord", "chan-detached", "old-session")
            local db = assert(sql.get(DB))
            local rows = assert(db:query([[SELECT updated_at FROM kickside_channel_sessions
                WHERE provider='discord' AND external_id='chan-detached']]))
            local observed = rows[1].updated_at
            assert(db:execute([[DELETE FROM kickside_channel_sessions
                WHERE provider='discord' AND external_id='chan-detached']]))
            db:release()
            local touched, touch_err = acquire.touch_existing(DB, TABLE, "discord", "chan-detached",
                "old-session", observed)
            test.is_nil(touch_err)
            test.is_false(touched)
            test.is_nil((persist.get(DB, TABLE, "discord", "chan-detached")))
        end)

        test.it("set pins an explicit session id", function()
            local serr = persist.set(DB, TABLE, "discord", "chan-2", "session-pinned")
            test.is_nil(serr)
            local sid = persist.get(DB, TABLE, "discord", "chan-2")
            test.eq(sid, "session-pinned")
        end)

        test.it("clear rotates to a fresh session id", function()
            local original = persist.get_or_create(DB, TABLE, "discord", "chan-3")
            local rotated, cerr = persist.clear(DB, TABLE, "discord", "chan-3")
            test.is_nil(cerr)
            test.is_true(type(rotated) == "string" and rotated ~= "")
            test.is_true(rotated ~= original)
            test.eq(persist.get(DB, TABLE, "discord", "chan-3"), rotated)
        end)

        test.it("remove deletes the mapping row (the owner-teardown path)", function()
            persist.set(DB, TABLE, "discord", "chan-rm", "session-rm")
            test.eq(persist.get(DB, TABLE, "discord", "chan-rm"), "session-rm")
            local rerr = persist.remove(DB, TABLE, "discord", "chan-rm")
            test.is_nil(rerr)
            test.is_nil((persist.get(DB, TABLE, "discord", "chan-rm")))
        end)

        test.it("remove of an absent row is a no-op success", function()
            local rerr = persist.remove(DB, TABLE, "discord", "never-mapped")
            test.is_nil(rerr)
        end)

        test.it("remove rejects a blank provider", function()
            local rerr = persist.remove(DB, TABLE, "", "x")
            test.is_true(rerr ~= nil)
        end)

        test.it("keys are scoped by provider", function()
            persist.set(DB, TABLE, "discord", "shared", "discord-session")
            persist.set(DB, TABLE, "slack", "shared", "slack-session")
            test.eq(persist.get(DB, TABLE, "discord", "shared"), "discord-session")
            test.eq(persist.get(DB, TABLE, "slack", "shared"), "slack-session")
        end)

        test.it("rejects blank provider or external id", function()
            local _, e1 = persist.get(DB, TABLE, "", "x")
            test.is_true(e1 ~= nil)
            local _, _, e2 = persist.get_or_create(DB, TABLE, "discord", "")
            test.is_true(e2 ~= nil)
        end)

        test.it("writes updated_at as a Z-suffixed RFC3339 UTC string", function()
            persist.set(DB, TABLE, "discord", "chan-ts", "session-ts")
            local db = sql.get(DB)
            if not db then error("missing test db") end
            local dbh = db :: any
            local rows = dbh:query(
                "SELECT updated_at FROM " .. TABLE .. " WHERE provider = $1 AND external_id = $2",
                { "discord", "chan-ts" })
            dbh:release()
            test.eq(#rows, 1)
            local raw = tostring(rows[1].updated_at)
            test.eq(raw:sub(-1), "Z")
            local parsed, perr = time.parse(time.RFC3339, raw)
            test.is_nil(perr)
            test.not_nil(parsed)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
