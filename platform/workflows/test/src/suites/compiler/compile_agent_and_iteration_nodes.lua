-- Compile-level fixtures over the canvas document IR. Pure — no engine boot. Covers
-- the governed compile rules: virtual boundaries, Start-less drafts, reachability/dead-node
-- detection, accidental-cycle rejection (teaching error names the edge), condition +
-- negation emission on branch fan-out, exclusive-IF vs parallel-join inputs.required,
-- def_node_id (+ workflow_id/version) stamping on every CREATE_NODE, exact-id
-- allowlist freeze, and per-run reminting (fresh ids, preserved def_node_id, input
-- injection).

local test = require("test")
local compiler = require("compiler")
local consts = require("consts")

type Map = { [string]: any }

local fixture_blocks: Map = {}

local function object_schema(): Map
    return { type = "object", additionalProperties = true }
end

local function explicit_fixture(id: string, descriptor: Map): Map
    descriptor.id = id
    descriptor.declaration = {
        id = id,
        kind = "registry.entry",
        meta = { type = "kickside.block", title = descriptor.title or id },
        data = { block = {
            api_version = "kickside.block/v1",
            input = descriptor.input_schema or object_schema(),
            config = descriptor.config_schema or object_schema(),
            output = descriptor.output_schema or object_schema(),
            error = descriptor.error_schema,
            ports = descriptor.ports or { { id = "result", direction = "out" } },
            execution = descriptor.execution,
        } },
    }
    return descriptor
end

local function fixture_block(id: string, execution: Map): string
    local block_id = "kickside.workflows.test.block:" .. id
    fixture_blocks[block_id] = explicit_fixture(block_id, {
        title = id,
        input_schema = object_schema(),
        config_schema = object_schema(),
        output_schema = object_schema(),
        error_schema = object_schema(),
        ports = {
            { id = "result", direction = "out" },
            { id = "failed", direction = "out" },
        },
        execution = execution,
    })
    return block_id
end

local compile_real = compiler.compile
compiler.compile = function(document: any, opts: any): (Map?, string?)
    local resolved: Map = {}
    for key, value in pairs(fixture_blocks) do resolved[key] = value end
    if type(opts) == "table" and type((opts :: Map).blocks) == "table" then
        for key, value in pairs((opts :: Map).blocks :: Map) do
            local d = value :: Map
            resolved[key] = value
        end
    end
    for key, raw in pairs(resolved) do (raw :: Map).id = key end
    local options: Map = type(opts) == "table" and opts or {}
    options.blocks = resolved
    return compile_real(document, options)
end

local function doc(nodes: any, edges: any, params: any?): Map
    return { nodes = nodes, edges = edges or {}, params = params or {} }
end

local function n(id: string, kind: string, extra: any): Map
    local out: Map = { id = id, kind = kind }
    if type(extra) == "table" then
        for k, v in pairs(extra :: Map) do out[k] = v end
    end
    return out
end

local function fn(id: string, extra: any?): Map
    local options = type(extra) == "table" and (extra :: Map) or {}
    local function_id = tostring(options.ref or "app:engine_linear")
    local out = n(id, "block", options)
    out.ref = fixture_block(id, { kind = "function", function_id = function_id })
    out.config = type(out.config) == "table" and out.config or {}
    if out.title == nil then out.title = "Fixture" end
    return out
end

local function declared_step(id: string, name: string, extra: any?): Map
    local out = n(id, "block", extra)
    out.ref = "kickside.workflows.test.block:" .. name
    return out
end

local function agent_step(id: string, extra: any?): Map
    local out = n(id, "block", extra)
    local cfg = type(out.config) == "table" and (out.config :: Map) or {}
    local execution: Map
    if type(cfg.instructions) == "string" and cfg.instructions ~= "" then
        execution = { kind = "agent", mode = "config" }
    else
        execution = { kind = "agent", agent_id = tostring(out.ref or "agents:" .. id) }
        out.config = {}
    end
    out.ref = fixture_block(id, execution)
    if execution.mode == "config" then
        local declared = fixture_blocks[out.ref] :: Map
        declared.config_schema = {
            type = "object",
            properties = {
                agent_id = { type = "string" }, instructions = { type = "string" },
                name = { type = "string" }, model = { type = "string" },
                tools = { type = "array" }, exit_schema = { type = "object" },
                tool_calling = { type = "string" }, context = { type = "object" },
            },
            additionalProperties = false,
        }
        local declaration = declared.declaration :: Map
        local data = declaration.data :: Map
        local block = data.block :: Map
        block.config = declared.config_schema
    end
    return out
end

