local test = require("test")
local receive_module = require("receive")
local receive = receive_module
local test_state = require("test_state")
local execution_ref = require("execution_ref")
local real_dm = require("real_dm")
local persist = require("persist")
local turn_recovery = require("turn_recovery")
local sql = require("sql")
local time = require("time")
local reply_sender_stub = require("reply_sender_stub")
local reply_admission = require("reply_admission")
local json = require("json")
local cleanup_conversation = require("cleanup_conversation")
local conversation = require("channel_conversation")
local session_service_stub = require("session_service_stub")
local policy = require("retention_policy_stub")
local publication = require("publication")
local threads_capture = require("threads_capture_stub")
local trace_context_stub = require("trace_context_stub")

local DB = "app:db"
local TABLE = "kickside_channel_sessions"
local fixture = require("receive_fixture")
local truncate = fixture.truncate
local inbound = fixture.inbound
local sent_route = fixture.sent_route
local install_process_stub = fixture.install_process_stub
local seed_responder = fixture.seed_responder

local function define_tests()
    test.describe("responder owner health", function()
        test.before_each(function() test_state.reset(); fixture.truncate() end)
        test.it("ignores an unbound channel without any component write", function()
            local result = fixture.install_process_stub().receive(fixture.inbound())
            test.eq(result.status, "unrouted")
            test.eq(result.reason, "channel_unrouted")
            test.is_nil(result.health_reported)
            test.eq(#test_state.state.set_meta_calls, 0)
        end)
        test.it("returns a failed routing lookup without writing connection health", function()
            test_state.state.component_list_error = "component database unavailable"
            local result = fixture.install_process_stub().receive(fixture.inbound())
            test.eq(result.status, "error")
            test.eq(result.reason, "routing_lookup_failed")
            test.eq(#test_state.state.set_meta_calls, 0)
        end)
        test.it("publishes a typed disabled reason when a paused responder declines a mention", function()
            fixture.seed_responder({ paused = true })
            local result = fixture.install_process_stub().receive(fixture.inbound())
            test.eq(result.reason, "responder_disabled")
            local updates = test_state.state.set_meta_calls
            test.not_nil(updates[1])
            test.eq(updates[1].component_id, "auto-1")
            test.eq(updates[1].fields.health_reason, "responder_disabled")
        end)
        test.it("uses the live main drive over the stored pause flag", function()
            fixture.seed_responder({})
            local record = test_state.state.responders["auto-1"]
            record.drive_status = { drives = { { drive_key = "main", enabled = false, phase = "paused" } } }
            local paused = fixture.install_process_stub().receive(fixture.inbound())
            test.eq(paused.reason, "responder_disabled")
            test.eq(#test_state.state.sent, 0)
            record.state.paused = true
            record.drive_status.drives[1] = { drive_key = "main", enabled = true, phase = "active" }
            local resumed = fixture.install_process_stub().receive(fixture.inbound({ external_message_id = "msg-2" }))
            test.eq(resumed.status, "routed")
        end)
        test.it("publishes a typed admission error when the hub is unavailable", function()
            fixture.seed_responder({})
            test_state.state.send_error = "hub unavailable"
            local result = fixture.install_process_stub().receive(fixture.inbound())
            test.eq(result.reason, "turn_admission_failed")
            local updates = test_state.state.set_meta_calls
            test.not_nil(updates[1])
            test.eq(updates[1].fields.health_reason, "turn_admission_failed")
        end)
    end)
    test.describe("channel receive", function()
        test.before_each(function()
            truncate()
            policy.row_bytes = 4194304
            test_state.reset()
            trace_context_stub.reset()
            receive = install_process_stub()
            reply_sender_stub.reset()
            session_service_stub.delete_error = nil
            session_service_stub.delete_result = nil
            session_service_stub.deleted = {}
        end)

        test.it("propagates native trace failures before routing a turn", function()
            for _, options in ipairs({
                { domain = "", inbound = inbound(), code = "correlation_kind_required" },
                { domain = "channel", inbound = inbound({ trace_context = { run_id = "only-run" } }),
                    code = "trace_context_trace_id_required" },
            }) do
                local context, err = receive.trace_for_turn(options.inbound, options.domain, {})
                test.is_nil(context)
                test.is_true(errors.is(err, errors.INVALID))
                test.is_false(err:retryable())
                test.eq(err:details().code, options.code)
                test.eq(#test_state.state.sent, 0)
            end
        end)

        test.it("normalizes publication failures without losing their kind or cause", function()
            local plain = publication.response(nil, "writer refuses")
            test.eq(plain.error, "writer refuses")
            test.eq(plain.kind, errors.INTERNAL)
            local typed = publication.response(nil, errors.new({ message = "target revoked", kind = errors.PERMISSION_DENIED,
                retryable = false, details = { code = "target_revoked" } }))
            test.eq(typed.kind, errors.PERMISSION_DENIED)
            test.eq(typed.details.code, "target_revoked")
            test.is_true(typed.error:find("target revoked", 1, true) ~= nil)
        end)

        test.it("serializes receipt validation failures with the existing error field and native metadata", function()
            fixture.seed_responder({})
            test_state.state.responders["auto-1"].execution_identity.version = 1
            local result = receive.route_turn(inbound(), {
                execution_ref = { owner_id = "automation.component", record_id = "auto-1", generation = 0 },
            } :: any)
            test.is_false(result.accepted)
            test.eq(result.status, "error")
            test.eq(type(result.error), "string")
            test.eq(result.error, "unsupported execution identity version")
            test.eq(result.kind, errors.INVALID)
            test.is_false(result.retryable)
            test.eq(result.details.code, "declaration")
            local encoded, encode_err = json.encode(result)
            test.is_nil(encode_err)
            local decoded, decode_err = json.decode(encoded)
            test.is_nil(decode_err)
            test.eq(decoded.error, result.error)
            test.eq(decoded.kind, result.kind)
            test.eq(decoded.details.code, result.details.code)
            test.eq(#test_state.state.sent, 0)
        end)

        test.it("recovers declined-message witnesses without starting an agent turn", function()
            fixture.seed_responder({ paused = true })
            local result = receive.receive(inbound())
            test.eq(result.reason, "responder_disabled")
            local turn_ref = test_state.state.witness_turn_ref
            local route, load_err = execution_ref.load_turn(turn_ref)
            test.is_nil(load_err)
            threads_capture.reset()
            threads_capture.thread = { id = "thread-witness-1", thread_class = route.thread.class,
                attrs = { external_ref = route.key } }
            local recorded, record_err = publication.witness(turn_ref)
            test.is_nil(record_err, tostring(record_err))
            test.is_true(recorded)
            test.eq(#threads_capture.appended, 1)
            test.eq(#test_state.state.sent, 0)
            local frame = assert(execution_ref.resolve(route.execution_ref, route.thread.role, route))
            test.eq(threads_capture.reader_actor:id(), frame.actor:id())
            test.eq(threads_capture.reader_scope.id, frame.scope.id)
            test.eq(threads_capture.appended[1].actor:id(), frame.actor:id())
            test.is_nil(threads_capture.appended[1].scope)
            local denied, denied_err = publication.write(route.key, turn_ref, "emit", { component_id = "auto-1" })
            test.is_nil(denied)
            test.is_true(errors.is(denied_err, errors.PERMISSION_DENIED))
        end)

        test.it("publishes only for its admitted bridge, current principal, and conversation", function()
            seed_responder()
            local routed = receive.receive(inbound())
            test.eq(routed.status, "routed")
            local turn_ref = test_state.state.sent[1].payload.turn_ref
            local route, load_err = execution_ref.load_turn(turn_ref)
            test.is_nil(load_err)
            threads_capture.reset()
            threads_capture.thread = { id = "conversation-1", thread_class = route.thread.class,
                attrs = { external_ref = route.key } }
            local descriptor = { pid = "admitted", session_id = route.session_id, component_id = "auto-1", token = "bridge-token" }
            local request = { key = route.key, turn_ref = turn_ref, method = "append_event", bridge_token = "bridge-token",
                args = { thread_id = "conversation-1", event = { type = route.thread.inbound_event, body = {} } } }
            local malformed, malformed_err = publication.publish(descriptor,
                { key = route.key, turn_ref = turn_ref, method = "emit", bridge_token = "bridge-token" }, "admitted")
            test.is_nil(malformed)
            test.is_true(errors.is(malformed_err, errors.PERMISSION_DENIED))
            local published, publish_err = publication.publish(descriptor, request, "admitted")
            test.is_nil(publish_err, tostring(publish_err))
            test.eq(published.inserted, 1)
            local forged, forged_err = publication.publish(descriptor, request, "stranger")
            test.is_nil(forged)
            test.is_true(errors.is(forged_err, errors.PERMISSION_DENIED))
            local guessed = { key = request.key, turn_ref = request.turn_ref, method = request.method,
                args = request.args, bridge_token = "guessed-token" }
            local claimed, claimed_err = publication.publish(descriptor, guessed, "admitted")
            test.is_nil(claimed)
            test.is_true(errors.is(claimed_err, errors.PERMISSION_DENIED))
            local foreign = { pid = "admitted", session_id = "another-session", component_id = "auto-1", token = "bridge-token" }
            local crossed, crossed_err = publication.publish(foreign, request, "admitted")
            test.is_nil(crossed)
            test.is_true(errors.is(crossed_err, errors.PERMISSION_DENIED))
            local other_responder = { pid = "admitted", session_id = route.session_id, component_id = "auto-2", token = "bridge-token" }
            local emitted, emit_err = publication.publish(other_responder,
                { key = route.key, turn_ref = turn_ref, method = "emit", bridge_token = "bridge-token",
                  args = { component_id = "auto-1" } }, "admitted")
            test.is_nil(emitted)
            test.is_true(errors.is(emit_err, errors.PERMISSION_DENIED))
            threads_capture.thread.attrs.external_ref = "another conversation"
            local moved, moved_err = publication.publish(descriptor, request, "admitted")
            test.is_nil(moved)
            test.is_true(errors.is(moved_err, errors.PERMISSION_DENIED))
            threads_capture.thread.attrs.external_ref = route.key
            test_state.state.connection_write_denied = true
            local revoked, revoke_err = publication.publish(descriptor, request, "admitted")
            test.is_nil(revoked)
            test.is_true(errors.is(revoke_err, errors.PERMISSION_DENIED))
            test.eq(#threads_capture.appended, 1)
            test_state.state.connection_write_denied = nil
            local routed_write, routed_write_err = publication.write(route.key, turn_ref, "append_event", request.args)
            test.is_nil(routed_write)
            test.is_true(errors.is(routed_write_err, errors.PERMISSION_DENIED))
        end)

        test.it("routes a channel turn via the indexed responder lookup", function()
            seed_responder()
            local result = receive.receive(inbound())

            test.eq(result.status, "routed")
            test.eq(result.session_id ~= nil, true)
            test.eq(#test_state.state.sent, 1)

            local sent = (test_state.state.sent[1] or { payload = {} }) :: any
            test.eq(sent.payload.kind, "turn")
            test.eq(sent.payload.turn_ref.owner_id, "channel.turn")
            local pending, pending_err = turn_recovery.list_unappended(DB)
            test.is_nil(pending_err)
            test.eq(#pending, 1)
            test.eq(pending[1].turn_id, sent.payload.turn_ref.record_id)
            local retry_at = time.now():unix() + 60
            local scheduled, schedule_err = turn_recovery.schedule_retry(DB, pending[1].turn_id, retry_at)
            test.is_nil(schedule_err, tostring(schedule_err))
            test.is_true(scheduled)
            local retry_rows, retry_read_err = turn_recovery.list_unappended(DB)
            test.is_nil(retry_read_err, tostring(retry_read_err))
            test.eq(retry_rows[1].retry_at, retry_at)
            local admitted, admit_err = execution_ref.load_turn(sent.payload.turn_ref)
            test.is_nil(admit_err)
            test.eq(admitted.execution_ref.owner_id, "automation.component")

            local route: any = sent_route(1)
            test.eq(route.key, "discord:conn-1:chan-1")
            test.eq(route.session_provider, "discord")
            test.eq(route.execution_ref.owner_id, "automation.component")
            test.eq(route.execution_ref.record_id, "auto-1")
            test.eq(route.execution_ref.generation, 0)
            test.is_nil(route.run_as)
            test.not_nil(route.reply_proof)
            test.eq(route.reply_proof.provider, "discord")
            test.eq(route.reply_proof.connection_id, "conn-1")
            test.eq(route.reply_proof.external_conversation_id, "chan-1")
            test.eq(route.reply_proof.inbound_message_id, "msg-1")
            test.eq(route.reply_proof.reply_op, "send_reply")
            test.eq(route.reply_proof.principal.id, "installer-1")
            test.eq(route.start.agent_id, "agent-1")
            test.eq(route.start.session_kind, "CHANNEL")
            test.eq(route.thread.class, "kickside.channel")
            test.eq(route.thread.impl_id, "kickside.channel:channel_kind")
            test.eq(route.thread.inbound_event, "kickside.channel.events:message.inbound")
            test.eq(route.reply.component_id, "conn-1")
            test.eq(route.inbound.text, "hello")
            test.eq(route.inbound.trace_context.trace_id, "trace-1")
            test.eq(route.inbound.trace_context.correlation_key, "channel:discord:conn-1:chan-1:message:msg-1")
            route.execution_ref.owner_id = "mcp.credential"
            local reloaded, reload_err = execution_ref.load_turn(sent.payload.turn_ref)
            test.is_nil(reload_err)
            test.eq(reloaded.execution_ref.owner_id, "automation.component")
            local marked, mark_err = turn_recovery.mark_appended(DB, sent.payload.turn_ref.record_id)
            test.is_nil(mark_err)
            test.is_true(marked)
            local remaining, remaining_err = turn_recovery.list_unappended(DB)
            test.is_nil(remaining_err)
            test.eq(#remaining, 0)
        end)

        test.it("refuses a user supplied envelope at the provider receive seam", function()
            seed_responder()
            local untrusted = receive_module.new({
                hub = {
                    send = function(payload)
                        table.insert(test_state.state.sent, { payload = payload })
                        return true, nil
                    end,
                },
                trusted_ingress = function(_resource: string): boolean return false end,
            })

            local result = untrusted.receive(inbound({ external_message_id = "forged-user-turn" }))
            test.is_false(result.accepted)
            test.eq(result.status, "error")
            test.eq(#test_state.state.sent, 0)
        end)

        test.it("rejects a turn without a provider message id before admission", function()
            seed_responder()
            local result = receive.receive(inbound({ external_message_id = "" }))
            test.is_false(result.accepted)
            test.eq(result.status, "error")
            test.eq(#test_state.state.sent, 0)
        end)

        for _, provider in ipairs({ "slack", "telegram" }) do
            test.it("seals an admitted " .. provider .. " channel reply", function()
                seed_responder()
                local result = receive.receive(inbound({ provider = provider }))
                test.eq(result.status, "routed")
                local route = sent_route(1)
                local proof = route.reply_proof
                test.not_nil(proof)
                test.eq(proof.provider, provider)
                test.eq(proof.connection_id, "conn-1")
                test.eq(proof.external_conversation_id, "chan-1")
                test.eq(proof.inbound_message_id, "msg-1")
                local target = { provider = provider, connection_id = "conn-1",
                    external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                    reply_op = "send_reply", principal = { kind = "user", id = "installer-1" } }
                local admitted, verify_err = reply_admission.verify({ proof = proof, target = target })
                test.is_nil(verify_err)
                test.is_true(admitted.verified)
                target.external_conversation_id = "wrong-room"
                local refused, refusal = reply_admission.verify({ proof = proof, target = target })
                test.is_nil(refused)
                test.is_true(errors.is(refusal, errors.PERMISSION_DENIED))
                target.external_conversation_id = "chan-1"
                target.provider = provider == "slack" and "telegram" or "slack"
                local wrong_provider, provider_err = reply_admission.verify({ proof = proof, target = target })
                test.is_nil(wrong_provider)
                test.is_true(errors.is(provider_err, errors.PERMISSION_DENIED))
                target.provider = provider
                local reserved, reserve_err = reply_admission.reserve({ proof = proof, target = target, content = "reply" })
                test.is_nil(reserve_err)
                test.is_true(reserved.send)
                local saved, complete_err = reply_admission.complete({ proof = proof,
                    content = "reply", message_ref = "sent-1" })
                test.is_nil(complete_err)
                test.is_true(saved.saved)
                local replay, replay_err = reply_admission.reserve({ proof = proof, target = target, content = "reply" })
                test.is_nil(replay_err)
                test.is_false(replay.send)
                test.eq(replay.message_ref, "sent-1")
            end)
        end

        test.it("fences append acknowledgements, retry deadlines and reply writes during owner delete", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = { kind = "user", id = "installer-1" } }
            test.eq(receive.receive(inbound({ external_message_id = "msg-2" })).status, "routed")
            local reserved = sent_route(2)
            test.is_true(persist.reserve_reply(DB, reserved.reply_proof, reserved.reply_proof, "reply").send)
            local scheduled, schedule_err = turn_recovery.schedule_retry(DB, proof.turn_id, 123)
            test.is_nil(schedule_err)
            test.is_true(scheduled)
            test.is_nil(conversation.begin_delete(DB, "discord", "chan-1"))

            local cleared, clear_err = turn_recovery.clear_retry(DB, proof.turn_id)
            test.is_nil(clear_err)
            test.is_false(cleared)
            local rescheduled, reschedule_err = turn_recovery.schedule_retry(DB, proof.turn_id, 456)
            test.is_nil(reschedule_err)
            test.is_false(rescheduled)
            local marked, mark_err = turn_recovery.mark_appended(DB, proof.turn_id)
            test.is_nil(mark_err)
            test.is_true(marked)
            local reply, reply_err = persist.reserve_reply(DB, proof, target, "reply")
            test.is_nil(reply_err)
            test.is_false(reply.send)
            local saved, save_err = persist.complete_reply(DB, reserved.reply_proof, "reply", "out-1")
            test.is_nil(save_err)
            test.is_false(saved)
            local db = assert(sql.get(DB))
            local rows, read_err = db:query([[SELECT appended_at,retry_at,reply_state,reply_message_ref
                FROM kickside_channel_turns WHERE turn_id=$1]], { proof.turn_id })
            local receipts, receipt_err = db:query([[SELECT reply_state,reply_message_ref
                FROM kickside_channel_turns WHERE turn_id=$1]], { reserved.reply_proof.turn_id })
            db:release()
            test.is_nil(read_err)
            test.is_nil(receipt_err)
            test.is_nil(rows[1].appended_at)
            test.eq(tonumber(rows[1].retry_at), 123)
            test.is_nil(rows[1].reply_state)
            test.eq(receipts[1].reply_state, "reserved")
            test.is_nil(receipts[1].reply_message_ref)
        end)

        test.it("binds a Discord reply to its admitted turn and retained receipt", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = { kind = "user", id = "installer-1" } }
            local bad = {}
            for k, v in pairs(target) do bad[k] = v end
            bad.external_conversation_id = "other-room"
            local refused = persist.reserve_reply(DB, proof, bad, "hello back")
            test.is_nil(refused)
            bad.external_conversation_id = "chan-1"
            bad.provider = "slack"
            test.is_nil(persist.reserve_reply(DB, proof, bad, "hello back"))
            local forged = {}
            for k, v in pairs(proof) do forged[k] = v end
            forged.seal = "forged"
            test.is_nil(persist.reserve_reply(DB, forged, target, "hello back"))
            local first, first_err = persist.reserve_reply(DB, proof, target, "hello back")
            test.is_nil(first_err)
            test.is_true(first.send)
            local pending = persist.reserve_reply(DB, proof, target, "hello back")
            test.is_false(pending.send)
            test.is_true(pending.uncertain)
            local saved, save_err = persist.complete_reply(DB, proof, "hello back", "out-1")
            test.is_nil(save_err)
            test.is_true(saved)
            local replay, replay_err = persist.reserve_reply(DB, proof, target, "hello back")
            test.is_nil(replay_err)
            test.is_false(replay.send)
            test.eq(replay.message_ref, "out-1")
            test.is_nil(persist.reserve_reply(DB, proof, target, "different text"))
        end)

        test.it("refuses expired proofs and revoked connection grants before reservation", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = proof.principal }
            test_state.state.connection_write_denied = true
            local refused, denied_err = reply_admission.reserve({
                proof = proof, target = target, content = "reply",
            })
            test.is_nil(refused)
            test.not_nil(denied_err)
            test_state.state.connection_write_denied = false
            proof.expires_at = "2000-01-01T00:00:00Z"
            local encoded = json.encode(route)
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            db:execute("UPDATE kickside_channel_turns SET route_json = $1 WHERE turn_id = $2",
                { encoded, proof.turn_id })
            db:release()
            local expired, expiry_err = reply_admission.reserve({
                proof = proof, target = target, content = "reply",
            })
            test.is_nil(expired)
            test.not_nil(expiry_err)
            test.contains(tostring(expiry_err), "expired")
        end)

        test.it("verifies an admitted reply proof before any provider opens, without reserving it", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = proof.principal }
            local verified, verify_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(verify_err)
            test.is_true(verified.verified)
            -- Verification reserves nothing: the provider's own reservation still sends.
            local first = persist.reserve_reply(DB, proof, target, "hello back")
            test.is_true(first.send)

            local other = {}
            for k, v in pairs(target) do other[k] = v end
            other.external_conversation_id = "other-room"
            local refused, refuse_err = reply_admission.verify({ proof = proof, target = other })
            test.is_nil(refused)
            test.is_true(errors.is(refuse_err, errors.PERMISSION_DENIED))

            test_state.state.connection_write_denied = true
            local revoked, revoked_err = reply_admission.verify({ proof = proof, target = target })
            test_state.state.connection_write_denied = false
            test.is_nil(revoked)
            test.not_nil(revoked_err)
        end)

        test.it("admits a member reply without actor creation while enforcing live authority", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = proof.principal }
            test_state.state.actor_create_denied = true
            local frame, frame_err = execution_ref.resolve(route.execution_ref, "channel", route)
            test.is_nil(frame)
            test.is_true(errors.is(frame_err, errors.PERMISSION_DENIED))
            local verified, verify_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(verify_err, tostring(verify_err))
            test.is_true(verified.verified)
            local reserved, reserve_err = reply_admission.reserve({ proof = proof, target = target, content = "reply" })
            test.is_nil(reserve_err, tostring(reserve_err))
            test.is_true(reserved.send)

            test_state.state.connection_write_denied = true
            local denied, denied_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(denied)
            test.is_true(errors.is(denied_err, errors.PERMISSION_DENIED))
            test_state.state.connection_write_denied = false
            test_state.state.witness_identity_err = "principal disabled"
            local disabled, disabled_err = reply_admission.reserve({ proof = proof, target = target, content = "reply" })
            test.is_nil(disabled)
            test.is_true(errors.is(disabled_err, errors.PERMISSION_DENIED))
            test_state.state.witness_identity_err = nil
            test_state.state.responders["auto-1"].identity_generation = 1
            local stale, stale_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(stale)
            test.is_true(errors.is(stale_err, errors.PERMISSION_DENIED))
        end)

        test.it("refuses an expired proof that retains no receipt", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = proof.principal }
            proof.expires_at = "2000-01-01T00:00:00Z"
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            db:execute("UPDATE kickside_channel_turns SET route_json = $1 WHERE turn_id = $2",
                { json.encode(route), proof.turn_id })
            db:release()
            local expired, expiry_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(expired)
            test.contains(tostring(expiry_err), "expired")
        end)

        test.it("refuses an expired reserved reply until a receipt is retained", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = proof.principal }
            local reserved, reserve_err = persist.reserve_reply(DB, proof, target, "reply")
            test.is_nil(reserve_err)
            test.is_true(reserved.send)

            proof.expires_at = "2000-01-01T00:00:00Z"
            local db, db_err = sql.get(DB)
            if db_err or not db then error("reply test db unavailable: " .. tostring(db_err)) end
            local _, update_err = db:execute("UPDATE kickside_channel_turns SET route_json = $1 WHERE turn_id = $2",
                { json.encode(route), proof.turn_id })
            db:release()
            test.is_nil(update_err)
            local expired, expiry_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(expired)
            test.contains(tostring(expiry_err), "expired")

            local saved, complete_err = persist.complete_reply(DB, proof, "reply", "out-1")
            test.is_nil(complete_err)
            test.is_true(saved)
            local verified, verify_err = reply_admission.verify({ proof = proof, target = target })
            test.is_nil(verify_err)
            test.is_true(verified.verified)
        end)

        test.it("keeps reply-store failures retriable and proof refusals terminal", function()
            seed_responder()
            test.eq(receive.receive(inbound()).status, "routed")
            local route = sent_route(1)
            local proof = route.reply_proof
            local target = { provider = "discord", connection_id = "conn-1",
                external_conversation_id = "chan-1", inbound_message_id = "msg-1",
                reply_op = "send_reply", principal = proof.principal }
            local missing, missing_err, missing_kind = persist.reserve_reply(
                "app:missing-reply-db", proof, target, "reply")
            test.is_nil(missing)
            test.not_nil(missing_err)
            test.eq(missing_kind, "infrastructure")
            local bad = {}
            for key, value in pairs(proof) do bad[key] = value end
            bad.seal = "forged"
            local refused, refuse_err = reply_admission.reserve({
                proof = bad, target = target, content = "reply",
            })
            test.is_nil(refused)
            test.is_true(errors.is(refuse_err, errors.PERMISSION_DENIED))
            test.is_false((refuse_err :: any):retryable())
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            local _, hide_err = db:execute("ALTER TABLE kickside_channel_turns RENAME TO kickside_channel_turns_offline")
            test.is_nil(hide_err)
            local unavailable, store_err = reply_admission.reserve({
                proof = proof, target = target, content = "reply",
            })
            local _, restore_err = db:execute("ALTER TABLE kickside_channel_turns_offline RENAME TO kickside_channel_turns")
            db:release()
            test.is_nil(restore_err)
            test.is_nil(unavailable)
            test.is_true(errors.is(store_err, errors.UNAVAILABLE))
            test.is_true((store_err :: any):retryable())
        end)

        test.it("resolves stored responder authority through its trusted deferred owner", function()
            seed_responder()
            local frame, err = execution_ref.resolve(
                { owner_id = "automation.component", record_id = "auto-1", generation = 0 },
                "channel", { inbound = inbound() })
            test.is_nil(err, tostring(err))
            test.not_nil(frame)
            test.eq(test_state.state.resolve_request.deferred_owner, "kickside.channel.service:execution_ref")
            test.eq(test_state.state.resolve_request.authorized_by.id, "installer-1")
            test.eq(test_state.state.resolve_request.execution_root.record_id, "auto-1")
        end)

        test.it("loads only the responder owning the channel at its current generation", function()
            seed_responder()
            local ref = { owner_id = "automation.component", record_id = "auto-1", generation = 0 }
            local identity, err = execution_ref.load(ref, "channel", { inbound = inbound() })
            test.is_nil(err)
            test.eq(identity.principal.id, "installer-1")

            local _, forged_err = execution_ref.load(ref, "channel",
                { inbound = inbound({ channel_id = "other" }) })
            test.is_true(forged_err ~= nil)
            local _, owner_err = execution_ref.load(
                { owner_id = "mcp.credential", record_id = "auto-1", generation = 0 },
                "channel", { inbound = inbound() })
            test.is_true(owner_err ~= nil)
            test_state.state.responders["auto-1"].identity_generation = 1
            local _, stale_err = execution_ref.load(ref, "channel", { inbound = inbound() })
            test.is_true(stale_err ~= nil)
        end)

        test.it("blocks the next channel turn after the selected principal loses connection WRITE", function()
            seed_responder()
            test_state.state.connection_write_denied = true
            local frame, err = execution_ref.resolve(
                { owner_id = "automation.component", record_id = "auto-1", generation = 0 },
                "channel", { inbound = inbound() })
            test.is_nil(frame)
            test.not_nil(err)
        end)

        test.it("does not turn a selected group principal into a user notification audience", function()
            test_state.add_responder("auto-1", {
                execution_identity = {
                    version = 2,
                    principal = { kind = "group", id = "eng" },
                    authorized_by = { kind = "user", id = "installer-1" },
                    component_id = "auto-1",
                    captured_at = "2026-09-26T00:00:00Z",
                },
            })
            test_state.add_component("agent-1", { title = "Agent One" })
            local result = receive.receive(inbound())
            test.eq(result.status, "routed")
            local route = sent_route(1)
            test.eq(#route.thread.user_ids, 0)
        end)

        test.it("starts new channel history when the responder identity generation changes", function()
            seed_responder()
            local first = receive.receive(inbound({ external_message_id = "msg-1" }))
            test.eq(first.status, "routed")
            test_state.state.responders["auto-1"].identity_generation = 1
            local second = receive.receive(inbound({ external_message_id = "msg-2" }))
            test.eq(second.status, "routed")
            test.is_true(second.session_id ~= first.session_id)
            test.eq(sent_route(2).execution_ref.generation, 1)
        end)

        test.it("converges concurrent first messages on one admitted session", function()
            seed_responder()
            local senders = 8
            for round = 1, 5 do
                local channel_id = "fresh-" .. tostring(round)
                test_state.add_responder("auto-" .. channel_id, {
                    connection_id = "conn-1", channel_id = channel_id, agent_id = "agent-1",
                })
                local outcomes = channel.new(senders)
                for sender = 1, senders do
                    coroutine.spawn(function()
                        outcomes:send(receive.receive(inbound({ channel_id = channel_id,
                            reply_resource_id = channel_id,
                            external_message_id = channel_id .. "-msg-" .. tostring(sender) })))
                    end)
                end
                local session_id: string? = nil
                for _ = 1, senders do
                    local result = outcomes:receive()
                    test.eq(result.status, "routed", tostring(result.error))
                    session_id = session_id or result.session_id
                    test.eq(result.session_id, session_id)
                end
                test.eq(persist.get(DB, TABLE, "discord", channel_id), session_id)
                local admission, admission_err = persist.get_admission(DB, session_id :: string)
                test.is_nil(admission_err, tostring(admission_err))
                test.eq(admission.record_id, "auto-" .. channel_id)
            end
        end)

        test.it("rejects a session mapping without admission", function()
            seed_responder()
            test.is_nil(persist.set(DB, TABLE, "discord", "chan-1", "unadmitted-session"))
            local result = receive.receive(inbound())
            test.eq(result.status, "error")
            test.eq(result.error, "conversation session admission is missing")
        end)

        test.it("removes current and archived conversation owner records together", function()
            session_service_stub.deleted = {}
            seed_responder()
            local first = receive.receive(inbound({ external_message_id = "gc-1" }))
            test.eq(first.status, "routed")
            test_state.state.responders["auto-1"].identity_generation = 1
            local second = receive.receive(inbound({ external_message_id = "gc-2" }))
            test.eq(second.status, "routed")
            test.is_true(first.session_id ~= second.session_id)
            test.is_nil(persist.set(DB, TABLE, "discord", "unrelated", "other-session"))
            local seed_db = assert(sql.get(DB))
            local _, seed_err = seed_db:execute([[INSERT INTO kickside_channel_turns
                (turn_id,route_json,accepted_at) VALUES ($1,$2,$3)]],
                { "other-conversation-turn", '{"session_id":"other-session"}',
                    time.now():utc():format_rfc3339() })
            seed_db:release()
            test.is_nil(seed_err, tostring(seed_err))
            local uncertain_db = assert(sql.get(DB))
            local timestamp = time.now():utc():format_rfc3339()
            local _, uncertain_err = uncertain_db:execute([[INSERT INTO kickside_channel_turns
                (turn_id,route_json,accepted_at,appended_at,reply_state)
                VALUES ($1,$2,$3,$3,'reserved')]],
                { "owner-uncertain-reply", '{"session_id":"' .. second.session_id .. '"}', timestamp })
            uncertain_db:release()
            test.is_nil(uncertain_err, tostring(uncertain_err))

            local removed = cleanup_conversation.cleanup_conversation({ provider = "discord", external_id = "chan-1" })
            test.is_true(removed.success, tostring(removed.error))
            test.eq(removed.discarded.reply_uncertain, 1)
            test.eq(#session_service_stub.deleted, 2)
            local db, db_err = sql.get(DB)
            if db_err or not db then error(tostring(db_err or "channel test database unavailable")) end
            for _, table_name in ipairs({ "kickside_channel_sessions", "kickside_channel_admissions",
                "kickside_channel_session_archives", "kickside_channel_session_owner" }) do
                local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name
                    .. " WHERE provider=$1 AND external_id=$2", { "discord", "chan-1" })
                test.is_nil(err, tostring(err))
                test.eq(tonumber(rows[1].n), 0, table_name)
            end
            local owner = assert(db:query([[SELECT deleting
                FROM kickside_channel_conversation WHERE provider='discord' AND external_id='chan-1']]))
            test.eq(#owner, 0)
            local turns, turns_err = db:query("SELECT turn_id FROM kickside_channel_turns ORDER BY turn_id")
            db:release()
            test.is_nil(turns_err, tostring(turns_err))
            test.eq(#turns, 1)
            test.eq(turns[1].turn_id, "other-conversation-turn")
            test.eq(persist.get(DB, TABLE, "discord", "unrelated"), "other-session")
        end)

    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
