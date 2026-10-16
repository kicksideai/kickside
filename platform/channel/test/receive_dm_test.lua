local test = require("test")
local receive_module = require("receive")
local receive = receive_module
local test_state = require("test_state")
local execution_ref = require("execution_ref")
local real_dm_module = require("real_dm")
local real_dm = real_dm_module
local persist = require("persist")
local turn_recovery = require("turn_recovery")
local sql = require("sql")
local time = require("time")
local reply_sender_stub = require("reply_sender_stub")
local reply_admission = require("reply_admission")
local json = require("json")

local DB = "app:db"
local TABLE = "kickside_channel_sessions"
local HUB = "kickside.channel.session_hub"
local fixture = require("receive_fixture")
local truncate = fixture.truncate
local inbound = fixture.inbound
local sent_route = fixture.sent_route
local install_process_stub = fixture.install_process_stub
local seed_responder = fixture.seed_responder

local function define_tests()
    test.describe("channel receive DM and routing", function()
        test.it("keeps the inbound witness private to each constructed receiver", function()
            test.is_nil(receive_module._witness_inbound)
            test.is_nil(receive_module.new({})._witness_inbound)
        end)
        test.before_each(function()
            truncate()
            test_state.reset()
            receive = install_process_stub()
            real_dm = real_dm_module.new({ channel_receive = receive,
                trusted_ingress = function(_resource: string): boolean return true end })
            reply_sender_stub.reset()
        end)

        test.it("stores DM admission outside the route and rotates history on relink", function()
            local function dm_spec(link_id)
                return {
                    route_key = "discord:conn-1:chan-1",
                    session_provider = "discord",
                    session_subject = "ext-1",
                    admission = {
                        version = 2,
                        principal = { kind = "user", id = "linked-1" },
                        authorized_by = { kind = "user", id = "linked-1" },
                        link_id = link_id,
                        captured_at = "2026-09-26T00:00:00Z",
                    },
                    thread = { role = "dm" }, start = { agent_id = "agent-1" },
                    reply_sent_event = "sent", reply_failed_event = "failed",
                    trace_domain = "dm", trace_parts = {},
                }
            end
            local first = receive.route_turn(inbound(), dm_spec("link-1"))
            test.eq(first.status, "routed")
            local route = sent_route(1)
            test.is_nil(route.admission)
            test.is_nil(route.run_as)
            test.eq(route.execution_ref.owner_id, "channel.session")
            test.eq(route.execution_ref.record_id, first.session_id)
            local identity, err = execution_ref.load(route.execution_ref, "dm", route)
            test.is_nil(err)
            test.eq(identity.link_id, "link-1")

            local second = receive.route_turn(inbound(), dm_spec("link-2"))
            test.eq(second.status, "routed")
            test.is_true(second.session_id ~= first.session_id)
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            local archive, archive_err = db:query(
                "SELECT new_session_id, reason FROM kickside_channel_session_archives WHERE old_session_id = $1",
                { first.session_id })
            db:release()
            test.is_nil(archive_err)
            test.eq(archive[1].new_session_id, second.session_id)
            test.eq(archive[1].reason, "admission_changed")
            local next_route = sent_route(2)
            local next_identity, next_err = execution_ref.load(next_route.execution_ref, "dm", next_route)
            test.is_nil(next_err)
            test.eq(next_identity.link_id, "link-2")
            local old_identity, old_err = execution_ref.load(route.execution_ref, "dm", route)
            test.is_nil(old_err)
            test.eq(old_identity.link_id, "link-1")
        end)

        test.it("rejects a session mapping without admission", function()
            test.is_nil(persist.set(DB, TABLE, "discord", "ext-1", "unadmitted-session"))
            local result = real_dm.receive(inbound())
            test.eq(result.status, "error")
            test.eq(result.error, "conversation session admission is missing")
        end)

        test.it("routes the next DM turn into the admitted session /clear starts", function()
            local first = real_dm.receive(inbound({ external_message_id = "before-clear" }))
            test.eq(first.status, "routed", tostring(first.error))
            local cleared = real_dm.receive(inbound({ text = "/clear", external_message_id = "clear" }))
            test.eq(cleared.status, "cleared", tostring(cleared.error))
            test.is_true(cleared.session_id ~= first.session_id)
            local admission, admission_err = persist.get_admission(DB, cleared.session_id)
            test.is_nil(admission_err, tostring(admission_err))
            test.eq(admission.link_id, "link-1")
            local next_turn = real_dm.receive(inbound({ external_message_id = "after-clear" }))
            test.eq(next_turn.status, "routed", tostring(next_turn.error))
            test.eq(next_turn.session_id, cleared.session_id)
        end)

        test.it("routes a verified DM link through protected session admission", function()
            local result = real_dm.receive(inbound())
            test.eq(result.status, "routed")
            test.eq(result.user_id, "linked-1")
            local route = sent_route(1)
            test.eq(route.thread.impl_id, "kickside.dm:dm_kind")
            test.eq(route.execution_ref.owner_id, "channel.session")
            test.is_nil(route.run_as)
            local identity, err = execution_ref.load(route.execution_ref, "dm", route)
            test.is_nil(err)
            test.eq(identity.principal.id, "linked-1")
            test.eq(identity.link_id, "link-1")
        end)

        test.it("admits an unlinked DM notice with a transport-scoped reply proof", function()
            local result = real_dm.receive(inbound({ external_user_id = "unknown" }))
            test.eq(result.status, "unlinked")
            local calls = reply_sender_stub.calls()
            test.eq(#calls, 1)
            test.not_nil(calls[1].worker_config.reply_proof)
            test.eq(calls[1].worker_config.reply_proof.principal.kind, "transport")
            test.eq(calls[1].worker_config.reply_proof.external_conversation_id, "chan-1")
            local pending, pending_err = turn_recovery.list_unappended(DB)
            test.is_nil(pending_err)
            test.eq(#pending, 0)
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            local rows, read_err = db:query(
                "SELECT appended_at FROM kickside_channel_turns WHERE turn_id = $1",
                { calls[1].worker_config.reply_proof.turn_id })
            db:release()
            test.is_nil(read_err)
            test.not_nil(rows[1].appended_at)
        end)

        for _, provider in ipairs({ "slack", "telegram" }) do
            test.it("binds a " .. provider .. " DM notice to its admitted turn", function()
                local result = real_dm.receive(inbound({ provider = provider, external_user_id = "unknown" }))
                test.eq(result.status, "unlinked")
                local calls = reply_sender_stub.calls()
                test.eq(#calls, 1)
                local proof = calls[1].worker_config.reply_proof
                test.not_nil(proof)
                test.eq(proof.provider, provider)
                test.eq(proof.principal.id, provider .. ".gateway")
                local target = { provider = provider, connection_id = "conn-1",
                    external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                    reply_op = "send_reply", principal = { kind = "transport", id = provider .. ".gateway" } }
                local verified, verify_err = reply_admission.verify({ proof = proof, target = target })
                test.is_nil(verify_err)
                test.is_true(verified.verified)
                target.external_conversation_id = "wrong-room"
                local refused, refusal = reply_admission.verify({ proof = proof, target = target })
                test.is_nil(refused)
                test.is_true(errors.is(refusal, errors.PERMISSION_DENIED))
            end)
        end

        test.it("seals a Slack account-link notice before its reply", function()
            local result = real_dm.receive(inbound({ provider = "slack", text = "link valid-code" }))
            test.eq(result.status, "linked")
            local calls = reply_sender_stub.calls()
            test.eq(#calls, 1)
            local proof = calls[1].worker_config.reply_proof
            test.not_nil(proof)
            test.eq(proof.provider, "slack")
            test.eq(proof.principal.id, "slack.gateway")
            local target = { provider = "slack", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = { kind = "transport", id = "slack.gateway" } }
            local verified, verify_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(verify_err)
            test.is_true(verified.verified)
        end)

        test.it("seals a Telegram linked-user DM turn", function()
            local result = receive.route_turn(inbound({ provider = "telegram" }), {
                route_key = "telegram:conn-1:chan-1", session_provider = "telegram", session_subject = "ext-1",
                admission = { version = 2, principal = { kind = "user", id = "linked-1" },
                    authorized_by = { kind = "user", id = "linked-1" }, link_id = "link-1",
                    captured_at = "2026-09-27T00:00:00Z" },
                thread = { role = "dm" }, start = { agent_id = "agent-1" },
                reply_sent_event = "sent", reply_failed_event = "failed",
                trace_domain = "dm", trace_parts = {},
            })
            test.eq(result.status, "routed")
            local proof = sent_route(1).reply_proof
            test.not_nil(proof)
            test.eq(proof.provider, "telegram")
            local target = { provider = "telegram", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = { kind = "user", id = "linked-1" } }
            test.is_true(persist.matches_reply_proof(sent_route(1), proof, target))
            target.provider = "slack"
            test.is_false(persist.matches_reply_proof(sent_route(1), proof, target))
        end)

        test.it("accepts the canonical user_agent ref while checking the backing component id", function()
            test_state.add_responder("auto-1", {
                connection_id = "conn-1",
                channel_id = "chan-1",
                agent_id = "user_agent:agent-1",
            })
            test_state.add_component("agent-1", { title = "Agent One" })

            local result = receive.receive(inbound())

            test.eq(result.status, "routed")
            local route: any = sent_route(1)
            test.eq(route.start.agent_id, "user_agent:agent-1")
        end)

        test.it("does not route a paused responder", function()
            seed_responder({ paused = true })
            local result = receive.receive(inbound())
            test.eq(result.accepted, false)
            test.eq(result.status, "unrouted")
            test.eq(#test_state.state.sent, 0)
        end)

        test.it("is unrouted when no responder covers the channel", function()
            local result = receive.receive(inbound({ channel_id = "chan-unknown", reply_resource_id = "chan-unknown" }))
            test.eq(result.accepted, false)
            test.eq(result.status, "unrouted")
            test.eq(#test_state.state.sent, 0)
        end)

        test.it("returns a clear error when the routed agent no longer exists", function()
            seed_responder({ agent_exists = false })
            local result = receive.receive(inbound())
            test.eq(result.accepted, false)
            test.eq(result.status, "error")
            test.eq(type(result.error) == "string" and result.error:find("agent") ~= nil, true)
            test.eq(#test_state.state.sent, 0)
        end)

        test.it("witnesses a paused responder's inbound on the channel thread under the installer identity", function()
            seed_responder({ paused = true })
            local result = receive.receive(inbound({ text = "still logged" }))

            -- The turn does not route (paused), but the message is witnessed.
            test.eq(result.accepted, false)
            test.eq(result.status, "unrouted")
            test.eq(#test_state.state.sent, 0)

            local w = test_state.state.witness
            test.eq(#w, 2)
            test.eq(w[1].kind, "ensure_thread")
            test.eq(w[1].actor_id, "installer-1")
            test.is_true(w[1].has_scope)
            test.eq(w[1].opts.thread_class, "kickside.channel")
            test.eq(w[1].opts.impl_id, "kickside.channel:channel_kind")
            test.not_nil(test_state.state.witness_turn_ref)
            test.eq(w[2].kind, "append_inbound")
            test.eq(w[2].thread_id, "thread-witness-1")
            test.eq(w[2].opts.event_type, "kickside.channel.events:message.inbound")
            test.eq(w[2].inbound.text, "still logged")
            test.eq(w[2].actor_id, "installer-1")
        end)

        test.it("keeps a responder with no agent unrouted while recording its inbound", function()
            seed_responder()
            test_state.state.responders["auto-1"].state.agent_id = ""
            local result = receive.receive(inbound())
            test.eq(result.accepted, false)
            test.eq(result.status, "unrouted")
            test.eq(result.reason, "agent_missing")
            test.eq(#test_state.state.witness, 2)
            test.eq(#test_state.state.sent, 0)
        end)

        test.it("witnesses the inbound when the routed agent no longer exists", function()
            seed_responder({ agent_exists = false })
            local result = receive.receive(inbound())
            test.eq(result.status, "error")
            local w = test_state.state.witness
            test.eq(#w, 2)
            test.eq(w[2].kind, "append_inbound")
            test.eq(w[2].opts.event_type, "kickside.channel.events:message.inbound")
        end)

        test.it("skips the witness without crashing when the installer identity is unresolvable", function()
            -- The selected installer principal was deleted since install: execution_ref.resolve
            -- fails. The witness is a truthful logged skip -- receive still returns the
            -- routing outcome, never crashes, and never falls back to a system identity.
            seed_responder({ paused = true })
            test_state.state.witness_identity_err = "installer principal not found"
            local result = receive.receive(inbound({ text = "lost installer" }))
            test.eq(result.accepted, false)
            test.eq(result.status, "unrouted")
            -- No thread write happened: the witness stopped at identity resolution.
            test.eq(#test_state.state.witness, 0)
        end)

        test.it("skips the witness without crashing when the witness thread write fails", function()
            -- A persistent witness failure (ensure_thread errors) must not crash receive
            -- or change the routing result; the ingress logs and moves on (best-effort).
            seed_responder({ paused = true })
            test_state.state.witness_ensure_err = "threads upsert unavailable"
            local result = receive.receive(inbound({ text = "witness write down" }))
            test.eq(result.accepted, false)
            test.eq(result.status, "unrouted")
            -- ensure_thread was attempted (and failed); no append followed it.
            test.eq(#test_state.state.witness, 1)
            test.eq(test_state.state.witness[1].kind, "ensure_thread")
        end)

        test.it("does not witness an active routed turn at ingress -- the bridge owns that append", function()
            seed_responder()
            local result = receive.receive(inbound())
            test.eq(result.status, "routed")
            test.eq(#test_state.state.witness, 0)
        end)

        test.it("does not witness an unrouted channel with no responder -- no owner identity exists", function()
            local result = receive.receive(inbound({ channel_id = "chan-unknown", reply_resource_id = "chan-unknown" }))
            test.eq(result.status, "unrouted")
            test.eq(#test_state.state.witness, 0)
        end)

        test.it("carries the responder-configured system_prompt into the session start", function()
            seed_responder({ system_prompt = "Reply only in haiku." })
            local result = receive.receive(inbound())
            test.eq(result.status, "routed")
            local route: any = sent_route(1)
            test.eq(route.start.system_prompt, "Reply only in haiku.")
        end)

        test.it("carries the responder response_policy into the session start", function()
            seed_responder({
                response_policy = {
                    mode = "lazy",
                    wait_seconds = 15,
                    assessor_model = "class:smart",
                    prompt = "Ignore casual channel noise.",
                },
            })
            local result = receive.receive(inbound())
            test.eq(result.status, "routed")
            local route: any = sent_route(1)
            test.eq(route.start.response_policy.mode, "lazy")
            test.eq(route.start.response_policy.wait_seconds, 15)
            test.eq(route.start.response_policy.assessor_model, "class:smart")
            test.eq(route.start.response_policy.prompt, "Ignore casual channel noise.")
        end)

        test.it("rotates the routed chat session after configured idle age", function()
            seed_responder({
                session_policy = { rotate_after_idle = true, idle_seconds = 2 * 60 * 60, runtime_idle_seconds = 15 * 60 },
            })
            local first = receive.receive(inbound({ external_message_id = "msg-1" }))
            test.eq(first.status, "routed")
            local first_id = first.session_id

            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            if not db then error("missing test db") end
            local old = time.now():utc():add(-3 * time.HOUR):format_rfc3339()
            db:execute(
                "UPDATE " .. TABLE .. " SET updated_at = $1 WHERE provider = $2 AND external_id = $3",
                { old, "discord", "chan-1" })
            db:release()

            local second = receive.receive(inbound({ external_message_id = "msg-2" }))
            test.eq(second.status, "routed")
            test.is_true(type(second.session_id) == "string" and second.session_id ~= first_id)
            local route: any = sent_route(2)
            test.eq(route.session_id, second.session_id)
            test.eq(route.start.session_policy.rotate_after_idle, true)
            test.eq(route.start.session_policy.idle_seconds, 7200)
            test.eq(route.start.session_policy.runtime_idle_seconds, 900)
        end)

        test.it("applies the default idle rotation policy when session_policy is omitted", function()
            seed_responder()
            local first = receive.receive(inbound({ external_message_id = "msg-1" }))
            test.eq(first.status, "routed")
            local first_id = first.session_id

            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            if not db then error("missing test db") end
            local old = time.now():utc():add(-3 * time.HOUR):format_rfc3339()
            db:execute(
                "UPDATE " .. TABLE .. " SET updated_at = $1 WHERE provider = $2 AND external_id = $3",
                { old, "discord", "chan-1" })
            db:release()

            local second = receive.receive(inbound({ external_message_id = "msg-2" }))
            test.eq(second.status, "routed")
            test.is_true(type(second.session_id) == "string" and second.session_id ~= first_id)
            local route: any = sent_route(2)
            test.eq(route.start.session_policy.rotate_after_idle, true)
            test.eq(route.start.session_policy.idle_seconds, 7200)
            test.eq(route.start.session_policy.runtime_idle_seconds, 600)
        end)

        test.it("does not rotate when the responder explicitly disables idle rotation", function()
            seed_responder({
                session_policy = { rotate_after_idle = false, runtime_idle_seconds = 600 },
            })
            local first = receive.receive(inbound({ external_message_id = "msg-1" }))
            test.eq(first.status, "routed")

            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            if not db then error("missing test db") end
            local old = time.now():utc():add(-3 * time.HOUR):format_rfc3339()
            db:execute(
                "UPDATE " .. TABLE .. " SET updated_at = $1 WHERE provider = $2 AND external_id = $3",
                { old, "discord", "chan-1" })
            db:release()

            local second = receive.receive(inbound({ external_message_id = "msg-2" }))
            test.eq(second.status, "routed")
            test.eq(second.session_id, first.session_id)
        end)

        test.it("does not hardcode a transport system_prompt when the responder sets none", function()
            seed_responder({ system_prompt = nil })
            local result = receive.receive(inbound())
            test.eq(result.status, "routed")
            local route: any = sent_route(1)
            test.eq(route.start.system_prompt, "")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