local function wait_step(id: string, extra: any?): Map
    local out = n(id, "block", extra)
    out.ref = fixture_block(id, { kind = "wait" })
    out.config = type(out.config) == "table" and out.config or {}
    return out
end

local function e(id: string, source: string, target: string, extra: any): Map
    local out: Map = { id = id, source_id = source, target_id = target }
    if type(extra) == "table" then
        for k, v in pairs(extra :: Map) do out[k] = v end
    end
    return out
end

local function node_cmd(cmds: any, def_id: string): Map?
    for _, c in ipairs(type(cmds) == "table" and (cmds :: { any }) or {}) do
        if c.type == consts.COMMAND_TYPES.CREATE_NODE and type(c.payload) == "table"
            and tostring((c.payload :: Map).metadata and ((c.payload :: Map).metadata :: Map).def_node_id) == def_id then
            return c
        end
    end
    return nil
end

local function targets_of(res: any, def_id: string): { Map }
    local c = node_cmd((res :: Map).commands, def_id)
    if not c then return {} end
    return ((c :: Map).payload :: Map).config.data_targets :: { Map }
end

local function error_targets_of(res: any, def_id: string): { Map }
    local c = node_cmd((res :: Map).commands, def_id)
    if not c then return {} end
    return (((c :: Map).payload :: Map).config.error_targets or {}) :: { Map }
end

local function first_target(res: any, def_id: string, to_id: string): Map?
    for _, tg in ipairs(targets_of(res, def_id)) do
        if tostring(tg.node_id) == to_id then return tg end
    end
    return nil
end

local function error_codes(res: any): { [string]: boolean }
    local set: { [string]: boolean } = {}
    for _, err in ipairs((res :: Map).errors or {}) do set[tostring((err :: Map).code)] = true end
    return set
end

local function error_message(res: any, code: string): string
    for _, err in ipairs((res :: Map).errors or {}) do
        local problem = err :: Map
        if tostring(problem.code) == code then return tostring(problem.message) end
    end
    return ""
end

local function counter(): any
    local i = 0
    return function(): string
        i = i + 1
        return "id-" .. tostring(i)
    end
end

-- Exact Block descriptors as supplied by the canonical Block catalog.
local RESEARCH_KIND = {
    ["kickside.workflows.test.block:research"] = explicit_fixture("kickside.workflows.test.block:research", {
        kind = "block", config_required = { "agent_id", "prompt" },
        ports = {
            { id = "result", direction = "out", condition = "output.outcome == 'result'" },
            { id = "failed", direction = "out", condition = "output.outcome == 'failed'" },
        },
        error_schema = object_schema(),
        execution = { kind = "function", function_id = "kickside.research.workflow:run" },
    }),
}

-- Required configuration derives from the declaration's config schema. A workflow
-- may leave such a field unbound only through an explicitly declared Flow slot.
local SINK_KIND = {
    ["kickside.workflows.test.block:sink"] = explicit_fixture("kickside.workflows.test.block:sink", {
        kind = "block",
        config_schema = {
            type = "object",
            required = { "kb_id" },
            properties = { kb_id = { type = "string" } },
        },
        execution = { kind = "function", function_id = "m:sink" },
    }),
}

local REVIEW_KIND = {
    ["kickside.workflows.test.block:review"] = explicit_fixture("kickside.workflows.test.block:review", {
        kind = "block",
        config_schema = {
            type = "object",
            additionalProperties = false,
            required = { "prompt" },
            properties = {
                prompt = { type = "string", minLength = 1, maxLength = 200 },
                priority = { type = "string", enum = { "low", "normal", "high", "urgent" } },
                timeout = { type = "object", additionalProperties = false, properties = {
                    value = { type = "integer", minimum = 1 },
                    unit = { type = "string", enum = { "minutes", "hours", "days" } },
                } },
                form = { type = "object", additionalProperties = false, properties = {
                    type = { type = "string", enum = { "object" } },
                    required = { type = "array", maxItems = 4, items = { type = "string" } },
                } },
            },
        },
        execution = { kind = "function", function_id = "example.review:run" },
        ports = {
            { id = "then", direction = "out", condition = "output.outcome == 'approve'" },
            { id = "else", direction = "out", condition = "output.outcome == 'reject'" },
        },
    }),
}

