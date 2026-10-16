-- Channel conversations are bounded by age expiry alone: ingress and session
-- rotation keep being admitted past any former per-conversation count, owner
-- delete fences new ingress, and one oversized route is refused before the
-- hub effect.
local test = require("test")
local receive_fixture = require("receive_fixture")
local policy = require("retention_policy_stub")
local test_state = require("test_state")
local trace_context_stub = require("trace_context_stub")
local reply_sender_stub = require("reply_sender_stub")
local session_service_stub = require("session_service_stub")
local cleanup_conversation = require("cleanup_conversation")
local persist = require("persist")
local turn_recovery = require("turn_recovery")
local turn_retention = require("channel_retention")
local tick = require("channel_retention_tick")
local channel = require("channel")
local sql = require("sql")
local time = require("time")
local conversation = require("channel_conversation")

local DB = "app:db"
local FORMER_TURNS_PER_CONVERSATION = 100000
local FORMER_SESSIONS_PER_CONVERSATION = 1000
local receive
local inbound = receive_fixture.inbound
local seed_responder = receive_fixture.seed_responder
local install_process_stub = receive_fixture.install_process_stub

local function count(statement: string): integer
    local db = assert(sql.get(DB))
    local rows = assert(db:query(statement))
    db:release()
    return math.floor(tonumber(rows[1].n) :: number)
end

