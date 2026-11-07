local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
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
