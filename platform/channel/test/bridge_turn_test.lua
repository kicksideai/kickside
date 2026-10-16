local test = require("test")
local bridge_support = require("bridge_support")
local test_state = require("test_state")
local session_service = require("session_service")

local function inbound(overrides)
    local args = {
        provider = "discord",
        reply_component_id = "conn-1",
        reply_resource_id = "chan-1",
        channel_id = "chan-1",
        external_user_id = "ext-1",
        external_username = "external-user",
        external_display_name = "External User",
        external_message_id = "msg-1",
        text = "hello",
        trace_context = { trace_id = "trace-1" },
    }
    if type(overrides) == "table" then
        for k, v in pairs(overrides) do args[k] = v end
    end
    return args
end

local function prepare(overrides)
    return bridge_support.prepare_session_turn({
        inbound = inbound(overrides),
        user_id = "installer-1",
        thread_id = "thread-1",
        thread_class = "kickside.channel",
        inbound_event = "kickside.channel.events:message.inbound",
        key = "discord:conn-1:chan-1",
    })
end

local function define_tests()
    test.describe("channel bridge runtime idle timer", function()
        test.it("uses the default when session policy is absent", function()
            test.eq(600000, bridge_support.runtime_idle_ms({}))
        end)

        test.it("uses the configured runtime idle duration", function()
            test.eq(900000, bridge_support.runtime_idle_ms({
                session_policy = { runtime_idle_seconds = 900 },
            }))
        end)

        test.it("clamps malformed route envelopes to safe bounds", function()
            test.eq(60000, bridge_support.runtime_idle_ms({
                session_policy = { runtime_idle_seconds = 12 },
            }))
            test.eq(86400000, bridge_support.runtime_idle_ms({
                session_policy = { runtime_idle_seconds = 99 * 60 * 60 },
            }))
        end)
    end)

    test.describe("channel bridge session source", function()
        test.before_each(function() session_service.last_ensure = nil end)

        test.it("records only the canonical route provider for a new session", function()
            bridge_support.ensure_session("session-1", "thread-1", { session_kind = "CHANNEL" }, "installer-1", "  Discord  ")
            local ensured = assert(session_service.last_ensure, "session ensure fixture was not called")
            test.eq("discord", ensured.meta.provider)
            test.is_nil(ensured.meta.component_id)
            test.is_nil(ensured.meta.channel_id)
        end)

        test.it("keeps each session source independent of previous sessions and inbound-like start fields", function()
            for _, provider in ipairs({ "telegram", "slack" }) do
                local result, err = bridge_support.ensure_session("session-" .. provider, "thread-1",
                    { session_kind = "CHANNEL", provider = "forged", meta = { provider = "forged" } },
                    "installer-1", provider)
                test.is_nil(err)
                test.not_nil(result)
                test.eq(assert(session_service.last_ensure).meta.provider, provider)
            end
            local result, err = bridge_support.ensure_session("session-app", "thread-1",
                { session_kind = "CHAT", provider = "forged" }, "installer-1", "")
            test.is_nil(err)
            test.not_nil(result)
            test.is_nil(assert(session_service.last_ensure).meta.provider)
        end)

        test.it("does not claim a source for an app-created chat", function()
            bridge_support.ensure_session("session-2", "thread-1", { session_kind = "CHAT" }, "installer-1", "")
            test.is_nil(assert(session_service.last_ensure, "session ensure fixture was not called").meta.provider)
        end)

        test.it("stores the resolved agent checkpoint threshold on a new session", function()
            bridge_support.ensure_session("session-checkpoint", "thread-1", { session_kind = "CHANNEL" }, "installer-1", "discord", nil, {
                checkpoint = { token_threshold = 221529 },
            })
            local ensured = assert(session_service.last_ensure, "session ensure fixture was not called")
            test.eq(221529, ensured.config.token_checkpoint_threshold)
        end)

        test.it("refuses malformed or oversized provider metadata", function()
            bridge_support.ensure_session("session-3", "thread-1", { session_kind = "CHANNEL" }, "installer-1", "../../credential")
            test.is_nil(assert(session_service.last_ensure, "session ensure fixture was not called").meta.provider)
            bridge_support.ensure_session("session-4", "thread-1", { session_kind = "CHANNEL" }, "installer-1", string.rep("a", 65))
            test.is_nil(assert(session_service.last_ensure, "session ensure fixture was not called").meta.provider)
        end)
    end)

    test.describe("channel bridge durable execution gate", function()
        test.before_each(function()
            test_state.reset()
            test_state.state.durable_append_dedupe = true
        end)

        test.it("prepares exactly one session turn for duplicate inbound deliveries", function()
            local first = prepare()
            local second = prepare()

            test.not_nil(first)
            test.eq("External User: hello", first.body)
            test.is_nil(second)
            test.eq(2, #test_state.state.witness)
            test.eq("append_inbound", test_state.state.witness[1].kind)
            test.eq("append_inbound", test_state.state.witness[2].kind)
        end)

        test.it("skips execution when redelivery observes an existing durable append", function()
            local first = prepare({ external_message_id = "msg-redeliver" })
            test.not_nil(first)

            local redelivered = prepare({ external_message_id = "msg-redeliver" })
            test.is_nil(redelivered)
        end)

        test.it("fails closed when the durable append errors", function()
            test_state.state.append_errors = { ["msg-append-fails"] = "append unavailable" }

            local turn, err = prepare({ external_message_id = "msg-append-fails" })

            test.is_nil(turn)
            test.not_nil(err)
            test.contains(tostring(err), "append unavailable")
        end)
    end)

    test.describe("channel bridge attachment routing", function()
        test.before_each(function()
            test_state.reset()
        end)

        test.it("stamps every attachment with its own routed connection across two connections", function()
            for _, connection in ipairs({ "connection-a", "connection-b" }) do
                local turn, err = prepare({ reply_component_id = connection, attachments = {
                    { ref = "file-a", upload_id = "upload-a", component_id = "forged-a", actor_id = "forged-user" },
                    { ref = "file-b", upload_id = "upload-b", component_id = "forged-b", thread_id = "forged-thread" },
                } })
                test.is_nil(err)
                test.not_nil(turn)
                test.eq(#turn.attachments, 2)
                for _, attachment in ipairs(turn.attachments) do
                    test.eq(attachment.component_id, connection)
                    test.eq(attachment.actor_id, "installer-1")
                    test.eq(attachment.thread_id, "thread-1")
                    test.eq(attachment.external_message_id, "msg-1")
                end
            end
            test.eq(#test_state.state.attachment_ingest_calls, 4)
        end)

        test.it("stamps the validated provider connection over untrusted attachment fields", function()
            local turn = prepare({ attachments = { {
                ref = "opaque-file", upload_id = "upload-1",
                source = "attacker", component_id = "attacker-connection",
            } } })
            test.not_nil(turn)
            test.eq(#test_state.state.attachment_ingest_calls, 1)
            local attachment = test_state.state.attachment_ingest_calls[1]
            test.eq(attachment.ref, "opaque-file")
            test.eq(attachment.source, "discord")
            test.eq(attachment.component_id, "conn-1")
            test.eq(attachment.actor_id, "installer-1")
            test.eq(attachment.thread_id, "thread-1")
            test.eq(attachment.external_message_id, "msg-1")
        end)

        test.it("does not invent a component when the validated inbound has none", function()
            local turn = prepare({ reply_component_id = "", attachments = { { ref = "opaque", upload_id = "upload-2" } } })
            test.not_nil(turn)
            test.eq(test_state.state.attachment_ingest_calls[1].component_id, "")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