local TOOL_KIND = {
    ["keeper.files:count_files"] = {
        id = "keeper.files:count_files",
        kind = "block",
        source_kind = "tool",
        tool = true,
        title = "Count Files",
        input_schema = {
            type = "object",
            required = { "path" },
            properties = { path = { type = "string" }, pattern = { type = "string" } },
            additionalProperties = false,
        },
        config_schema = {
            type = "object",
            properties = { path = { type = "string" }, pattern = { type = "string" } },
            additionalProperties = false,
        },
        config = {
            type = "object",
            properties = { path = { type = "string" }, pattern = { type = "string" } },
            additionalProperties = false,
        },
        output_schema = {
            type = "object",
            properties = { count = { type = "integer" } },
            additionalProperties = false,
        },
        error_schema = object_schema(),
        ports = {
            { id = "result", direction = "out" },
            { id = "failed", direction = "out" },
        },
        execution = { kind = "tool", tool_id = "keeper.files:count_files" },
    },
}

local function define_tests()


    test.describe("compiler: materialization", function()
        test.it("lowers an inline agent's instructions onto the engine arena", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    agent_step("a", {
                        config = {
                            instructions = "Return the typed greeting using Finish.",
                            model = "inline-agent-test-model",
                            exit_schema = {
                                type = "object",
                                required = { "greeting" },
                                properties = { greeting = { type = "string" } },
                            },
                        },
                    }),
                },
                { e("e0", "t", "a") }), {}))

            test.is_true((res :: Map).ok)
            local cmd = node_cmd((res :: Map).commands, "a") :: Map
            local cfg = ((cmd.payload :: Map).config :: Map) :: Map
            test.is_table(cfg.agent, "inline mode supplies an inline engine agent spec, not a component ref")
            test.eq(tostring((cfg.agent :: Map).id), "inline:a")
            local arena = cfg.arena :: Map
            test.eq(tostring(arena.prompt), "Return the typed greeting using Finish.")
            test.eq(tostring(arena.model), "inline-agent-test-model")
            test.eq(tostring(arena.tool_calling), "any")
            test.eq(tostring(((arena.exit_schema :: Map).properties :: Map).greeting.type), "string")
            test.eq(#(((res :: Map).allowlist :: Map).agents :: { any }), 0)
        end)



        -- The engine reserves the agent-node inputs `context` (merges into the
        -- arena), `model` and `agent_id` (overrides). A workflow delivers one
        -- payload object, so the lowering splits those carriers out of it; the
        -- whole payload stays visible under `input`.

        test.it("omits runtime boundaries and gives visible nodes stable topological presentation order", function()
            -- Deliberately declare the nodes out of graph order. Session presentation must
            -- follow Start -> first -> second -> Finish, not authoring/pairs/created_at order.
            local res = select(1, compiler.compile(doc(
                {
                    n("finish", "finish", { title = "Finish", config = { output_schema = { type = "object" } } }),
                    fn("second", { title = "Second", ref = "m:second" }),
                    n("start", "start", { title = "Start", config = { input_schema = { type = "object" } } }),
                    fn("first", { title = "First", ref = "m:first" }),
                },
                {
                    e("e1", "start", "first"),
                    e("e2", "first", "second"),
                    e("e3", "second", "finish"),
                }), { workflow_id = "wf-presentation", version = 2 }))
            test.is_true((res :: Map).ok)

            test.is_nil(node_cmd((res :: Map).commands, "start"))
            test.is_nil(node_cmd((res :: Map).commands, "finish"))
            local first = node_cmd((res :: Map).commands, "first") :: Map
            local second = node_cmd((res :: Map).commands, "second") :: Map
            test.not_nil(first)
            test.not_nil(second)
            local first_meta = ((first.payload :: Map).metadata :: Map)
            local second_meta = ((second.payload :: Map).metadata :: Map)
            test.is_false(((first_meta.presentation :: Map).hidden))
            test.is_false(((second_meta.presentation :: Map).hidden))
            test.eq(tonumber((first_meta.presentation :: Map).order), 1)
            test.eq(tonumber((second_meta.presentation :: Map).order), 2)

            local visible: { string } = {}
            for _, command in ipairs((res :: Map).commands :: { Map }) do
                if command.type == consts.COMMAND_TYPES.CREATE_NODE then
                    visible[#visible + 1] = tostring((((command.payload :: Map).metadata :: Map).def_node_id))
                end
            end
            test.eq(table.concat(visible, ","), "first,second")
        end)


        test.it("maps node kinds to the verified engine node types", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("f", { ref = "m:f" }),
                    wait_step("s", { config = { signal_id = "sig:approval" } }),
                    n("c", "cycle", { config = { continue_condition = "not_done", max_iterations = 4 } }),
                },
                { e("e0", "t", "f"), e("e1", "f", "s"), e("e2", "s", "c") }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            test.eq(tostring((node_cmd((res :: Map).commands, "t") :: Map).payload.node_type), consts.NODE_TYPE.FUNC)
            test.eq(tostring((node_cmd((res :: Map).commands, "f") :: Map).payload.node_type), consts.NODE_TYPE.FUNC)
            test.eq(tostring((node_cmd((res :: Map).commands, "s") :: Map).payload.node_type), "kickside.blocks:await")
            local c = node_cmd((res :: Map).commands, "c")
            test.eq(tostring((c :: Map).payload.node_type), consts.NODE_TYPE.CYCLE)
            local ccfg = ((c :: Map).payload :: Map).config
            test.not_nil(ccfg.continue_condition)
            test.eq(tonumber(ccfg.max_iterations), 4)
            test.not_nil(ccfg.continue_condition)
        end)





        test.it("lowers for_each to a parallel node with an honest default batch and result array", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    n("p", "for_each", { config = { source_array_key = "rows" } }),
                    fn("item", { ref = "m:item" }),
                },
                {
                    e("e0", "t", "p"),
                    e("body", "p", "item", { source_port = "body" }),
                }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            local p = node_cmd((res :: Map).commands, "p")
            local pcfg = ((p :: Map).payload :: Map).config
            test.eq(tostring((p :: Map).payload.node_type), consts.NODE_TYPE.PARALLEL)
            test.eq(tostring(pcfg.source_array_key), "rows")
            test.eq(tonumber(pcfg.batch_size), 8)
            test.eq(tostring(pcfg.on_error), "fail_fast")
            test.eq(tostring(pcfg.filter), "successes")
            test.eq(pcfg.unwrap, true)
            test.eq(#(pcfg.data_targets :: { any }), 1)
            test.eq(tostring((pcfg.data_targets :: { Map })[1].data_type), consts.DATA_TYPE.WORKFLOW_OUTPUT)

            local item = node_cmd((res :: Map).commands, "item")
            local ip = (item :: Map).payload :: Map
            test.eq(tostring(ip.parent_node_id), "p")
            test.eq(tostring(ip.status), consts.STATUS.TEMPLATE)
            test.eq(tostring(ip.node_type), consts.NODE_TYPE.FUNC)
            local leaf_target = (ip.config.data_targets :: { Map })[1]
            test.eq(tostring(leaf_target.data_type), consts.DATA_TYPE.NODE_OUTPUT)
            test.is_nil(leaf_target.node_id)
        end)

        test.it("leaves ordinary graph node configs free of iteration routes", function()
            local res = select(1, compiler.compile(doc(
                { fn("t"), fn("done", { ref = "m:done" }) },
                { e("e0", "t", "done") }), {}))
            test.is_true((res :: Map).ok)
            local config = ((node_cmd((res :: Map).commands, "t") :: Map).payload :: Map).config
            test.is_nil(config.iteration_input_routes)
        end)

        for _, kind in ipairs({ "for_each", "cycle" }) do
            test.it("counts " .. kind .. " body inputs when classifying repeated joins", function()
                local res = select(1, compiler.compile(doc({
                    n("p", kind, { config = kind == "cycle"
                        and { continue_condition = "false", max_iterations = 1 } or {} }),
                    fn("item"),
                    n("join", "combine", { config = { mode = "wait_all" } }),
                }, {
                    e("body-item", "p", "item", { source_port = "body" }),
                    e("body-join", "p", "join", { source_port = "body" }),
                    e("item-join", "item", "join"),
                }), {}))
                test.is_true((res :: Map).ok)
                local config = ((node_cmd((res :: Map).commands, "join") :: Map).payload :: Map).config
                test.is_table(config.inputs)
                test.eq(table.concat(config.inputs.required, ","), "in1,in2")

                local loop_config = ((node_cmd((res :: Map).commands, "p") :: Map).payload :: Map).config
                local routes = loop_config.iteration_input_routes :: { Map }
                test.eq(#routes, 2)
                test.eq(tostring(routes[1].node_id), "item")
                test.eq(tostring(routes[1].discriminator), "default")
                test.eq(tostring(routes[2].node_id), "join")
                test.eq(tostring(routes[2].discriminator), "in2")
            end)
        end

        test.it("lowers continue_on_error for_each output as ordered result/error entries", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    n("p", "for_each", { config = { continue_on_error = true } }),
                    fn("item", { ref = "m:item" }),
                },
                {
                    e("e0", "t", "p"),
                    e("body", "p", "item", { source_port = "body" }),
                }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            local pcfg = ((node_cmd((res :: Map).commands, "p") :: Map).payload :: Map).config
            test.eq(tostring(pcfg.on_error), "continue")
            test.eq(tostring(pcfg.filter), "all")
            test.eq(pcfg.unwrap, false)
        end)















    end)




end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
