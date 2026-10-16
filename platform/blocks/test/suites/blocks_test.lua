local test = require("test")
local blocks = require("blocks")
local lower = require("lower")

local function object_schema(properties: any?): any
    local schema: any = { type = "object", additionalProperties = false }
    if properties ~= nil then schema.properties = properties end
    return schema
end

local function declaration(id: string, execution: any, config: any?): any
    return {
        id = id,
        kind = "registry.entry",
        meta = { type = "kickside.block", title = "Proof Block" },
        data = { block = {
            api_version = "kickside.block/v1",
            input = object_schema(),
            config = config or object_schema(),
            output = object_schema(),
            ports = { { id = "result", direction = "out" } },
            execution = execution,
        } },
    }
end

local function define_tests()
    test.describe("Blocks contract", function()
        test.it("validates the owned block object and ignores provenance metadata", function()
            local err = blocks.validate({
                id = "example:approval",
                kind = "registry.entry",
                meta = {
                    type = "kickside.block",
                    title = "Approval",
                    module_digest = "sha256:proof",
                },
                data = {
                    block = {
                        api_version = "kickside.block/v1",
                        input = { type = "object", properties = {} },
                        config = { type = "object", properties = {} },
                        output = { type = "object", properties = {} },
                        ports = { { id = "result", direction = "out" } },
                        execution = { kind = "function", function_id = "example:run_approval" },
                    },
                },
            })
            test.is_nil(err)
        end)

        test.it("rejects an untyped implementation", function()
            local err = blocks.validate({
                id = "example:broken",
                kind = "registry.entry",
                meta = { type = "kickside.block" },
                data = {
                    block = {
                        api_version = "kickside.block/v1",
                        input = { type = "object" },
                        config = { type = "object" },
                        output = { type = "object" },
                        ports = {},
                    },
                },
            })
            test.contains(tostring(err), "block.execution")
        end)

        test.it("requires the error schema and failed port to be declared together", function()
            local with_undeclared_error = declaration("example:error_only", {
                kind = "function", function_id = "example:run",
            })
            ; (with_undeclared_error :: any).data.block.error = object_schema()
            test.contains(tostring(blocks.validate(with_undeclared_error)), "declared together")

            local with_untyped_failure = declaration("example:port_only", {
                kind = "function", function_id = "example:run",
            })
            ; (with_untyped_failure :: any).data.block.ports[2] = { id = "failed", direction = "out" }
            test.contains(tostring(blocks.validate(with_untyped_failure)), "declared together")
        end)

        test.it("lowers the function ABI as exact input and config", function()
            local entry = declaration("example:function", {
                kind = "function", function_id = "example:run_function",
            })
            local plan, err = lower.plan(entry, { def_node_id = "work", config = { } })
            test.is_nil(err)
            test.eq((plan :: any).node_type, "userspace.dataflow.node.func:node")
            test.eq((plan :: any).config.func_id, "example:run_function")
            test.eq((plan :: any).config.input_transform.input, "input")
            test.not_nil((plan :: any).config.args.config)
        end)

        test.it("selects one exact user Agent from standard instance config", function()
            local entry = declaration("example:agent", { kind = "agent", mode = "config" }, object_schema({
                agent_id = { type = "string" }, instructions = { type = "string" },
                name = { type = "string" }, model = { type = "string" },
                tools = { type = "array" }, exit_schema = { type = "object" },
                tool_calling = { type = "string" }, context = { type = "object" },
            }))
            local plan, err = lower.plan(entry, {
                def_node_id = "agent", config = { agent_id = "userspace.agents:researcher", model = "model:test" },
            })
            test.is_nil(err)
            test.eq((plan :: any).config.agent, "userspace.agents:researcher")
            test.eq((plan :: any).config.arena.model, "model:test")
        end)

        test.it("creates an inline Agent from standard instance config", function()
            local entry = declaration("example:agent", { kind = "agent", mode = "config" }, object_schema({
                agent_id = { type = "string" }, instructions = { type = "string" },
                name = { type = "string" }, model = { type = "string" },
                tools = { type = "array" }, exit_schema = { type = "object" },
                tool_calling = { type = "string" }, context = { type = "object" },
            }))
            local plan, err = lower.plan(entry, {
                def_node_id = "agent", config = { instructions = "Ground the answer.", name = "Researcher" },
            })
            test.is_nil(err)
            test.eq((plan :: any).config.agent.id, "inline:agent")
            test.eq((plan :: any).config.arena.prompt, "Ground the answer.")
            test.eq((plan :: any).config.agent.max_tokens, 8000)
        end)

        test.it("hands the Agent node the finish check and the turn limit it was configured with", function()
            local entry = declaration("example:agent", { kind = "agent", mode = "config" }, object_schema({
                agent_id = { type = "string" }, instructions = { type = "string" },
                exit_schema = { type = "object" }, exit_func_id = { type = "string" },
                max_iterations = { type = "integer" },
            }))
            local plan, err = lower.plan(entry, {
                def_node_id = "agent", config = {
                    instructions = "Answer.", exit_schema = { type = "object" },
                    exit_func_id = "example:check_answer", max_iterations = 12,
                },
            })
            test.is_nil(err)
            test.eq((plan :: any).config.arena.exit_func_id, "example:check_answer")
            test.eq((plan :: any).config.arena.max_iterations, 12)

            local _, installed = lower.plan(entry, { config = {
                agent_id = "userspace.agents:researcher", exit_schema = { type = "object" },
                exit_func_id = "example:check_answer",
            } })
            test.is_nil(installed, "an installed Agent is refused the finish check")

            local _, no_finish = lower.plan(entry, { config = { instructions = "Answer.", exit_func_id = "example:check_answer" } })
            test.contains(tostring(no_finish), "requires config.exit_schema")
            local _, loose = lower.plan(entry, { config = {
                instructions = "Answer.", exit_schema = { type = "object" }, exit_func_id = "check_answer",
            } })
            test.contains(tostring(loose), "exact namespace:name")
            local _, zero = lower.plan(entry, { config = { instructions = "Answer.", max_iterations = 0 } })
            test.contains(tostring(zero), "positive integer")
        end)

        test.it("gives an inline Agent the configured response budget and refuses it for an installed one", function()
            local entry = declaration("example:agent", { kind = "agent", mode = "config" }, object_schema({
                agent_id = { type = "string" }, instructions = { type = "string" },
                max_tokens = { type = "integer" },
            }))
            local plan, err = lower.plan(entry, {
                def_node_id = "agent", config = { instructions = "Ground the answer.", max_tokens = 16000 },
            })
            test.is_nil(err)
            test.eq((plan :: any).config.agent.max_tokens, 16000)
            local _, installed = lower.plan(entry, { config = {
                agent_id = "userspace.agents:researcher", max_tokens = 16000,
            } })
            test.contains(tostring(installed), "applies to inline instructions")
            local _, fractional = lower.plan(entry, { config = { instructions = "Research.", max_tokens = 0 } })
            test.contains(tostring(fractional), "positive integer")
        end)

        test.it("rejects ambiguous and floating configurable Agents", function()
            local entry = declaration("example:agent", { kind = "agent", mode = "config" }, object_schema({
                agent_id = { type = "string" }, instructions = { type = "string" },
            }))
            local _, ambiguous = lower.plan(entry, { config = {
                agent_id = "userspace.agents:researcher", instructions = "Do both",
            } })
            test.contains(tostring(ambiguous), "exactly one")
            local _, floating = lower.plan(entry, { config = { agent_id = "researcher" } })
            test.contains(tostring(floating), "exact namespace:name")
        end)

        test.it("rejects contradictory or non-exact Agent tools and non-object output schemas", function()
            local entry = declaration("example:agent", { kind = "agent", mode = "config" }, object_schema({
                agent_id = { type = "string" }, instructions = { type = "string" },
                tools = { type = "array" }, exit_schema = { type = "object" },
                tool_calling = { type = "string" },
            }))
            local _, floating_tool = lower.plan(entry, { config = {
                instructions = "Research.", tools = { "search" },
            } })
            test.contains(tostring(floating_tool), "exact namespace:name")
            local _, ignored_tools = lower.plan(entry, { config = {
                instructions = "Research.", tool_calling = "none", tools = { "example:search" },
            } })
            test.contains(tostring(ignored_tools), "requires tool_calling auto or any")
            local _, scalar_output = lower.plan(entry, { config = {
                instructions = "Research.", exit_schema = { type = "string" },
            } })
            test.contains(tostring(scalar_output), "object JSON Schema")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
