local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local link_service = require("link_service")
local cleanup_conversation = require("cleanup_conversation")
local channel_cleanup_finalize = require("channel_cleanup_finalize")
local conversation = require("channel_conversation")
local persist = require("persist")
local fixture = require("receive_fixture")
local gc = require("conversation_gc")
local recovery = require("turn_recovery")
local channel = require("channel")

local DB = "app:db"

return test.run_cases(function()
    test.describe("identity unlink conversation counts", function()
        test.before_all(function()
            local db = assert(sql.get(DB))
            local created, create_err = db:execute([[CREATE TABLE IF NOT EXISTS kickside_external_links (
                link_id TEXT NOT NULL UNIQUE, provider TEXT NOT NULL, external_id TEXT NOT NULL,
                user_id TEXT NOT NULL, PRIMARY KEY (provider,external_id))]])
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(created)
            local blocker, blocker_err = db:execute([[CREATE TABLE IF NOT EXISTS unlink_delete_blocker (
                link_id TEXT NOT NULL REFERENCES kickside_external_links(link_id) ON DELETE RESTRICT)]])
            db:release()
            test.is_nil(blocker_err, tostring(blocker_err))
            test.not_nil(blocker)
        end)

        test.it("keeps discarded counts through a failed link DELETE and reports them on retry", function()
            fixture.truncate()
            local external_id, link_id, session_id = "unlink-" .. uuid.v4(), uuid.v7(), uuid.v7()
            local db = assert(sql.get(DB))
            local added, add_err = db:execute([[INSERT INTO kickside_external_links
                (link_id,provider,external_id,user_id) VALUES ($1,'discord',$2,'owner')]],
                { link_id, external_id })
            test.is_nil(add_err, tostring(add_err))
            test.not_nil(added)
            local blocked, block_err = db:execute("INSERT INTO unlink_delete_blocker (link_id) VALUES ($1)", { link_id })
            test.is_nil(block_err, tostring(block_err))
            test.not_nil(blocked)
            local turn, turn_err = db:execute([[INSERT INTO kickside_channel_turns
                (turn_id,route_json,accepted_at,reply_state)
                VALUES ($1,$2,'2000-01-01T00:00:00Z','reserved')]],
                { uuid.v7(), '{"session_id":"' .. session_id .. '"}' })
            db:release()
            test.is_nil(turn_err, tostring(turn_err))
            test.not_nil(turn)
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", external_id, session_id))

            local first, first_err = link_service.unlink("owner", "discord", external_id)
            test.is_false(first)
            test.is_true(errors.is(first_err, errors.UNAVAILABLE), tostring(first_err))
            test.eq((first_err :: any):details().discarded.reply_uncertain, 1)
            test.eq((first_err :: any):details().discarded.unappended, 1)
            db = assert(sql.get(DB))
            local retained, read_err = db:query([[SELECT reply_uncertain,unappended
                FROM kickside_channel_cleanup_counts WHERE provider='discord' AND external_id=$1]], { external_id })
            test.is_nil(read_err, tostring(read_err))
            test.eq(#retained, 1, "failed link delete must retain the count pointer")
            db:release()
            local repeated_cleanup = cleanup_conversation.cleanup_conversation({
                provider = "discord", external_id = external_id })
            test.is_true(repeated_cleanup.success, tostring(repeated_cleanup.error))
            db = assert(sql.get(DB))
            local retained_again, retained_err = db:query([[SELECT reply_uncertain,unappended
                FROM kickside_channel_cleanup_counts WHERE provider='discord' AND external_id=$1]], { external_id })
            test.is_nil(retained_err, tostring(retained_err))
            test.eq(#retained_again, 1, "later cleanup may not erase a linked owner's counts")
            local _, unblock_err = db:execute("DELETE FROM unlink_delete_blocker WHERE link_id=$1", { link_id })
            db:release()
            test.is_nil(unblock_err, tostring(unblock_err))

            local second, second_err, discarded = link_service.unlink("owner", "discord", external_id)
            test.is_true(second, tostring(second_err))
            test.is_nil(second_err)
            test.eq(discarded.reply_uncertain, 1)
            test.eq(discarded.unappended, 1)
            db = assert(sql.get(DB))
            local remaining, remaining_err = db:query([[SELECT provider FROM kickside_channel_cleanup_counts
                WHERE provider='discord' AND external_id=$1]], { external_id })
            db:release()
            test.is_nil(remaining_err, tostring(remaining_err))
            test.eq(#remaining, 0)
        end)

        test.it("deletes a counted page while a bridge acknowledges its append", function()
            fixture.truncate()
            local external_id, session_id, turn_id = "unlink-race-" .. uuid.v4(), uuid.v7(), uuid.v7()
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", external_id, session_id))
            test.is_nil(conversation.insert_turn(DB, { session_id = session_id },
                '{"session_id":"' .. session_id .. '"}', turn_id, 4194304))
            test.is_nil(conversation.begin_delete(DB, "discord", external_id))
            local db = assert(sql.get(DB))
            local dbtype = assert(db:type())
            local acknowledged = channel.new(1)
            local interleaved = false
            local proxy = {
                type = function() return db:type() end,
                begin = function(_, options)
                    local tx, err = db:begin(options)
                    if err or not tx then return nil, err end
                    return {
                        query = function(_, statement, args)
                            local rows, read_err = tx:query(statement, args)
                            if not read_err and not interleaved and statement:find("SELECT turn_id,reply_state", 1, true) then
                                interleaved = true
                                if dbtype == sql.type.POSTGRES then
                                    coroutine.spawn(function()
                                        local ok, ack_err = recovery.mark_appended(DB, turn_id)
                                        acknowledged:send({ ok = ok, err = ack_err })
                                    end)
                                    local outcome = acknowledged:receive()
                                    test.is_nil(outcome.err, tostring(outcome.err))
                                    test.is_true(outcome.ok)
                                end
                            end
                            return rows, read_err
                        end,
                        execute = function(_, statement, args) return tx:execute(statement, args) end,
                        commit = function() return tx:commit() end,
                        rollback = function() return tx:rollback() end,
                    }, nil
                end,
            }
            local result, err = gc.remove_on_db(proxy :: sql.DB, "discord", external_id, { session_id }, true)
            db:release()
            test.is_true(interleaved)
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq(result.discarded.unappended, 1)
            if dbtype == sql.type.SQLITE then
                local ok, ack_err = recovery.mark_appended(DB, turn_id)
                test.is_nil(ack_err, tostring(ack_err))
                test.is_true(ok)
            end
        end)

        test.it("fences turn bookkeeping owned through a conversation session pointer", function()
            fixture.truncate()
            local external_id, session_id, turn_id = "unlink-pointer-" .. uuid.v4(), uuid.v7(), uuid.v7()
            test.is_nil(persist.set(DB, "kickside_channel_sessions", "discord", external_id, session_id))
            local db = assert(sql.get(DB))
            local _, insert_err = db:execute([[INSERT INTO kickside_channel_turns
                (turn_id,route_json,accepted_at) VALUES ($1,$2,'2000-01-01T00:00:00Z')]],
                { turn_id, '{"session_id":"' .. session_id .. '"}' })
            test.is_nil(insert_err, tostring(insert_err))
            local _, remove_err = db:execute("DELETE FROM kickside_channel_session_owner WHERE session_id=$1", { session_id })
            db:release()
            test.is_nil(remove_err, tostring(remove_err))
            test.is_nil(conversation.begin_delete(DB, "discord", external_id))
            local marked, mark_err = recovery.mark_appended(DB, turn_id)
            test.is_nil(mark_err, tostring(mark_err))
            test.is_true(marked)
            db = assert(sql.get(DB))
            local rows, read_err = db:query("SELECT appended_at FROM kickside_channel_turns WHERE turn_id=$1", { turn_id })
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.is_nil(rows[1].appended_at)
            local result, err = persist.remove_conversation(DB, "discord", external_id, { session_id }, true)
            test.is_nil(err, tostring(err))
            test.eq(result.discarded.unappended, 1)
        end)

        test.it("keeps admissions fenced until Identity completes the unlink", function()
            fixture.truncate()
            local external_id = "unlink-fence-" .. uuid.v4()
            local cleanup = cleanup_conversation.cleanup_conversation({
                provider = "discord", external_id = external_id, retain_counts = true,
            })
            test.is_true(cleanup.success, tostring(cleanup.error))

            local db = assert(sql.get(DB))
            local dbtype = db:type()
            local tx = assert(db:begin())
            local reserved, reserve_err = conversation.claim_session_tx(tx, dbtype,
                "discord", external_id, uuid.v7())
            tx:rollback()
            db:release()
            test.is_nil(reserved)
            test.is_true(errors.is(reserve_err, errors.CONFLICT), tostring(reserve_err))

            local finalized = channel_cleanup_finalize.complete_unlink({
                provider = "discord", external_id = external_id,
            })
            test.is_true(finalized.success, tostring(finalized.error))
        end)
    end)
end)
