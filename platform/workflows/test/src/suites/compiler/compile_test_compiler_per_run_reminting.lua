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






    test.describe("compiler: per-run reminting", function()
        test.it("preserves frozen entry markers for whole-Flow runs", function()
            local commands = {
                {
                    type = consts.COMMAND_TYPES.CREATE_NODE,
                    payload = { node_id = "entry", node_type = consts.NODE_TYPE.FUNC, config = {}, metadata = { def_node_id = "entry" } },
                },
                {
                    type = consts.COMMAND_TYPES.CREATE_DATA,
                    payload = { data_id = "__entry_input__", data_type = consts.DATA_TYPE.NODE_INPUT, node_id = "entry", content = {} },
                },
            }
            local fresh, ids, err = compiler.remint(commands, counter(), { value = "full" })
            test.is_nil(err)
            local entry = (fresh :: { Map })[2].payload :: Map
            test.eq(tostring(entry.node_id), tostring((ids :: Map).entry))
            test.eq(tostring((entry.content :: Map).value), "full")
        end)

        test.it("mints fresh ids, preserves def_node_id, and injects the run input", function()
            local res = select(1, compiler.compile(doc(
                { fn("t"), fn("a", { ref = "m:a" }) }, { e("e0", "t", "a") }), { workflow_id = "wf-1", version = 1 }))
            test.is_true((res :: Map).ok)
            local fresh = select(1, compiler.remint((res :: Map).commands, counter(), { hello = "world" }))

            -- no CREATE_NODE keeps its def id as the engine node_id; def_node_id survives.
            for _, c in ipairs(fresh :: { Map }) do
                if c.type == consts.COMMAND_TYPES.CREATE_NODE then
                    local p = c.payload :: Map
                    test.not_nil((p.metadata :: Map).def_node_id)
                    test.is_true(tostring(p.node_id):find("^id%-") ~= nil, "node id was reminted")
                end
                if c.type == consts.COMMAND_TYPES.CREATE_DATA then
                    local p = c.payload :: Map
                    if tostring(p.data_type) == consts.DATA_TYPE.WORKFLOW_INPUT then
                        test.eq((p.content :: Map).hello, "world")
                    end
                end
            end

            -- a data_target that pointed at def id "a" now points at a's reminted id.
            local entry = nil
            for _, c in ipairs(fresh :: { Map }) do
                if c.type == consts.COMMAND_TYPES.CREATE_NODE and tostring(((c.payload :: Map).metadata :: Map).def_node_id) == "t" then entry = c end
            end
            local tg = (((entry :: Map).payload :: Map).config.data_targets :: { Map })[1]
            test.is_true(tostring(tg.node_id):find("^id%-") ~= nil, "edge target reminted")
        end)

        test.it("remints iteration input route targets with their template nodes", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    n("p", "for_each", { config = { source_array_key = "items" } }),
                    fn("item", { ref = "m:item" }),
                    n("join", "combine", { config = { mode = "wait_all" } }),
                }, {
                    e("e0", "t", "p"),
                    e("body-item", "p", "item", { source_port = "body" }),
                    e("body-join", "p", "join", { source_port = "body" }),
                    e("item-join", "item", "join"),
                }), { workflow_id = "wf-routes", version = 1 }))
            test.is_true((res :: Map).ok)

            local fresh, ids, err = compiler.remint((res :: Map).commands, counter(), {})
            test.is_nil(err)
            local parallel: Map? = nil
            for _, command in ipairs(fresh :: { Map }) do
                if command.type == consts.COMMAND_TYPES.CREATE_NODE
                    and tostring(((command.payload :: Map).metadata :: Map).def_node_id) == "p" then
                    parallel = command.payload :: Map
                end
            end
            test.not_nil(parallel)
            local routes = (((parallel :: Map).config :: Map).iteration_input_routes :: { Map })
            test.eq(tostring(routes[1].node_id), tostring((ids :: Map).item))
            test.eq(tostring(routes[2].node_id), tostring((ids :: Map).join))
        end)

        test.it("injects a namespaced run context without a second node context dialect", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("a", { ref = "m:a" }),
                },
                { e("e0", "t", "a") }), { workflow_id = "wf-context", version = 7 }))
            test.is_true((res :: Map).ok)

            local fresh = select(1, compiler.remint((res :: Map).commands, counter(), { hello = "world" }, {
                run_id = "run-context",
                dataflow_id = "df-context",
                version = 7,
            }))

            for _, c in ipairs(fresh :: { Map }) do
                if c.type == consts.COMMAND_TYPES.CREATE_NODE then
                    local p = (c :: Map).payload :: Map
                    local md = p.metadata :: Map
                    local context = (p.config :: Map).context :: Map
                    local run_context = context.run_context :: Map
                    test.eq(tostring(run_context.run_id), "run-context")
                    test.eq(tostring(run_context.dataflow_id), "df-context")
                    test.eq(tostring((run_context.flow_ref :: Map).kind), "flow")
                    test.eq(tostring((run_context.flow_ref :: Map).id), "wf-context")
                    test.eq(tonumber((run_context.flow_ref :: Map).version), 7)
                    test.is_nil(run_context.workflow_id)
                    test.is_nil(run_context.version)
                    test.eq(tostring(run_context.def_node_id), tostring(md.def_node_id))
                    test.eq(context.component_id, "wf-context")
                    test.is_nil(context.trace_source)
                end
            end
        end)

        test.it("remints a directly lowered Block while preserving run context", function()
            local res = select(1, compiler.compile(doc(
                { fn("t"), declared_step("h", "review", { config = { prompt = "Review" } }) },
                { e("e0", "t", "h") }), {
                    workflow_id = "wf-await", version = 1, blocks = REVIEW_KIND,
                }))
            test.is_true((res :: Map).ok)
            local fresh = select(1, compiler.remint((res :: Map).commands, counter(), {}, {
                run_id = "run-1",
                dataflow_id = "df-1",
            }))
            local wrapper = nil
            for _, c in ipairs(fresh :: { Map }) do
                if c.type == consts.COMMAND_TYPES.CREATE_NODE and tostring(((c.payload :: Map).metadata :: Map).def_node_id) == "h" then
                    wrapper = c
                end
            end
            local p = (wrapper :: Map).payload :: Map
            test.eq(tostring(p.node_type), consts.NODE_TYPE.FUNC)
            test.eq(tostring((p.config :: Map).func_id), "example.review:run")
            local run_context = (((p.config :: Map).context :: Map).run_context :: Map)
            test.eq(tostring(run_context.run_id), "run-1")
            test.eq(tostring(run_context.dataflow_id), "df-1")
            test.eq(tostring((run_context.flow_ref :: Map).id), "wf-await")
            test.eq(tonumber((run_context.flow_ref :: Map).version), 1)
        end)

        test.it("remints unique run ids while preserving stable structure and def mappings", function()
            local document = doc(
                {
                    fn("t"),
                    n("p", "for_each", { config = { source_array_key = "items" } }),
                    fn("item", { ref = "m:item" }),
                    fn("done", { ref = "m:done" }),
                },
                {
                    e("e0", "t", "p"),
                    e("body", "p", "item", { source_port = "body" }),
                    e("e1", "p", "done"),
                })
            local first_compile = select(1, compiler.compile(document, { workflow_id = "wf", version = 1 }))
            local second_compile = select(1, compiler.compile(document, { workflow_id = "wf", version = 1 }))
            test.is_true((first_compile :: Map).ok)
            test.is_true((second_compile :: Map).ok)

            local function def_sequence(cmds: { Map }): string
                local defs: { string } = {}
                for _, c in ipairs(cmds) do
                    if c.type == consts.COMMAND_TYPES.CREATE_NODE then
                        defs[#defs + 1] = tostring(((c.payload :: Map).metadata :: Map).def_node_id)
                    end
                end
                return table.concat(defs, ",")
            end
            test.eq(def_sequence((first_compile :: Map).commands), def_sequence((second_compile :: Map).commands))

            local gen = counter()
            local run1, map1 = compiler.remint((first_compile :: Map).commands, gen, {})
            local run2, map2 = compiler.remint((first_compile :: Map).commands, gen, {})
            local seen: { [string]: boolean } = {}
            for _, id in pairs(map1 :: Map) do seen[tostring(id)] = true end
            for _, id in pairs(map2 :: Map) do
                test.is_true(seen[tostring(id)] ~= true, "second run receives unique node ids")
            end

            local function invert(m: Map): Map
                local out: Map = {}
                for def_id, fresh_id in pairs(m) do out[tostring(fresh_id)] = tostring(def_id) end
                return out
            end

            local function structure(cmds: { Map }, id_map: Map): string
                local reverse = invert(id_map)
                local rows: { string } = {}
                for _, c in ipairs(cmds) do
                    if c.type == consts.COMMAND_TYPES.CREATE_NODE then
                        local p = c.payload :: Map
                        local def_id = tostring((p.metadata :: Map).def_node_id)
                        local parent = reverse[tostring(p.parent_node_id or "")] or ""
                        local targets: { string } = {}
                        for _, tg in ipairs((p.config.data_targets or {}) :: { Map }) do
                            targets[#targets + 1] = reverse[tostring(tg.node_id or "")] or tostring(tg.data_type)
                        end
                        table.sort(targets)
                        rows[#rows + 1] = def_id .. "|" .. tostring(p.node_type) .. "|" .. tostring(p.status) .. "|" .. parent .. "|" .. table.concat(targets, ",")
                    end
                end
                table.sort(rows)
                return table.concat(rows, "\n")
            end

            test.eq(structure(run1 :: { Map }, map1 :: Map), structure(run2 :: { Map }, map2 :: Map))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
