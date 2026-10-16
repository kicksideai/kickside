local test = require("test")
local bridge = require("bridge")
local test_state = require("test_state")
local health_reporter = require("health_reporter")

local function drive(event_type, event_payload, send_error, lazy, upgrade)
    local inbox, events, idle = {}, {}, {}
    for _, ch in ipairs({ inbox, events, idle }) do ch.case_receive = function() return ch end end
    local count = 0
    local notifications = {}
    local dispatched = 0
    local handover: any = nil
    local options: any = nil
    local activations, threads, replies = 0, 0, {}
    local proofs = {}
    local fixture = bridge.new({
        process = {
            event = { CANCEL = "cancel", EXIT = "exit", LINK_DOWN = "link_down", OUTDATED = "outdated" },
            set_options = function(value) options = value end,
            registry = { register = function() return true, nil end, unregister = function() return true, nil end },
            cancel = function() return true, nil end,
            inbox = function() return inbox end, events = function() return events end,
            upgrade = function(id, state) test.is_nil(id); handover = state end,
        },
        channel = { select = function(cases)
            count = count + 1
            if upgrade then
                if count == 1 or count == 4 then
                    return { channel = inbox, value = { topic = function() return "session:session-1" end,
                        payload = function() return { data = function() return { type = "content", content = count == 1 and "before " or "after" } end } end } }
                end
                if count == 2 then
                    return { channel = inbox, value = { topic = function() return "messages" end,
                        payload = function() return { data = function() return { inbound = { text = "queued" }, reply_proof = "queued-proof" } end } end } }
                end
                if count == 3 then return { channel = events, value = { kind = "outdated" } } end
                if count == 5 or count == 6 then
                    return { channel = inbox, value = { topic = function() return "session:session-1" end,
                        payload = function() return { data = function() return { type = "update", status = "idle" } end } end } }
                end
                if count > 7 then error("bridge selects after cancellation") end
                return { channel = events, value = { kind = "cancel" } }
            end
            if lazy and count == 1 then return { channel = cases[4] } end
            if not lazy and count <= 2 then
                local payload = count == 1 and event_payload or { status = "idle" }
                payload.type = count == 1 and event_type or "update"
                return { channel = inbox, value = { topic = function() return "session:session-1" end,
                    payload = function() return { data = function() return payload end } end } }
            end
            return { channel = events, value = { kind = "cancel" } }
        end },
        support = {
            trim = function(v) return type(v) == "string" and v or "" end,
            canonical_provider = function(v) return v end,
            actor_id = function(actor) return actor:id() end,
            runtime_idle_ms = function() return 60000 end,
            resolve_active_traits = function() return nil, nil end,
            ensure_session = function() return true, nil end,
            spawn_session_process = function() return "session-pid", nil end,
            send_session_message = function() dispatched = dispatched + 1; return true, nil end,
            prepare_session_turn = function(args) return { body = args.inbound.text, attachments = {}, file_uuids = {} }, nil end,
            SESSION_ACTIVATED = "session.activated", SESSION_COMPLETED = "session.completed",
        },
        thread_bridge = {
            ensure_thread = function() threads = threads + 1; return "thread-1", {}, nil end,
            emit_responder_event = function(_, kind) if kind == "session.activated" then activations = activations + 1 end; return {}, nil end,
            append_reply_event = function() return {}, nil end,
        },
        reply_sender = { send_reply = function(config, content)
            replies[#replies + 1] = content
            proofs[#proofs + 1] = config.reply_proof
            return send_error and nil or { message_ref = "reply-1" }, send_error
        end },
        hub = { send = function(payload)
            if payload.kind == "health" then
                notifications[#notifications + 1] = payload
                return health_reporter.report_bridge({ pid = "bridge-pid", component_id = "auto-1" }, payload, "bridge-pid")
            end
            return true, nil
        end },
    })
    fixture.main({ route = { key = "discord:conn-1:chan-1", session_id = "session-1",
        start = { component_id = "auto-1", agent_id = "agent-1",
            response_policy = lazy and { mode = "lazy" } or {} },
        inbound = { text = "<@bot-1> question" }, reply_proof = upgrade and "first-proof" or nil,
        reply = { component_id = "conn-1", resource_id = "chan-1" }, thread = {} } })
    if upgrade then
        test.is_true(options.upgradable)
        test.not_nil(handover)
        test.eq(handover.state.session_pid, "session-pid")
        test.eq(handover.state.response_buffer, "before ")
        test.eq(#handover.state.pending, 1)
        test.is_true(handover.state.session_busy)
        test.not_nil(handover.state.idle_due)
        test.is_false(handover.state.first_session_turn)
        test.eq(handover.state.reply_config.reply_proof, "first-proof")
        test.eq(handover.state.pending[1].reply_proof, "queued-proof")
        fixture.main(handover)
        test.eq(threads, 1)
        test.eq(activations, 1)
        test.eq(dispatched, 2)
        test.eq(replies[1], "before after")
        test.eq(proofs[1], "first-proof")
    end
    local writes = test_state.state.set_meta_calls
    return writes[#writes] and writes[#writes].fields or {}, notifications, dispatched
end
local function define_tests()
    test.describe("responder asynchronous health", function()
        test.before_each(function() test_state.reset() end)
        test.it("upgrades an active turn without replaying input or losing buffered output", function()
            drive(nil, nil, nil, false, true)
        end)
        test.it("dispatches the queued turn and reports an assessor outage", function()
            test_state.state.assessment_error = errors.new({ kind = errors.UNAVAILABLE, message = "assessor unavailable" })
            local _, notifications, dispatched = drive(nil, nil, nil, true)
            test.eq(dispatched, 1)
            test.eq(#notifications, 1)
            test.eq(notifications[1].reason, "response_assessment_failed")
            test.contains(notifications[1].message, "assessor unavailable")
        end)
        test.it("keeps a successful assessor decision to stay silent", function()
            test_state.state.assessment_result = "IGNORE"
            local _, notifications, dispatched = drive(nil, nil, nil, true)
            test.eq(dispatched, 0)
            test.eq(#notifications, 1)
            test.eq(notifications[1].reason, "response_policy_skip")
        end)
        test.it("sends owner health through the hub without requiring run-as responder WRITE", function()
            local health, notifications = drive("content", { content = "answer" })
            test.eq(#notifications, 1)
            test.eq(notifications[1].kind, "health")
            test.eq(health.health_reason, "reply_sent")
        end)
        test.it("refuses a forged bridge health notification", function()
            local ok, err = health_reporter.report_bridge({ pid = "bridge-pid", component_id = "auto-1" },
                { reason = "reply_sent", message = "forged" }, "other-pid")
            test.is_false(ok)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(#test_state.state.set_meta_calls, 0)
        end)
        test.it("publishes a typed failed agent run instead of only logging the ERROR", function()
            local health = drive("error", { code = "model_unavailable", message = "model unavailable" })
            test.eq(health.health_reason, "agent_run_failed")
            test.contains(health.health_message, "model unavailable")
        end)
        test.it("publishes the Discord permission failure on the responder", function()
            local health = drive("content", { content = "answer" }, errors.new({ message = "Missing Permissions",
                kind = errors.PERMISSION_DENIED, details = { reason = "discord_permission_missing" } }))
            test.eq(health.health_reason, "discord_permission_missing")
        end)
        test.it("publishes successful reply delivery", function()
            local health = drive("content", { content = "answer" })
            test.eq(health.health_reason, "reply_sent")
            test.eq(health.health_state, "ready")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
