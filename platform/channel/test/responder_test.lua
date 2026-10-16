local test = require("test")
local responder_module = require("responder")
local responder = responder_module
local test_state = require("test_state")
local component = require("component")

local function define_tests()
    test.describe("channel responder controls", function()
        test.before_each(function()
            test_state.reset()
            test_state.state.public_state = {
                status = "active",
                channel = "chan-1",
                agent = "agent-1",
                trait_count = "0",
            }
        end)

        local function install_input(overrides)
            local input = {
                connection_id = "conn-1",
                agent_id = "agent-1",
                agent_name = "Bot",
                target = "channel",
                channel_id = "chan-1",
                channel_name = "general",
            }
            if type(overrides) == "table" then
                for k, v in pairs(overrides) do input[k] = v end
            end
            return input
        end

        test.it("rejects Discord responder install with a visible channel permission reason", function()
            test_state.add_component("conn-1", { provider = "discord" })
            test_state.state.connection_validation_result = {
                success = false, reason = "discord_permission_missing", error = "Missing Access",
            }
            local result, err = responder.install(install_input())
            test.is_nil(result)
            test.eq(err:details().reason, "discord_permission_missing")
            test.eq(test_state.state.connection_validation_args.resource_id, "chan-1")
        end)

        test.it("validates every connection provider before installing its responder", function()
            for _, provider in ipairs({ "slack", "telegram", "custom-provider" }) do
                test_state.reset()
                test_state.add_component("conn-1", { provider = provider })
                test_state.state.connection_validation_result = {
                    success = false, reason = "channel_unavailable", error = "Channel unavailable",
                }
                local result, err = responder.install(install_input())
                test.is_nil(result)
                test.eq(err:details().reason, "channel_unavailable")
                test.eq(test_state.state.connection_validation_args.resource_id, "chan-1")
            end
        end)

        test.it("validates the selected Discord channel before install", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input())
            test.is_nil(err)
            test.eq(type(result), "table")
            test.eq(test_state.state.connection_validation_args.resource_id, "chan-1")
        end)

        test.it("surfaces connection validation warnings as typed responder health", function()
            test_state.add_component("conn-1", { provider = "discord" })
            test_state.state.connection_validation_result = {
                success = true,
                warnings = { { reason = "message_content_intent_missing", message = "mentions only" } },
            }
            local result, err = responder.install(install_input())
            test.is_nil(err)
            test.eq(result.metadata.health_state, "warning")
            test.eq(result.metadata.health_reason, "message_content_intent_missing")
            test.eq(result.metadata.health_message, "mentions only")
            test.not_nil(result.metadata.health_at)
        end)

        test.it("installs a healthy responder without health fields when validation has no warnings", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input())
            test.is_nil(err)
            test.is_nil(result.metadata.health_state)
        end)

        test.it("requires the declared target instead of a kind alias", function()
            local input = install_input()
            input.target = nil
            input.kind = "channel"
            local result, err = responder.install(input)
            test.is_nil(result)
            test.eq(err, "target must be channel")
        end)

        test.it("promotes the routing keys into public_state so the lookup is indexed", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input())

            test.is_nil(err)
            test.eq(result.public_state.connection_id, "conn-1")
            test.eq(result.public_state.channel_id, "chan-1")
            test.eq(result.state.connection_id, "conn-1")
            test.eq(result.state.channel_id, "chan-1")
        end)

        test.it("declares a default system_prompt in state so the transport stops hardcoding it", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input())

            test.is_nil(err)
            test.eq(type(result.state.system_prompt), "string")
            test.eq(#result.state.system_prompt > 0, true)
        end)

        test.it("carries an explicit system_prompt through install", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input({ system_prompt = "Reply in haiku." }))

            test.is_nil(err)
            test.eq(result.state.system_prompt, "Reply in haiku.")
        end)

        test.it("normalizes lazy response policy through install", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input({
                response_policy = {
                    mode = "lazy",
                    wait_seconds = 12,
                    assessor_model = "class:smart",
                    prompt = "Only reply to production incidents.",
                },
            }))

            test.is_nil(err)
            test.eq(result.state.response_policy.mode, "lazy")
            test.eq(result.state.response_policy.wait_seconds, 12)
            test.eq(result.state.response_policy.assessor_model, "class:smart")
            test.eq(result.state.response_policy.prompt, "Only reply to production incidents.")
        end)


        test.it("normalizes session rotation policy through install", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input({
                session_policy = { rotate_after_idle = true, idle_seconds = 7200, runtime_idle_seconds = 900 },
            }))

            test.is_nil(err)
            test.eq(result.state.session_policy.rotate_after_idle, true)
            test.eq(result.state.session_policy.idle_seconds, 7200)
            test.eq(result.state.session_policy.runtime_idle_seconds, 900)
        end)

        test.it("defaults absent live runtime idle policy", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local default_result, default_err = responder.install(install_input())
            test.is_nil(default_err)
            test.eq(default_result.state.session_policy.rotate_after_idle, true)
            test.eq(default_result.state.session_policy.idle_seconds, 7200)
            test.eq(default_result.state.session_policy.runtime_idle_seconds, 600)

        end)

        test.it("rejects invalid policy values before installing a responder", function()
            test_state.add_component("conn-1", { provider = "discord" })
            for _, policy in ipairs({ { runtime_idle_seconds = 12 }, { runtime_idle_seconds = 86401 },
                { runtime_idle_seconds = "900" }, { runtime_idle_seconds = 900.5 },
                { idle_seconds = 59 }, { idle_seconds = 2592001 }, { idle_seconds = 7200.5 },
                { rotate_after_idle = "false" } }) do
                local result, err = responder.install(install_input({ session_policy = policy }))
                test.is_nil(result)
                test.not_nil(err)
            end
            for _, policy in ipairs({ { mode = "unknown" }, { mode = "lazy", wait_seconds = 0 },
                { mode = "lazy", wait_seconds = 121 }, { mode = "lazy", wait_seconds = "8" },
                { mode = "lazy", wait_seconds = 8.5 } }) do
                local result, err = responder.install(install_input({ response_policy = policy }))
                test.is_nil(result)
                test.not_nil(err)
            end
        end)

        test.it("keeps an explicitly disabled chat rotation policy", function()
            test_state.add_component("conn-1", { provider = "discord" })
            local result, err = responder.install(install_input({
                session_policy = { rotate_after_idle = false, runtime_idle_seconds = 600 },
            }))

            test.is_nil(err)
            test.eq(result.state.session_policy.rotate_after_idle, false)
            test.is_nil(result.state.session_policy.idle_seconds)
        end)

        test.it("propagates routing and provider lookup failures during install", function()
            for _, boundary in ipairs({ "routing", "provider" }) do
                local failure = errors.new({ kind = errors.UNAVAILABLE, message = "component lookup unavailable" })
                local original = component.list_system
                component.list_system = function(args)
                    if (boundary == "routing" and args.meta) or (boundary == "provider" and args.component_ids) then
                        return nil, failure
                    end
                    return original(args)
                end
                local result, err = responder.install(install_input())
                component.list_system = original
                test.is_nil(result)
                test.eq(err, failure)
            end
        end)

        test.it("rejects a duplicate responder on the same connection+channel, naming the existing one", function()
            test_state.add_component("conn-1", { provider = "discord" })
            test_state.add_responder("existing-1", {
                connection_id = "conn-1",
                channel_id = "chan-1",
                title = "General Responder",
            })

            local result, err = responder.install(install_input())

            test.is_nil(result)
            test.eq(type(err) == "string" and err:find("General Responder") ~= nil, true)
        end)

        test.it("allows a responder on a different channel of the same connection", function()
            test_state.add_component("conn-1", { provider = "discord" })
            test_state.add_responder("existing-1", {
                connection_id = "conn-1",
                channel_id = "chan-other",
                title = "Other Responder",
            })

            local result, err = responder.install(install_input())
            test.is_nil(err)
            test.eq(result.public_state.channel_id, "chan-1")
        end)

        test.it("status reads the public automation state", function()
            local state, err = responder.status({ component_id = "auto-1" })

            test.is_nil(err)
            test.eq(state.status, "active")
            test.eq(test_state.state.status_reads[1], "auto-1")
        end)

        test.it("read_config returns the editable private responder state", function()
            test_state.add_responder("auto-1", {
                connection_id = "conn-1",
                channel_id = "chan-1",
                agent_id = "agent-1",
                title = "General responder",
                traits = { "cap-1" },
                context = "Only answer production incidents.",
                system_prompt = "Be concise.",
            })

            local result, err = responder.read_config({ component_id = "auto-1" })

            test.is_nil(err)
            test.eq(result.success, true)
            test.eq(result.state.agent_id, "agent-1")
            test.eq(result.state.context, "Only answer production incidents.")
            test.eq(result.public_state.status, "active")
            test.eq(test_state.state.private_reads[1], "auto-1")
        end)

        test.it("configure updates editable fields and keeps routing fixed", function()
            test_state.add_responder("auto-1", {
                connection_id = "conn-1",
                channel_id = "chan-1",
                channel_name = "general",
                agent_id = "agent-old",
                agent_name = "Old Bot",
                paused = true,
                title = "Old title",
                system_prompt = "Old prompt.",
            })

            local result, err = responder.configure({
                component_id = "auto-1",
                input = {
                    title = "New title",
                    connection_id = "other-conn",
                    channel_id = "other-channel",
                    channel_name = "other",
                    agent_id = "agent-new",
                    agent_name = "New Bot",
                    target = "channel",
                    traits = { "cap-1", "cap-1", "cap-2" },
                    trait_contexts = { ["cap-1"] = { enabled = true }, ignored = { enabled = true } },
                    context = "Answer only when named.",
                    response_policy = { mode = "lazy", wait_seconds = 9, assessor_model = "class:fast", prompt = "Wait for real incidents." },
                    session_policy = { rotate_after_idle = true, idle_seconds = 3600 },
                    system_prompt = "Stay brief.",
                },
            })

            test.is_nil(err)
            test.eq(result.success, true)
            test.eq(test_state.state.private_patches[1].component_id, "auto-1")
            local patch = test_state.state.private_patches[1].patch
            test.eq(patch.connection_id, "conn-1")
            test.eq(patch.channel_id, "chan-1")
            test.eq(patch.channel_name, "general")
            test.eq(patch.agent_id, "agent-new")
            test.eq(patch.agent_name, "New Bot")
            test.eq(patch.paused, true)
            test.eq(#patch.traits, 2)
            test.eq(patch.trait_contexts["cap-1"].enabled, true)
            test.is_nil(patch.trait_contexts.ignored)
            test.eq(patch.response_policy.mode, "lazy")
            test.eq(patch.response_policy.wait_seconds, 9)
            test.eq(patch.response_policy.assessor_model, "class:fast")
            test.eq(patch.response_policy.prompt, "Wait for real incidents.")
            test.eq(patch.session_policy.rotate_after_idle, true)
            test.eq(patch.session_policy.idle_seconds, 3600)
            test.eq(test_state.state.set_meta_calls[1].component_id, "auto-1")
            test.eq(test_state.state.set_meta_calls[1].fields.title, "New title")
            test.eq(test_state.state.set_meta_calls[1].fields.status, "paused")
            test.eq(test_state.state.set_meta_calls[1].fields.channel, "general")
            test.eq(test_state.state.set_meta_calls[1].fields.agent, "New Bot")
            test.eq(test_state.state.set_meta_calls[1].fields.trait_count, "2")
        end)

        test.it("pause patches routing state and emits a status event", function()
            responder = responder_module.new({ emit_event = function(component_id, etype, body)
                test_state.state.events[#test_state.state.events + 1] = {
                    component_id = component_id,
                    type = etype,
                    body = body,
                }
                return nil
            end })
            local result, err = responder.pause({ component_id = "auto-1" })
            responder = responder_module

            test.is_nil(err)
            test.eq(result.success, true)
            test.eq(result.paused, true)
            test.eq(result.status, "paused")
            test.eq(test_state.state.private_patches[1].component_id, "auto-1")
            test.eq(test_state.state.private_patches[1].patch.paused, true)
            test.eq(test_state.state.events[1].component_id, "auto-1")
            test.eq(test_state.state.events[1].type, "kickside.channel.responder.events:status.changed")
            test.eq(test_state.state.events[1].body.status, "paused")
        end)

        test.it("resume clears routing pause and emits a status event", function()
            responder = responder_module.new({ emit_event = function(component_id, etype, body)
                test_state.state.events[#test_state.state.events + 1] = {
                    component_id = component_id,
                    type = etype,
                    body = body,
                }
                return nil
            end })
            local result, err = responder.resume({ component_id = "auto-1" })
            responder = responder_module

            test.is_nil(err)
            test.eq(result.success, true)
            test.eq(result.paused, false)
            test.eq(result.status, "active")
            test.eq(test_state.state.private_patches[1].patch.paused, false)
            test.eq(test_state.state.events[1].type, "kickside.channel.responder.events:status.changed")
            test.eq(test_state.state.events[1].body.status, "active")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
