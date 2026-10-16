local test = require("test")
local get_user_agent = require("get_user_agent")

local function define_tests()
    test.describe("get_user_agent payload", function()
        test.it("uses private_context as the model authority", function()
            local agent = get_user_agent.build_agent_payload("agent-1", {
                impl_id = "kickside.agents:user_agent",
                meta = {
                    title = "Research Agent",
                    comment = "Public summary",
                    icon = "tabler:robot",
                    model = "public-list-model",
                },
                created_at = "2026-01-01T00:00:00Z",
                updated_at = "2026-01-01T00:00:00Z",
            }, {
                prompt = "Private prompt",
                model = "private-config-model",
                trait_agent_options = {
                    ["test.agent:checkpoint"] = {
                        checkpoint = {
                            token_threshold = 12345,
                        },
                    },
                },
            })

            test.eq(agent.model, "private-config-model")
            test.eq(agent.trait_agent_options["test.agent:checkpoint"].checkpoint.token_threshold, 12345)
        end)

        test.it("does not use public meta as editable config fallback", function()
            local agent = get_user_agent.build_agent_payload("agent-1", {
                meta = {
                    title = "Research Agent",
                    model = "public-list-model",
                },
            }, {})

            test.eq(agent.model, "")
            test.is_false(agent.public)
        end)

        test.it("surfaces only an exact public metadata opt-in", function()
            local public = get_user_agent.build_agent_payload("agent-1", {
                meta = { public = true },
            }, {})
            local persisted = get_user_agent.build_agent_payload("agent-2", {
                meta = { public = "true" },
            }, {})
            local malformed = get_user_agent.build_agent_payload("agent-3", {
                meta = { public = 1 },
            }, {})

            test.is_true(public.public)
            test.is_true(persisted.public)
            test.is_false(malformed.public)
        end)

        test.it("can sanitize removed traits and their per-trait config", function()
            local agent = get_user_agent.build_agent_payload("agent-1", {
                meta = {
                    title = "Research Agent",
                },
            }, {
                traits = { "removed:trait", "live:trait" },
                trait_contexts = {
                    ["removed:trait"] = { stale = true },
                    ["live:trait"] = { kb_ids = { "kb-1" } },
                },
                trait_agent_options = {
                    ["removed:trait"] = { checkpoint = { token_threshold = 100 } },
                    ["live:trait"] = { checkpoint = { token_threshold = 4000 } },
                },
                tools = { "removed:tool", "live:tool" },
            }, function(ctx)
                return {
                    traits = { "live:trait" },
                    trait_contexts = { ["live:trait"] = ctx.trait_contexts["live:trait"] },
                    trait_agent_options = { ["live:trait"] = ctx.trait_agent_options["live:trait"] },
                    tools = { "live:tool" },
                }
            end)

            test.eq(#agent.traits, 1)
            test.eq(agent.traits[1], "live:trait")
            test.not_nil(agent.trait_contexts["live:trait"])
            test.is_nil(agent.trait_contexts["removed:trait"])
            test.eq(agent.trait_agent_options["live:trait"].checkpoint.token_threshold, 4000)
            test.eq(#agent.tools, 1)
            test.eq(agent.tools[1], "live:tool")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
