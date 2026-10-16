local test = require("test")
local sql = require("sql")
local json = require("json")
local uuid_v4 = require("uuid").v4
local registry = require("registry")

local IMPL_ID = "kickside.agents:user_agent"

local function define_tests()
    test.describe("agent business logic", function()
        local db
        local cleanup_component_ids = {}

        test.before_all(function()
            db = sql.get("app:db")
            test.not_nil(db)
        end)

        test.after_all(function()
            if db then
                for _, cid in ipairs(cleanup_component_ids) do
                    db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_component_meta WHERE component_id = $1", { cid })
                    db:execute("DELETE FROM kickside_components WHERE component_id = $1", { cid })
                end
                db:release()
            end
        end)

        local function create_test_component(opts)
            opts = opts or {}
            local component_id = uuid_v4()
            cleanup_component_ids[#cleanup_component_ids + 1] = component_id

            local private_ctx = opts.private_context or {
                prompt = opts.prompt or "Test agent prompt.",
                model = opts.model or "class:fast",
                temperature = opts.temperature or 0.5,
                max_tokens = opts.max_tokens or 8000,
                traits = opts.traits or {},
                trait_contexts = opts.trait_contexts or {},
                trait_agent_options = opts.trait_agent_options or {},
                agent_options = opts.agent_options or {},
                tools = opts.tools or {},
                delegates = opts.delegates or {},
                memory_target_id = opts.memory_target_id or "",
            }
            local encoded_ctx, enc_err = json.encode(private_ctx)
            test.is_nil(enc_err)

            local _, err = db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { component_id, IMPL_ID, encoded_ctx }
            )
            test.is_nil(err)

            local meta = opts.meta or {
                { key = "title", value = opts.title or "Test Agent" },
                { key = "description", value = opts.description or "" },
                { key = "icon", value = opts.icon or "tabler:robot" },
                { key = "class", value = opts.class or "public" },
                { key = "model", value = opts.model or "class:fast" },
            }
            for _, m in ipairs(meta) do
                _, err = db:execute(
                    [[INSERT INTO kickside_component_meta (meta_id, component_id, key, value, created_at, updated_at)
                      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                    { uuid_v4(), component_id, m.key, m.value }
                )
                test.is_nil(err)
            end

            return component_id
        end





        test.describe("private_context structure", function()
            test.it("round-trips all fields through JSON encode/decode", function()
                local ctx_data = {
                    prompt = "You are an advanced research agent.",
                    model = "claude-4-5-sonnet",
                    temperature = 0.3,
                    max_tokens = 16000,
                    thinking_effort = 0.8,
                    traits = {
                        "kickside.agents.traits:thread_reader",
                        "kickside.agents.traits:workspace_manager",
                    },
                    trait_contexts = {
                        ["kickside.agents.traits:thread_reader"] = "Focus on recent events",
                    },
                    trait_agent_options = {
                        ["test.agent:checkpoint_trait"] = {
                            checkpoint = {
                                token_threshold = 12000,
                                max_tokens = 600,
                            },
                        },
                    },
                    agent_options = {
                        checkpoint = {
                            token_threshold = 42000,
                            max_tokens = 1400,
                        },
                    },
                    tools = {
                        "kickside.agents.core:agent_creator_tool",
                    },
                    delegates = {
                        "delegate-comp-id-1",
                        "delegate-comp-id-2",
                    },
                    memory_target_id = "kb-comp-id-1",
                }
                local encoded, enc_err = json.encode(ctx_data)
                test.is_nil(enc_err)

                local decoded, dec_err = json.decode(encoded)
                test.is_nil(dec_err)

                test.eq(decoded.prompt, ctx_data.prompt)
                test.eq(decoded.model, ctx_data.model)
                test.eq(decoded.temperature, ctx_data.temperature)
                test.eq(decoded.max_tokens, ctx_data.max_tokens)
                test.eq(decoded.thinking_effort, ctx_data.thinking_effort)
                test.eq(#decoded.traits, 2)
                test.eq(decoded.traits[1], "kickside.agents.traits:thread_reader")
                test.eq(decoded.traits[2], "kickside.agents.traits:workspace_manager")
                test.eq(decoded.trait_contexts["kickside.agents.traits:thread_reader"], "Focus on recent events")
                test.eq(decoded.trait_agent_options["test.agent:checkpoint_trait"].checkpoint.token_threshold, 12000)
                test.eq(decoded.trait_agent_options["test.agent:checkpoint_trait"].checkpoint.max_tokens, 600)
                test.eq(decoded.agent_options.checkpoint.token_threshold, 42000)
                test.eq(decoded.agent_options.checkpoint.max_tokens, 1400)
                test.eq(#decoded.tools, 1)
                test.eq(decoded.tools[1], "kickside.agents.core:agent_creator_tool")
                test.eq(#decoded.delegates, 2)
                test.eq(decoded.memory_target_id, "kb-comp-id-1")
            end)

            test.it("stores and retrieves private_context in DB", function()
                local component_id = create_test_component({
                    prompt = "DB round-trip prompt.",
                    model = "claude-4-5-haiku",
                    temperature = 0.9,
                    max_tokens = 2000,
                    traits = { "kickside.agents.traits:session_memory" },
                    trait_agent_options = {
                        ["kickside.agents.traits:session_memory"] = {
                            checkpoint = {
                                token_threshold = 18000,
                                max_tokens = 700,
                            },
                        },
                    },
                    agent_options = {
                        checkpoint = {
                            token_threshold = 24000,
                            max_tokens = 900,
                        },
                    },
                    tools = { "kickside.agents.core:navigate_to" },
                    delegates = { "some-delegate-id" },
                    memory_target_id = "some-kb-id",
                })

                local rows, err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { component_id }
                )
                test.is_nil(err)
                test.eq(#rows, 1)

                local ctx_data, dec_err = json.decode(tostring(rows[1].private_context))
                test.is_nil(dec_err)
                test.eq(ctx_data.prompt, "DB round-trip prompt.")
                test.eq(ctx_data.model, "claude-4-5-haiku")
                test.eq(ctx_data.temperature, 0.9)
                test.eq(ctx_data.max_tokens, 2000)
                test.eq(#ctx_data.traits, 1)
                test.eq(ctx_data.traits[1], "kickside.agents.traits:session_memory")
                test.eq(ctx_data.trait_agent_options["kickside.agents.traits:session_memory"].checkpoint.token_threshold, 18000)
                test.eq(ctx_data.trait_agent_options["kickside.agents.traits:session_memory"].checkpoint.max_tokens, 700)
                test.eq(ctx_data.agent_options.checkpoint.token_threshold, 24000)
                test.eq(ctx_data.agent_options.checkpoint.max_tokens, 900)
                test.eq(#ctx_data.tools, 1)
                test.eq(ctx_data.tools[1], "kickside.agents.core:navigate_to")
                test.eq(#ctx_data.delegates, 1)
                test.eq(ctx_data.delegates[1], "some-delegate-id")
                test.eq(ctx_data.memory_target_id, "some-kb-id")
            end)

            test.it("handles empty arrays in private_context", function()
                local component_id = create_test_component({
                    prompt = "Minimal agent.",
                    model = "class:fast",
                    traits = {},
                    tools = {},
                    delegates = {},
                })

                local rows, err = db:query(
                    "SELECT private_context FROM kickside_components WHERE component_id = $1",
                    { component_id }
                )
                test.is_nil(err)
                local ctx_data, dec_err = json.decode(tostring(rows[1].private_context))
                test.is_nil(dec_err)
                test.eq(type(ctx_data.traits), "table")
                test.eq(type(ctx_data.tools), "table")
                test.eq(type(ctx_data.delegates), "table")
                test.eq(#ctx_data.traits, 0)
                test.eq(#ctx_data.tools, 0)
                test.eq(#ctx_data.delegates, 0)
            end)
        end)






    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
