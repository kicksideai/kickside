local test = require("test")
local agent_invoke = require("agent_invoke")
local registry = require("registry")

-- The writing automation every direct write names as its origin.
local ORIGIN = "agent-invoke-test-automation"

local function make_flow(calls, result, err)
    return {
        create = function()
            local builder = {}
            function builder:with_title(title)
                calls[#calls + 1] = { kind = "title", value = title }
                return self
            end
            function builder:with_metadata(metadata)
                calls[#calls + 1] = { kind = "metadata", value = metadata }
                return self
            end
            function builder:with_input(input)
                calls[#calls + 1] = { kind = "input", value = input }
                return self
            end
            function builder:agent(agent, cfg)
                calls[#calls + 1] = { kind = "agent", value = agent, cfg = cfg }
                return self
            end
            function builder:run()
                return result, err
            end
            return builder
        end,
    }
end

local function agent_call(calls)
    for _, call in ipairs(calls) do
        if call.kind == "agent" then return call end
    end
    return nil
end

local function input_call(calls)
    for _, call in ipairs(calls) do
        if call.kind == "input" then return call end
    end
    return nil
end

local function trait_entry(schema: any?): any
    return { id = "trait:a", kind = "registry.entry", meta = { type = "agent.trait", context_schema = schema or {} } }
end

local function define_tests()
    test.describe("agent writable declaration", function()
        test.it("loads package dependencies from the dedicated namespace", function()
            local entry, err = registry.get("kickside.agents.dependencies:dep.kickside.connection")
            test.is_nil(err)
            test.not_nil(entry)
            test.is_nil((registry.get("kickside.agents:dep.kickside.connection")))
        end)
    end)
    test.describe("agent invoke endpoint", function()
        test.it("requires the declared agent_id instead of an agent_ref alias", function()
            local calls = {}
            local result = agent_invoke.write({ origin = ORIGIN, config = { agent_ref = "user_agent:agent-1" },
                input = { content = "Run." } }, { flow = make_flow(calls, "unused", nil) })
            test.eq(result.success, false)
            test.eq(result.error.message, "agent_id is required")
            test.eq(#calls, 0)
        end)

        test.it("runs the bare agent with the written message and returns its output", function()
            local calls = {}
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", max_iterations = 5 },
                input = { content = "Summarize yesterday." },
            }, {
                can_agent = function() return true end, flow = make_flow(calls, { answer = "all done" }, nil),
            })

            test.eq(result.success, true)
            test.eq(result.result, "created")
            test.eq(result.dest_ref.agent_id, "user_agent:agent-1")
            test.eq(result.dest_refs.default.dest_ref.agent_id, "user_agent:agent-1")
            test.eq(result.output, "all done")

            local run = agent_call(calls)
            test.not_nil(run)
            test.eq(run.value, "user_agent:agent-1")
            test.eq(run.cfg.arena.max_iterations, 5)
            test.eq(input_call(calls).value.message, "Summarize yesterday.")
        end)

        test.it("rejects an unreadable user agent before starting the flow", function()
            local calls = {}
            local result = agent_invoke.write({ origin = ORIGIN, config = { agent_id = "user_agent:secret" },
                input = { content = "Run." } }, {
                flow = make_flow(calls, "must not run", nil),
                agent_service = {
                    get = function() return { success = true, impl_id = "kickside.agents:user_agent" } end,
                    get_access_context = function()
                        return { success = false, kind = errors.PERMISSION_DENIED, error = "not found or access denied" }
                    end,
                },
            })
            test.is_false(result.success)
            test.eq(result.error.code, "permission_denied")
            test.is_nil(agent_call(calls))
        end)

        test.it("rejects a private system agent before starting the flow", function()
            local calls = {}
            local result = agent_invoke.write({ origin = ORIGIN, config = { agent_id = "app:private_agent" },
                input = { content = "Run." } }, {
                flow = make_flow(calls, "must not run", nil),
                get_entry = function(id)
                    return { id = id, kind = "registry.entry", meta = { type = "agent.gen1", public = false } }, nil
                end,
            })
            test.is_false(result.success)
            test.eq(result.error.code, "permission_denied")
            test.is_nil(agent_call(calls))
        end)

        test.it("uses registry visibility for system agents", function()
            local calls = {}
            local private = agent_invoke.write({ origin = ORIGIN, config = { agent_id = "app:fixture_system_agent" },
                input = { content = "Run." } }, { flow = make_flow(calls, "no", nil) })
            test.is_false(private.success)
            test.eq(private.error.code, "permission_denied")
            test.is_nil(agent_call(calls))

            local public = agent_invoke.write({ origin = ORIGIN, config = { agent_id = "app:fixture_public_system_agent" },
                input = { content = "Run." } }, { flow = make_flow(calls, "yes", nil) })
            test.is_true(public.success)
            test.not_nil(agent_call(calls))
        end)

        test.it("invoke returns full untruncated content with the structured output alongside it", function()
            local calls = {}
            local long = ("x"):rep(4105)
            local result = agent_invoke.invoke({
                config = { agent_id = "agent-1", max_iterations = 5 },
                input = { content = "Summarize yesterday." },
                metadata = { automation_id = "auto-1" },
            }, {
                can_agent = function() return true end, flow = make_flow(calls, { answer = long, extra = { id = "raw-1" } }, nil),
            })

            test.eq(result.content, long)
            test.eq(result.content_type, "text/markdown")
            test.eq(result.raw.answer, long)
            test.eq(result.raw.extra.id, "raw-1")
            test.eq(result.metadata.agent_id, "user_agent:agent-1")
            test.eq(result.metadata.automation_id, "auto-1")
            test.eq(#result.content, 4105)
        end)

        test.it("invoke reports failure as a first-value envelope that survives the funcs boundary", function()
            -- The funcs boundary keeps only the first return value; a
            -- (nil, message) failure loses its reason across it.
            local calls = {}
            local envelope, err = agent_invoke.invoke({
                config = { agent_id = "agent-1", tool_ids = { "acme.tools:missing" } },
                input = { content = "Run." },
            }, {
                can_agent = function() return true end, flow = make_flow(calls, nil, "never reached"),
                get_entry = function(_id: string): (any?, any?) return nil, "not found" end,
            })

            test.eq(envelope.success, false)
            test.eq(envelope.error.code, "agent_invoke_error")
            test.is_true(tostring(envelope.error.message):find("unknown tool: acme.tools:missing") ~= nil)
            test.is_true(tostring(err):find("unknown tool") ~= nil, "the in-process second return stays")
        end)

        test.it("invoke marks success on the envelope", function()
            local calls = {}
            local result = agent_invoke.invoke({
                config = { agent_id = "agent-1", max_iterations = 5 },
                input = { content = "Summarize." },
            }, {
                can_agent = function() return true end, flow = make_flow(calls, { answer = "done" }, nil),
            })
            test.eq(result.success, true)
        end)

        test.it("write returns the whole agent output in the writable receipt", function()
            local long = ("x"):rep(4105)
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1" },
                input = { content = "Go." },
            }, {
                can_agent = function() return true end, flow = make_flow({}, { answer = long }, nil),
            })

            test.eq(result.success, true)
            test.eq(result.result, "created")
            test.eq(result.output, long)
        end)

        test.it("write returns a structured agent result as a table", function()
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1" },
                input = { content = "Go." },
            }, {
                can_agent = function() return true end,
                flow = make_flow({}, { report = { status = "ok", items = { "a", "b" } } }, nil),
            })

            test.eq(result.success, true)
            test.eq(result.output.report.status, "ok")
            test.eq(result.output.report.items[2], "b")
        end)

        test.it("returns the requested receipt slot with delivery identity", function()
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1" },
                input = { content = "Go." },
                identity_key = "agent-result", idempotency_key = "agent-result@2",
                map_slot = "answer",
            }, { can_agent = function() return true end, flow = make_flow({}, { answer = "done" }, nil) })
            test.is_true(result.success)
            test.eq(result.dest_ref.identity_key, "agent-result")
            test.eq(result.dest_ref.idempotency_key, "agent-result@2")
            test.eq(result.dest_refs.answer.dest_ref.idempotency_key, "agent-result@2")
        end)


        test.it("appends config.context to the message", function()
            local calls = {}
            agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "user_agent:agent-1", context = "Only connected tools." },
                input = { content = "Report." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil) })

            local sent = input_call(calls).value.message
            test.eq(sent, "Report.\n\nContext:\nOnly connected tools.")
        end)

        test.it("overlays extra traits over the resolved spec", function()
            local calls = {}
            local resolver = {
                resolve = function(_self, args)
                    test.eq(args.agent_id, "user_agent:agent-1")
                    return { id = "user_agent:agent-1", prompt = "Base", traits = { { id = "base:trait" } } }, nil
                end,
            }
            local get_entry = function(id)
                if id == "trait:a" then
                    return trait_entry({
                        type = "object",
                        properties = { connection_id = { type = "string" } },
                        additionalProperties = false,
                    }), nil
                end
                return nil, "not found"
            end
            agent_invoke.write({
                origin = ORIGIN,
                config = {
                    agent_id = "agent-1",
                    traits = { "trait:a" },
                    trait_contexts = { ["trait:a"] = { connection_id = "c1" }, ["trait:b"] = { ignored = true } },
                    trait_agent_options = { ["trait:a"] = { checkpoint = { token_threshold = 9000 } }, ["trait:b"] = { ignored = true } },
                },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), resolver = resolver, get_entry = get_entry })

            local run = agent_call(calls)
            test.eq(run.value.traits[1].id, "base:trait")
            test.eq(run.value.traits[2].id, "trait:a")
            test.eq(run.value.traits[2].context.connection_id, "c1")
            test.eq(run.value.traits[2].agent_options.checkpoint.token_threshold, 9000)
            test.is_nil(run.value.traits[3])
        end)

        test.it("rejects invalid per-run trait context before launching", function()
            local calls = {}
            local get_entry = function(id)
                if id == "trait:a" then
                    return trait_entry({
                        type = "object",
                        required = { "connection_id" },
                        properties = { connection_id = { type = "string" } },
                        additionalProperties = false,
                    }), nil
                end
                return nil, "not found"
            end
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = {
                    agent_id = "agent-1",
                    traits = { "trait:a" },
                    trait_contexts = { ["trait:a"] = { connection_id = 10 } },
                },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), get_entry = get_entry })

            test.eq(result.success, false)
            test.ok((tostring(result.error.message):find("trait:a.connection_id expected string", 1, true)))
            test.is_nil(agent_call(calls))
        end)

        test.it("refreshes model limits after a per-run model override", function()
            local calls = {}
            local result = agent_invoke.invoke({config = {agent_id = "agent-1", model = "checkpoint-policy-model"},
                input = {content = "Go."}}, {
                can_agent = function() return true end,
                flow = make_flow(calls, "done", nil),
                resolver = {resolve = function()
                    return {id = "user_agent:agent-1", model = "base-model", max_tokens = 8000,
                        agent_options = {checkpoint = {token_threshold = 240000}}}, nil
                end},
            })
            test.is_true(result.success)
            local spec = agent_call(calls).value
            test.eq(spec.agent_options.checkpoint.token_threshold, 221529)
        end)

        test.it("overlays per-run prompt, model and temperature over the resolved spec", function()
            local calls = {}
            local resolver = {
                resolve = function(_self, args)
                    test.eq(args.agent_id, "user_agent:agent-1")
                    return { id = "user_agent:agent-1", prompt = "Base", model = "base-model", temperature = 0.2 }, nil
                end,
            }
            agent_invoke.write({
                origin = ORIGIN,
                config = {
                    agent_id = "agent-1",
                    system_prompt = "Answer only in French.",
                    model = "checkpoint-policy-model",
                    temperature = 0.9,
                },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), resolver = resolver })

            local run = agent_call(calls)
            test.eq(run.value.prompt, "Answer only in French.")
            test.eq(run.value.model, "checkpoint-policy-model")
            test.eq(run.value.temperature, 0.9)
        end)

        test.it("replaces the agent's direct tool list with config.tool_ids for the run", function()
            local calls = {}
            local looked_up = {}
            local resolver = {
                resolve = function(_self, _args)
                    return { id = "user_agent:agent-1", tools = { "old:tool" }, traits = { { id = "base:trait" } } }, nil
                end,
            }
            local get_entry = function(id)
                looked_up[#looked_up + 1] = id
                return { id = id, kind = "function.lua", meta = { type = "tool" } }, nil
            end
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", tool_ids = { "app:tool_a", "app:tool_b" } },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), resolver = resolver, get_entry = get_entry })

            test.eq(result.success, true)
            local run = agent_call(calls)
            test.eq(run.value.tools[1], "app:tool_a")
            test.eq(run.value.tools[2], "app:tool_b")
            test.is_nil(run.value.tools[3])
            -- trait grants stay on the spec; the compiler merges their tools separately
            test.eq(run.value.traits[1].id, "base:trait")
            test.eq(looked_up[1], "app:tool_a")
            test.eq(looked_up[2], "app:tool_b")
        end)

        test.it("refuses a tool_ids entry that does not name a registered tool", function()
            local calls = {}
            local get_entry = function(_id) return nil, "not found" end
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", tool_ids = { "app:ghost" } },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), get_entry = get_entry })

            test.eq(result.success, false)
            test.eq(result.error.retriable, false)
            test.contains(result.error.message, "unknown tool")
            test.is_nil(agent_call(calls))
        end)

        test.it("refuses a tool_ids entry that names a non-tool registry entry", function()
            local calls = {}
            local get_entry = function(id) return { id = id, kind = "library.lua", meta = {} }, nil end
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", tool_ids = { "app:library" } },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), get_entry = get_entry })

            test.eq(result.success, false)
            test.eq(result.error.retriable, false)
            test.contains(result.error.message, "not a tool")
            test.is_nil(agent_call(calls))
        end)

        test.it("refuses an unauthorized override before starting the flow", function()
            local calls = {}
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", tool_ids = { "app:restricted_tool" } },
                input = { content = "Go." },
            }, {
                can_agent = function() return true end, flow = make_flow(calls, "must not run", nil),
                get_entry = function(id)
                    return { id = id, kind = "function.lua", meta = { type = "tool" } }, nil
                end,
                can_tool = function(_id) return false end,
            })
            test.is_false(result.success)
            test.eq(result.error.code, "permission_denied")
            test.is_nil(agent_call(calls))
        end)

        test.it("refuses a tool override with a configured actor or scope", function()
            for _, frame in ipairs({ { actor = { id = "system:tool" } }, { scope = "wippy.security:process" } }) do
                local calls = {}
                local result = agent_invoke.write({
                    origin = ORIGIN,
                    config = { agent_id = "agent-1", tool_ids = { "app:scoped_tool" } },
                    input = { content = "Run." },
                }, {
                    can_agent = function() return true end,
                    can_tool = function() return true end,
                    flow = make_flow(calls, "must not run", nil),
                    get_entry = function(id)
                        return { id = id, kind = "function.lua", meta = { type = "tool" }, security = frame }, nil
                    end,
                })
                test.is_false(result.success)
                test.eq(result.error.code, "permission_denied")
                test.contains(result.error.message, "configured authority")
                test.is_nil(agent_call(calls))
            end
        end)

        test.it("refuses an override naming a private tool before starting the flow", function()
            local calls = {}
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", tool_ids = { "app:private_tool" } },
                input = { content = "Go." },
            }, {
                can_agent = function() return true end, flow = make_flow(calls, "must not run", nil),
                get_entry = function(id)
                    return { id = id, kind = "function.lua",
                        meta = { type = "tool", public = true, private = true } }, nil
                end,
                can_tool = function(_id) return true end,
            })
            test.is_false(result.success)
            test.eq(result.error.code, "permission_denied")
            test.contains(result.error.message, "private")
            test.is_nil(agent_call(calls))
        end)

        test.it("fails a private-metadata override closed when the flag is malformed", function()
            local calls = {}
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", tool_ids = { "app:odd_tool" } },
                input = { content = "Go." },
            }, {
                can_agent = function() return true end, flow = make_flow(calls, "must not run", nil),
                get_entry = function(id)
                    return { id = id, kind = "function.lua",
                        meta = { type = "tool", public = true, private = "yes" } }, nil
                end,
                can_tool = function(_id) return true end,
            })
            test.is_false(result.success)
            test.eq(result.error.code, "permission_denied")
            test.is_nil(agent_call(calls))
        end)

        test.it("keeps the resolved spec tools when tool_ids is absent or empty", function()
            local calls = {}
            local resolver = {
                resolve = function(_self, _args)
                    return { id = "user_agent:agent-1", tools = { "old:tool" } }, nil
                end,
            }
            agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", model = "checkpoint-policy-model", tool_ids = {} },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), resolver = resolver })

            local run = agent_call(calls)
            test.eq(run.value.tools[1], "old:tool")
            test.is_nil(run.value.tools[2])
        end)

        test.it("leaves the agent unchanged (bare ref, no resolve) when no overrides are set", function()
            local calls = {}
            local resolved = false
            local resolver = {
                resolve = function(_self, _args) resolved = true return {}, nil end,
            }
            agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1" },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), resolver = resolver })

            test.eq(resolved, false)
            test.eq(agent_call(calls).value, "user_agent:agent-1")
        end)

        test.it("parses a string temperature from the schema form", function()
            local calls = {}
            local resolver = {
                resolve = function(_self, _args) return { id = "user_agent:agent-1" }, nil end,
            }
            agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1", temperature = "0.5" },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil), resolver = resolver })

            test.eq(agent_call(calls).value.temperature, 0.5)
        end)

        test.it("forwards req.metadata into the agent arena context", function()
            local calls = {}
            agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1" },
                input = { content = "Go." },
                metadata = { automation_id = "auto-1", automation_title = "Daily" },
            }, { can_agent = function() return true end, flow = make_flow(calls, "ok", nil) })

            local run = agent_call(calls)
            test.eq(run.cfg.arena.context.automation_id, "auto-1")
            test.eq(run.cfg.arena.context.automation_title, "Daily")
        end)

        test.it("refuses a write that names no origin before authorizing or starting the flow", function()
            local calls = {}
            local authorized = false
            local result = agent_invoke.write({
                config = { agent_id = "agent-1" },
                input = { content = "Go." },
            }, { can_agent = function() authorized = true; return true end, flow = make_flow(calls, "ok", nil) })
            test.eq(result.success, false)
            test.eq(result.error.code, "invalid_request")
            test.eq(result.error.retriable, false)
            test.is_false(authorized)
            test.eq(#calls, 0)
        end)

        test.it("fails closed without an agent_id", function()
            local result = agent_invoke.write({ origin = ORIGIN, config = {}, input = { content = "Go." } }, {})
            test.eq(result.success, false)
            test.eq(result.error.retriable, false)
        end)

        test.it("fails closed without a message", function()
            local result = agent_invoke.write({ origin = ORIGIN, config = { agent_id = "agent-1" }, input = {} }, {})
            test.eq(result.success, false)
            test.eq(result.error.retriable, false)
        end)

        test.it("surfaces a run failure as retriable", function()
            local result = agent_invoke.write({
                origin = ORIGIN,
                config = { agent_id = "agent-1" },
                input = { content = "Go." },
            }, { can_agent = function() return true end, flow = make_flow({}, nil, "model overloaded") })

            test.eq(result.success, false)
            test.eq(result.error.retriable, true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
