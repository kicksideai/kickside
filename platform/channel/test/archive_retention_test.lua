local test = require("test")
local sql = require("sql")
local time = require("time")
local fixture = require("receive_fixture")
local retention = require("channel_archive_retention")
local idle = require("channel_idle_retention")
local sessions = require("session_service_stub")
local tick = require("channel_retention_tick")
local persist = require("persist")
local policy = require("retention_policy_stub")
local conversation = require("channel_conversation")

local DB = "app:db"
local function stamp(days: integer): string
    return time.now():utc():add(days * 24 * time.HOUR):format_rfc3339()
end

local function insert(statement: string, params: { any })
    local db = assert(sql.get(DB))
    local _, err = db:execute(statement, params)
    db:release()
    test.is_nil(err)
end

local function count(table_name: string, key: string, value: string): integer
    local db = assert(sql.get(DB))
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE " .. key .. "=$1", { value })
    db:release()
    test.is_nil(err)
    local count = math.tointeger(tonumber(rows[1].n))
    if count == nil then error("archive count is not an integer") end
    return count
end

local function archive(old: string, new: string, age_days: integer)
    insert([[INSERT INTO kickside_channel_session_archives
        (old_session_id,new_session_id,provider,external_id,reason,rotated_at)
        VALUES ($1,$2,'discord',$3,'idle_timeout',$4)]], { old, new, "room-" .. new, stamp(age_days) })
    insert([[INSERT INTO kickside_channel_admissions
        (session_id,provider,external_id,owner_id,record_id,link_id,identity_json,generation)
        VALUES ($1,'discord',$2,'channel','responder','link','{}',0)]], { old, "room-" .. new })
end

local function turn(id: string, session_id: string, age_days: integer, appended: boolean, state: string?)
    insert([[INSERT INTO kickside_channel_turns
        (turn_id,route_json,accepted_at,appended_at,reply_state)
        VALUES ($1,$2,$3,$4,$5)]], { id, '{"session_id":"' .. session_id .. '"}', stamp(age_days),
            appended and stamp(age_days) or sql.NULL, state or sql.NULL })
end