local function define_tests()
    test.describe("channel conversations bounded by age expiry", function()
        test.before_each(function()
            receive_fixture.truncate()
            policy.row_bytes = 4194304
            test_state.reset()
            trace_context_stub.reset()
            receive = install_process_stub()
            reply_sender_stub.reset()
            session_service_stub.delete_error = nil
            session_service_stub.delete_result = nil
            session_service_stub.deleted = {}
        end)

        test.it("routes turns for a conversation holding more turns than any former per-conversation count", function()
            seed_responder()
            local first = receive.receive(inbound({ external_message_id = "first" }))
            test.eq(first.status, "routed")
            local db = assert(sql.get(DB))
            local seeded, seed_err = db:execute([[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<]]
                .. tostring(FORMER_TURNS_PER_CONVERSATION) .. [[)
                INSERT INTO kickside_channel_turns (turn_id,route_json,accepted_at,owner_provider,owner_external_id)
                SELECT 'seed-' || CAST(x AS TEXT),'{}',$1,'discord','chan-1' FROM n]],
                { time.now():utc():format_rfc3339() })
            db:release()
            test.is_nil(seed_err)
            test.eq(tonumber(seeded.rows_affected), FORMER_TURNS_PER_CONVERSATION)
            local next_turn = receive.receive(inbound({ external_message_id = "past" }))
            test.eq(next_turn.status, "routed")
            test.eq(#test_state.state.sent, 2)
            test.eq(count([[SELECT COUNT(*) AS n FROM kickside_channel_turns
                WHERE owner_provider='discord' AND owner_external_id='chan-1']]), FORMER_TURNS_PER_CONVERSATION + 2)
            local status = tick.run()
            test.is_true(status.success, tostring(status.error))
            test.eq(status.status, "ready")
        end)

        test.it("rotates sessions for a conversation holding more sessions than any former per-conversation count", function()
            seed_responder()
            local first = receive.receive(inbound({ external_message_id = "first" }))
            test.eq(first.status, "routed")
            local db = assert(sql.get(DB))
            local seeded, seed_err = db:execute([[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<]]
                .. tostring(FORMER_SESSIONS_PER_CONVERSATION) .. [[)
                INSERT INTO kickside_channel_session_owner (session_id,provider,external_id)
                SELECT 'seed-' || CAST(x AS TEXT),'discord','chan-1' FROM n]])
            db:release()
            test.is_nil(seed_err)
            test.eq(tonumber(seeded.rows_affected), FORMER_SESSIONS_PER_CONVERSATION)
            local next_id, rotate_err = persist.rotate_with_archive(DB, "kickside_channel_sessions",
                "discord", "chan-1", first.session_id, "past")
            test.is_nil(rotate_err, tostring(rotate_err))
            test.not_nil(next_id)
            test.eq(count([[SELECT COUNT(*) AS n FROM kickside_channel_session_owner
                WHERE provider='discord' AND external_id='chan-1']]), FORMER_SESSIONS_PER_CONVERSATION + 2)
        end)

        test.it("routes concurrent ingress of an admitted conversation", function()
            seed_responder()
            test.eq(receive.receive(inbound({ external_message_id = "admit" })).status, "routed")
            local outcomes = channel.new(2)
            for i = 1, 2 do
                coroutine.spawn(function()
                    outcomes:send(receive.receive(inbound({ external_message_id = "race-" .. i })))
                end)
            end
            local first, second = outcomes:receive(), outcomes:receive()
            test.eq(first.status, "routed", tostring(first.error))
            test.eq(second.status, "routed", tostring(second.error))
            test.eq(#test_state.state.sent, 3)
        end)

        test.it("keeps ingress and rotation consistent under one conversation owner row", function()
            seed_responder()
            local first = receive.receive(inbound({ external_message_id = "first" }))
            test.eq(first.status, "routed")
            local ready, start, outcomes = channel.new(2), channel.new(2), channel.new(2)
            coroutine.spawn(function()
                ready:send(true)
                start:receive()
                outcomes:send({ ingress = receive.receive(inbound({ external_message_id = "race" })) })
            end)
            coroutine.spawn(function()
                ready:send(true)
                start:receive()
                local next_id, err = persist.rotate_with_archive(DB, "kickside_channel_sessions",
                    "discord", "chan-1", first.session_id, "race")
                outcomes:send({ rotated = next_id, err = err })
            end)
            ready:receive(); ready:receive()
            start:send(true); start:send(true)
            local a, b = outcomes:receive(), outcomes:receive()
            local rotation = a.ingress and b or a
            test.not_nil(rotation.rotated, tostring(rotation.err))
            test.eq(count([[SELECT COUNT(*) AS n FROM kickside_channel_session_owner
                WHERE provider='discord' AND external_id='chan-1']]), 2)
        end)

        test.it("prunes settled turns past the window and keeps uncertain replies", function()
            seed_responder()
            test.eq(receive.receive(inbound({ external_message_id = "settled" })).status, "routed")
            test.eq(receive.receive(inbound({ external_message_id = "uncertain" })).status, "routed")
            local settled_id = test_state.state.sent[1].payload.turn_ref.record_id
            local uncertain_id = test_state.state.sent[2].payload.turn_ref.record_id
            local marked, mark_err = turn_recovery.mark_appended(DB, settled_id)
            test.is_nil(mark_err)
            test.is_true(marked)
            local db = assert(sql.get(DB))
            local old = time.now():utc():add(-72 * time.HOUR):format_rfc3339()
            local _, age_err = db:execute("UPDATE kickside_channel_turns SET accepted_at=$1 WHERE turn_id=$2",
                { old, settled_id })
            test.is_nil(age_err)
            local _, uncertain_err = db:execute([[UPDATE kickside_channel_turns
                SET accepted_at=$1,appended_at=$1,reply_state='reserved' WHERE turn_id=$2]], { old, uncertain_id })
            db:release()
            test.is_nil(uncertain_err)
            local cutoff = time.now():utc():add(-48 * time.HOUR):format_rfc3339()
            local deleted, prune_err = turn_retention.prune_settled(DB, cutoff, 10)
            test.is_nil(prune_err)
            test.eq(deleted, 1)
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_channel_turns WHERE turn_id='" .. settled_id .. "'"), 0)
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_channel_turns WHERE turn_id='" .. uncertain_id .. "'"), 1)
        end)

        test.it("fences new ingress while a failed owner delete is pending and clears it once finished", function()
            seed_responder()
            test.eq(receive.receive(inbound({ external_message_id = "first" })).status, "routed")
            session_service_stub.delete_result = { deleted = true, primary_context_deleted = false }
            local failed = cleanup_conversation.cleanup_conversation({
                provider = "discord", external_id = "chan-1" })
            test.is_false(failed.success)
            local db = assert(sql.get(DB))
            local rows = assert(db:query([[SELECT deleting,delete_requested_at
                FROM kickside_channel_conversation WHERE provider='discord' AND external_id='chan-1']]))
            db:release()
            test.eq(tonumber(rows[1].deleting), 1)
            test.not_nil(rows[1].delete_requested_at)
            test.eq(receive.receive(inbound({ external_message_id = "late" })).status,
                "blocked_source_deleted")
            local pending = tick.run()
            test.is_true(pending.success, tostring(pending.error))
            test.eq(pending.status, "blocked_source_deleted")
            test.eq(pending.blocked[1].scope, "discord:chan-1")
            session_service_stub.delete_result = nil
            local finished = cleanup_conversation.cleanup_conversation({
                provider = "discord", external_id = "chan-1" })
            test.is_true(finished.success, tostring(finished.error))
            test.eq(count([[SELECT COUNT(*) AS n FROM kickside_channel_conversation
                WHERE provider='discord' AND external_id='chan-1']]), 0)
            local status = tick.run()
            test.is_true(status.success, tostring(status.error))
            test.eq(status.status, "ready")
        end)

        test.it("does not admit a turn after owner deletion completes behind its owner read", function()
            local session_id, _, create_err = persist.get_or_create(DB,
                "kickside_channel_sessions", "discord", "delete-race")
            test.is_nil(create_err)
            if not session_id then error("missing session identity") end
            local db = assert(sql.get(DB))
            local owner, owner_err = conversation.owner_for_session_tx(db, session_id)
            db:release()
            test.is_nil(owner_err)
            test.eq(owner.external_id, "delete-race") -- admission observed its former owner
            local deleted = cleanup_conversation.cleanup_conversation({
                provider = "discord", external_id = "delete-race" })
            local admission_err = conversation.insert_turn_for_owner(DB,
                { session_id = session_id, thread = { role = "direct" } },
                "{}", "delete-race-turn", 4194304, owner)
            test.is_true(deleted.success, tostring(deleted.error))
            test.is_true(errors.is(admission_err, errors.INTERNAL), tostring(admission_err))
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_channel_turns WHERE turn_id='delete-race-turn'"), 0)
        end)

        test.it("refuses an oversized accepted route before the hub effect", function()
            policy.row_bytes = 2048
            seed_responder()
            local result = receive.receive(inbound({ text = string.rep("x", 4096) }))
            test.is_false(result.accepted)
            test.eq(result.status, "row_too_large", tostring(result.error))
            test.eq(result.scope, "discord:chan-1")
            test.eq(result.cap, 2048)
            test.is_true(result.used > 2048)
            test.eq(result.operation, "turn_row")
            test.eq(#test_state.state.sent, 0)
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_channel_turns"), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
