local test = require("test")
local sql = require("sql")
local channel = require("channel")
local time = require("time")
local uuid = require("uuid")
local supervisor = require("turn_supervisor")
local consts = require("channel_consts")
local turn_recovery = require("turn_recovery")

return { run = test.run_cases(function()
    test.describe("channel turn ownership across upgrade", function()
        test.it("fails retry scheduling when its durable deadline cannot be recorded", function()
            local id = uuid.v7()
            local ref = { owner_id = "channel.turn", record_id = id, generation = 1 }
            local original_db_id = consts.db_id
            local unavailable = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "persistence unavailable", details = { code = "retry_store" } })
            consts.db_id = function() return nil, unavailable end
            local owned = supervisor.new(function() end, function() end)
            local ok, failure = pcall(function() owned.schedule_retry(ref) end)
            consts.db_id = original_db_id

            test.is_false(ok)
            test.eq(failure:kind(), errors.UNAVAILABLE)
            test.is_true(failure:retryable())
            test.eq(failure:details().code, "retry_store")
            test.is_nil(owned.timer())
            test.is_nil(owned.snapshot().retry_due_by_turn[id])
        end)

        test.it("preserves an in-memory deadline when durable clearing fails", function()
            local id = uuid.v7()
            local ref = { owner_id = "channel.turn", record_id = id, generation = 1 }
            local original_db_id = consts.db_id
            local unavailable = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "persistence unavailable", details = { code = "retry_clear" } })
            consts.db_id = function() return nil, unavailable end
            local owned = supervisor.new(function() end, function() end, {
                retry_due_by_turn = { [id] = { turn_ref = ref, retry_at = time.now():unix() + 60, persisted = true } },
            })
            local ok, failure = pcall(function() owned.track(ref) end)
            consts.db_id = original_db_id

            test.is_false(ok)
            test.eq(failure:kind(), errors.UNAVAILABLE)
            test.is_true(failure:retryable())
            test.eq(failure:details().code, "retry_clear")
            test.not_nil(owned.snapshot().retry_due_by_turn[id])
        end)

        test.it("fails retry scheduling when its deadline write fails", function()
            local id = uuid.v7()
            local ref = { owner_id = "channel.turn", record_id = id, generation = 1 }
            local original_schedule = turn_recovery.schedule_retry
            local unavailable = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "deadline write unavailable", details = { code = "retry_write" } })
            turn_recovery.schedule_retry = function() return false, unavailable end
            local owned = supervisor.new(function() end, function() end)
            local ok, failure = pcall(function() owned.schedule_retry(ref) end)
            turn_recovery.schedule_retry = original_schedule

            test.is_false(ok)
            test.eq(failure:kind(), errors.UNAVAILABLE)
            test.is_true(failure:retryable())
            test.eq(failure:details().code, "retry_write")
            test.is_nil(owned.timer())
            test.is_nil(owned.snapshot().retry_due_by_turn[id])
        end)

        test.it("preserves an in-memory deadline when its clear write fails", function()
            local id = uuid.v7()
            local ref = { owner_id = "channel.turn", record_id = id, generation = 1 }
            local original_clear = turn_recovery.clear_retry
            local unavailable = errors.new({ kind = errors.UNAVAILABLE, retryable = true,
                message = "deadline clear unavailable", details = { code = "retry_clear_write" } })
            turn_recovery.clear_retry = function() return false, unavailable end
            local owned = supervisor.new(function() end, function() end, {
                retry_due_by_turn = { [id] = { turn_ref = ref, retry_at = time.now():unix() + 60, persisted = true } },
            })
            local ok, failure = pcall(function() owned.track(ref) end)
            turn_recovery.clear_retry = original_clear

            test.is_false(ok)
            test.eq(failure:kind(), errors.UNAVAILABLE)
            test.is_true(failure:retryable())
            test.eq(failure:details().code, "retry_clear_write")
            test.not_nil(owned.snapshot().retry_due_by_turn[id])
        end)

        test.it("fires an accepted turn's original retry deadline", function()
            local id = uuid.v7()
            local ref = { owner_id = "channel.turn", record_id = id, generation = 1 }
            local due = time.now():unix() + 2
            local db = assert(sql.get("app:db"))
            local _, insert_err = db:execute([[INSERT INTO kickside_channel_turns
                (turn_id,route_json,accepted_at) VALUES($1,$2,$3)]], {
                id, '{"key":"upgrade","inbound":{"external_message_id":"message"}}',
                time.now():utc():format_rfc3339(),
            })
            db:release()
            test.is_nil(insert_err)
            local delivered = {}
            local adopted = supervisor.new(function(turn_ref) delivered[#delivered + 1] = turn_ref end,
                function() end, {
                    retry_due_by_turn = { [id] = { turn_ref = ref, retry_at = due, persisted = false } },
                })
            local timer = adopted.timer()
            test.not_nil(timer)
            local selected = channel.select({ timer:case_receive(), time.after("5s"):case_receive() })
            test.eq(selected.channel, timer, "the original accepted-turn deadline fires")
            adopted.timer_fired(timer)
            test.eq(#delivered, 1)
            test.eq(delivered[1].record_id, id)
            test.is_nil(adopted.timer())
            local cleanup = assert(sql.get("app:db"))
            local _, delete_err = cleanup:execute("DELETE FROM kickside_channel_turns WHERE turn_id=$1", { id })
            cleanup:release()
            test.is_nil(delete_err)
        end)
    end)
end) }