local function define_tests()
    test.describe("channel archive retention", function()
        test.before_each(function()
            fixture.truncate()
            sessions.deleted = {}
            sessions.delete_error = nil
            sessions.delete_result = nil
        end)

        test.it("continues after a child-turn page without removing its archive", function()
            archive("paged-old", "current", -40)
            local db = assert(sql.get(DB))
            local _, err = db:execute([[WITH RECURSIVE n(x) AS (
                SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<1001)
                INSERT INTO kickside_channel_turns(turn_id,route_json,accepted_at,appended_at)
                SELECT 'archive-chain-' || CAST(x AS TEXT),'{"session_id":"paged-old"}',$1,$1 FROM n]], {stamp(-40)})
            db:release()
            test.is_nil(err, tostring(err))
            local removed, prune_err, progress = retention.prune_archives(DB, stamp(-30), stamp(-2), 1)
            test.is_nil(prune_err, tostring(prune_err))
            test.eq(removed, 0)
            test.is_true(progress.needs_continue, "partial child deletion continues the same archive")
            local passes = 1
            repeat
                removed, prune_err, progress = retention.prune_archives(DB, stamp(-30), stamp(-2), 1)
                test.is_nil(prune_err, tostring(prune_err))
                passes = passes + 1
                if not progress.needs_continue then break end
                test.is_true(passes < 5)
            until false
            test.eq(count("kickside_channel_session_archives", "old_session_id", "paged-old"), 0)
            test.eq(count("kickside_channel_admissions", "session_id", "paged-old"), 0)
        end)

        test.it("bounds continuous idle and archived session streams by their windows", function()
            local base = assert(time.parse(time.RFC3339,"2099-01-01T00:00:00Z"))
            for day = 1,36 do
                local current = base:add(day*24*time.HOUR):format_rfc3339()
                local cutoff = base:add((day-30)*24*time.HOUR):format_rfc3339()
                for n = 1,3 do
                    local id = "session-stream-" .. tostring(day) .. "-" .. tostring(n)
                    insert([[INSERT INTO kickside_channel_sessions(provider,external_id,session_id,updated_at)
                        VALUES ('stream',$1,$1,$2)]],{id,current})
                    archive("archive-" .. id,"next-" .. id,0)
                    insert("UPDATE kickside_channel_session_archives SET rotated_at=$1 WHERE old_session_id=$2",{current,"archive-" .. id})
                    insert([[INSERT INTO kickside_channel_session_owner(session_id,provider,external_id)
                        VALUES ($1,'discord',$2)]],{"archive-" .. id,"room-next-" .. id})
                end
                local pages = 0
                repeat
                    local _, err, progress = idle.retire_idle(DB,cutoff,2)
                    test.is_nil(err,tostring(err))
                    pages = pages + 1
                    test.is_true(pages < 5)
                    if not progress.needs_continue then break end
                until false
                pages = 0
                repeat
                    local _, err, progress = retention.prune_archives(DB,cutoff,cutoff,2)
                    test.is_nil(err,tostring(err))
                    pages = pages + 1
                    test.is_true(pages < 10)
                    if not progress.needs_continue then break end
                until false
                local db = assert(sql.get(DB))
                for _,name in ipairs({"kickside_channel_sessions","kickside_channel_session_archives",
                    "kickside_channel_admissions","kickside_channel_session_owner"}) do
                    local rows = assert(db:query("SELECT COUNT(*) AS n FROM " .. name))
                    test.eq(tonumber(rows[1].n),math.min(day,30)*3,name)
                end
                db:release()
            end
        end)

        test.it("rolls back an idle page when a later archive write fails", function()
            for _,id in ipairs({"atomic-a","atomic-b"}) do
                insert([[INSERT INTO kickside_channel_sessions(provider,external_id,session_id,updated_at)
                    VALUES ('atomic',$1,$1,$2)]],{id,stamp(-40)})
            end
            archive("atomic-b","existing",0)
            local removed,err = idle.retire_idle(DB,stamp(-30),2)
            test.is_nil(removed)
            test.not_nil(err)
            test.eq(count("kickside_channel_sessions","provider","atomic"),2,
                "a bounded idle page commits as one transaction")
            test.eq(count("kickside_channel_session_archives","old_session_id","atomic-a"),0)
        end)

        test.it("rolls back an archive page when a later child proof fails", function()
            archive("atomic-archive-a","first",-40)
            archive("atomic-archive-b","second",-40)
            turn("atomic-child","atomic-archive-b",-40,true,"sent")
            insert([[UPDATE kickside_channel_turns SET owner_provider='different',owner_external_id='different'
                WHERE turn_id='atomic-child']],{})
            local removed,err = retention.prune_archives(DB,stamp(-30),stamp(-2),2)
            test.is_nil(removed)
            test.not_nil(err)
            test.eq(count("kickside_channel_session_archives","old_session_id","atomic-archive-a"),1,
                "one bounded archive page commits as a unit")
            test.eq(count("kickside_channel_admissions","session_id","atomic-archive-a"),1)
        end)

        test.it("keeps an archive whose backing delete failed while rotations continue", function()
            local first, _, first_err = persist.get_or_create(DB, "kickside_channel_sessions", "discord", "rotating")
            test.is_nil(first_err)
            if not first then error("missing initial session identity") end
            local second, rotate_err = persist.rotate_with_archive(DB, "kickside_channel_sessions",
                "discord", "rotating", first, "test")
            test.is_nil(rotate_err)
            if not second then error("missing rotated session identity") end
            insert([[UPDATE kickside_channel_session_archives SET rotated_at=$1
                WHERE old_session_id=$2]], { stamp(-40), first })
            sessions.delete_error = "context deletion failed"
            local removed, delete_err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(removed)
            test.not_nil(delete_err)
            local third, third_err = persist.rotate_with_archive(DB, "kickside_channel_sessions",
                "discord", "rotating", second, "test")
            test.is_nil(third_err)
            test.not_nil(third)
            sessions.delete_error = nil
            removed, delete_err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(delete_err)
            test.eq(removed, 1)
            local db = assert(sql.get(DB))
            local owned = assert(db:query([[SELECT session_id FROM kickside_channel_session_owner
                WHERE provider='discord' AND external_id='rotating' ORDER BY session_id]]))
            db:release()
            test.eq(#owned, 2)
            for _, row in ipairs(owned) do test.is_true(row.session_id ~= first) end
        end)

        test.it("deletes old settled session history and its admission and archive", function()
            archive("old", "current", -40)
            turn("done", "old", -40, true, "sent")
            local removed, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(err)
            test.eq(removed, 1)
            test.eq(sessions.deleted[1], "old")
            test.eq(count("kickside_channel_session_archives", "old_session_id", "old"), 0)
            test.eq(count("kickside_channel_admissions", "session_id", "old"), 0)
            test.eq(count("kickside_channel_turns", "turn_id", "done"), 0)
        end)

        test.it("leaves a fenced conversation's archived turns and sessions to owner cleanup", function()
            archive("fenced-old", "current", -40)
            turn("fenced-turn", "fenced-old", -40, true, "sent")
            test.is_nil(conversation.begin_delete(DB, "discord", "room-current"))
            local removed, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(err, tostring(err))
            test.eq(removed, 0)
            test.eq(#sessions.deleted, 0)
            test.eq(count("kickside_channel_turns", "turn_id", "fenced-turn"), 1)
            test.eq(count("kickside_channel_session_archives", "old_session_id", "fenced-old"), 1)
        end)

        test.it("rejects a missing archive candidate scan result", function()
            local fake = { query = function() return nil, nil end }
            local rows, err = retention._scan_candidates(fake,
                "json_extract(t.route_json, '$.session_id')", stamp(-30), stamp(-2), 1)
            test.is_nil(rows)
            test.is_true(errors.is(err, errors.INTERNAL), tostring(err))
        end)

        test.it("retains uncertain, unappended and fresh turns before deleting backing sessions", function()
            archive("reserved", "r", -40)
            archive("unappended", "u", -40)
            archive("fresh-proof", "f", -40)
            archive("young", "y", -1)
            archive("mapped", "m", -40)
            insert([[INSERT INTO kickside_channel_sessions (provider,external_id,session_id,updated_at)
                VALUES ('discord','room-m','mapped',$1)]], { stamp(-40) })
            turn("t-reserved", "reserved", -40, true, "reserved")
            turn("t-unappended", "unappended", -40, false)
            turn("t-fresh", "fresh-proof", -1, true, "sent")
            local removed, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(err)
            test.eq(removed, 0)
            test.eq(#sessions.deleted, 0)
            test.eq(count("kickside_channel_session_archives", "provider", "discord"), 5)
        end)

        test.it("drains archive candidates in bounded batches", function()
            archive("first", "one", -40)
            archive("second", "two", -40)
            local first, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 1)
            test.is_nil(err)
            test.eq(first, 1)
            test.eq(#sessions.deleted, 1)
            local second, second_err = retention.prune_archives(DB, stamp(-30), stamp(-2), 1)
            test.is_nil(second_err)
            test.eq(second, 1)
            test.eq(count("kickside_channel_session_archives", "provider", "discord"), 0)
        end)

        test.it("deletes no more than one page of turns per archived session", function()
            archive("many-turns", "current", -40)
            local opened = assert(sql.get(DB))
            for i = 1, 501 do
                local _, err = opened:execute([[INSERT INTO kickside_channel_turns
                    (turn_id,route_json,accepted_at,appended_at,reply_state)
                    VALUES ($1,$2,$3,$3,'sent')]],
                    { "many-" .. tostring(i), '{"session_id":"many-turns"}', stamp(-40) })
                test.is_nil(err, tostring(err))
            end
            opened:release()
            local first, first_err = retention.prune_archives(DB, stamp(-30), stamp(-2), 1)
            local remaining_after_first = count("kickside_channel_turns", "reply_state", "sent")
            local pointer_after_first = count("kickside_channel_session_archives", "old_session_id", "many-turns")
            local second, second_err = retention.prune_archives(DB, stamp(-30), stamp(-2), 1)
            test.is_nil(first_err, tostring(first_err))
            test.eq(first, 0)
            test.eq(remaining_after_first, 1)
            test.eq(pointer_after_first, 1)
            test.is_nil(second_err, tostring(second_err))
            test.eq(second, 1)
            test.eq(count("kickside_channel_turns", "reply_state", "sent"), 0)
        end)

        test.it("leaves a fenced idle mapping to owner cleanup", function()
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", "fenced-idle", "idle-session"))
            insert("UPDATE kickside_channel_sessions SET updated_at=$1 WHERE external_id='fenced-idle'", { stamp(-40) })
            test.is_nil(conversation.begin_delete(DB, "discord", "fenced-idle"))
            local removed, err = idle.retire_idle(DB, stamp(-30), 10)
            test.is_nil(err, tostring(err))
            test.eq(removed, 0)
            test.eq(count("kickside_channel_sessions", "external_id", "fenced-idle"), 1)
            test.eq(count("kickside_channel_session_archives", "old_session_id", "idle-session"), 0)
        end)

        test.it("retires idle mappings into durable archive pointers in bounded batches", function()
            insert([[INSERT INTO kickside_channel_sessions (provider,external_id,session_id,updated_at)
                VALUES ('discord','idle-a','idle-a-session',$1),
                       ('discord','idle-b','idle-b-session',$1),
                       ('discord','fresh','fresh-session',$2)]], { stamp(-40), stamp(-1) })
            local first, first_err = idle.retire_idle(DB, stamp(-30), 1)
            test.is_nil(first_err)
            if not first then error("missing initial session identity") end
            test.eq(first, 1)
            test.eq(count("kickside_channel_sessions", "provider", "discord"), 2)
            test.eq(count("kickside_channel_session_archives", "reason", "idle_retirement"), 1)
            test.eq(#sessions.deleted, 0, "the archive must own backing-session deletion")

            local second, second_err = idle.retire_idle(DB, stamp(-30), 1)
            test.is_nil(second_err)
            test.eq(second, 1)
            test.eq(count("kickside_channel_sessions", "provider", "discord"), 1)
            test.eq(count("kickside_channel_sessions", "external_id", "fresh"), 1)
            test.eq(count("kickside_channel_session_archives", "reason", "idle_retirement"), 2)
            test.eq(#sessions.deleted, 0)
        end)

        test.it("keeps the archive pointer when backing-session deletion fails", function()
            archive("retry", "current", -40)
            sessions.delete_error = "session storage unavailable"
            local removed, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(removed)
            test.not_nil(err)
            test.eq(count("kickside_channel_session_archives", "old_session_id", "retry"), 1)
            test.eq(count("kickside_channel_admissions", "session_id", "retry"), 1)
            sessions.delete_error = nil
            removed, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(err)
            test.eq(removed, 1)
        end)

        test.it("finishes SQL cleanup when a prior tick already deleted the backing session", function()
            archive("already-gone", "current", -40)
            sessions.delete_error = "Session not found"
            local removed, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(err)
            test.eq(removed, 1)
            test.eq(count("kickside_channel_session_archives", "old_session_id", "already-gone"), 0)
        end)

        test.it("requires backing-session deletion proof before dropping the owner pointer", function()
            archive("no-proof", "current", -40)
            sessions.delete_result = { deleted = false }
            local removed, err = retention.prune_archives(DB, stamp(-30), stamp(-2), 10)
            test.is_nil(removed)
            test.not_nil(err)
            test.eq(count("kickside_channel_session_archives", "old_session_id", "no-proof"), 1)
        end)

        test.it("runs archive reclamation on the shared retention tick", function()
            archive("old", "current", -40)
            local result = tick.run()
            test.is_true(result.success, tostring(result.error))
            test.eq(result.deleted, 1)
            test.eq(sessions.deleted[1], "old")
        end)

        test.it("runs idle mapping retirement on the shared retention tick", function()
            insert([[INSERT INTO kickside_channel_sessions (provider,external_id,session_id,updated_at)
                VALUES ('discord','idle','idle-session',$1)]], { stamp(-40) })
            local result = tick.run()
            test.is_true(result.success, tostring(result.error))
            test.eq(result.deleted, 1)
            test.not_nil(result.deadline_ms,"idle retirement schedules its new archive expiry")
            test.eq(count("kickside_channel_sessions", "external_id", "idle"), 0)
            test.eq(count("kickside_channel_session_archives", "old_session_id", "idle-session"), 1)
            test.eq(#sessions.deleted, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
