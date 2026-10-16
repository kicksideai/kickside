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



        -- The engine reserves the agent-node inputs `context` (merges into the
        -- arena), `model` and `agent_id` (overrides). A workflow delivers one
        -- payload object, so the lowering splits those carriers out of it; the
        -- whole payload stays visible under `input`.










        test.it("carries an edge transform into the produced data_target", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("a", { ref = "m:a" }),
                    fn("b", { ref = "m:b" }),
                },
                { e("e0", "t", "a"), e("e1", "a", "b", { transform = { v = 1, mode = "expr", expr = "input.value" } }) }), {}))
            test.is_true((res :: Map).ok)
            local tg = first_target(res, "a", "b")
            test.eq(tostring((tg :: Map).transform), "output.value")
        end)


        test.it("lowers mapping v1 input expressions through the engine output bridge", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("a", { ref = "m:a" }),
                    fn("b", { ref = "m:b" }),
                },
                { e("e0", "t", "a"), e("e1", "a", "b", {
                    transform = { v = 1, mode = "expr", expr = "{ contact_id: input.record_id, body: input }" },
                }) }), {}))
            test.is_true((res :: Map).ok)
            local tg = first_target(res, "a", "b")
            test.eq(tostring((tg :: Map).transform), "{ contact_id: output.record_id, body: output }")
        end)







        test.it("keeps explicit parallel body order with boundary nodes absent", function()
            local res = select(1, compiler.compile(doc(
                {
                    n("finish", "finish", { config = { output_schema = { type = "object" } } }),
                    n("start", "start", { config = { input_schema = { type = "object" } } }),
                    -- Authored before its template parent to prove structural order wins.
                    fn("item", { ref = "m:item" }),
                    n("parallel", "for_each", { config = { source_array_key = "items" } }),
                },
                {
                    e("entry", "start", "parallel"),
                    e("body", "parallel", "item", { source_port = "body" }),
                    e("done", "parallel", "finish", { source_port = "done" }),
                }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            local defs: { string } = {}
            for _, command in ipairs((res :: Map).commands :: { Map }) do
                if command.type == consts.COMMAND_TYPES.CREATE_NODE then
                    defs[#defs + 1] = tostring(((command.payload :: Map).metadata :: Map).def_node_id)
                end
            end
            test.eq(table.concat(defs, ","), "parallel,item")
            local parent_index, child_index = nil, nil
            for index, id in ipairs(defs) do
                if id == "parallel" then parent_index = index end
                if id == "item" then child_index = index end
            end
            test.is_true((parent_index :: number) < (child_index :: number))
            test.is_nil(node_cmd((res :: Map).commands, "start"))
            test.is_nil(node_cmd((res :: Map).commands, "finish"))
        end)

        test.it("compiles interface boundaries away while preserving input, success, and typed failure routing", function()
            local res = select(1, compiler.compile(doc(
                {
                    n("start", "start", { config = { input_schema = { type = "object", properties = { lead_id = { type = "string" } } } } }),
                    fn("work", { ref = "m:score" }),
                    n("finish", "finish", { config = { output_schema = { type = "object", properties = { score = { type = "number" } } } } }),
                    n("error", "error", { config = { error_schema = { type = "object", properties = { message = { type = "string" } } } } }),
                },
                {
                    e("e1", "start", "work", { source_port = "out" }),
                    e("e2", "work", "finish", { target_port = "in" }),
                    e("e3", "work", "error", {
                        source_port = "failed", target_port = "in",
                        transform = "{ mapped: true, reason: output }",
                    }),
                }), { workflow_id = "wf-partial", version = 4 }))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            test.eq(tostring((res :: Map).entry_id), "start")

            local entry_seen = false
            local runtime_nodes = 0
            for _, c in ipairs((res :: Map).commands :: { Map }) do
                if c.type == consts.COMMAND_TYPES.CREATE_DATA and tostring((c.payload :: Map).data_type) == consts.DATA_TYPE.NODE_INPUT then
                    entry_seen = tostring((c.payload :: Map).node_id) == "work"
                end
                if c.type == consts.COMMAND_TYPES.CREATE_NODE then runtime_nodes = runtime_nodes + 1 end
            end
            test.is_true(entry_seen, "the first real node receives workflow input directly")
            test.eq(runtime_nodes, 1)
            test.is_nil(node_cmd((res :: Map).commands, "start"))
            test.is_nil(node_cmd((res :: Map).commands, "finish"))
            test.is_nil(node_cmd((res :: Map).commands, "error"))

            local finish_target = (targets_of(res, "work") :: { Map })[1]
            test.eq(tostring(finish_target.data_type), consts.DATA_TYPE.WORKFLOW_OUTPUT)
            test.eq(tostring(finish_target.key), "result")

            local error_target = (error_targets_of(res, "work") :: { Map })[1]
            test.eq(tostring(error_target.data_type), consts.DATA_TYPE.WORKFLOW_OUTPUT)
            test.eq(tostring(error_target.discriminator), "error")
            test.is_nil(error_target.key)
            test.eq(tostring(error_target.transform), "{ mapped: true, reason: error }")
            test.eq(tostring(error_target.node_id), "work")

            local fresh, id_map = compiler.remint((res :: Map).commands, counter(), { lead_id = "lead-1" })
            local reminted_work = nil
            local reminted_entry = nil
            for _, c in ipairs(fresh :: { Map }) do
                if c.type == consts.COMMAND_TYPES.CREATE_NODE and tostring(((c.payload :: Map).metadata :: Map).def_node_id) == "work" then
                    reminted_work = c
                elseif c.type == consts.COMMAND_TYPES.CREATE_DATA and tostring((c.payload :: Map).data_type) == consts.DATA_TYPE.NODE_INPUT then
                    reminted_entry = c
                end
            end
            test.eq(((reminted_entry :: Map).payload.content :: Map).lead_id, "lead-1")
            test.eq(tostring(((reminted_entry :: Map).payload :: Map).node_id), tostring((id_map :: Map).work))
            local et = ((((reminted_work :: Map).payload :: Map).config.error_targets :: { Map })[1])
            test.eq(tostring(et.data_type), consts.DATA_TYPE.WORKFLOW_OUTPUT)
            test.eq(tostring(et.node_id), tostring((id_map :: Map).work))
            test.is_nil((id_map :: Map).start)
            test.is_nil((id_map :: Map).finish)
            test.is_nil((id_map :: Map).error)
        end)

        test.it("lowers a declared Failed edge as a normalized error target", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("work", { ref = "m:work", config = { attempt = 2 } }),
                    fn("recover", { ref = "m:recover" }),
                },
                {
                    e("e0", "t", "work"),
                    e("failed", "work", "recover", { source_port = "failed" }),
                }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))

            local work = node_cmd((res :: Map).commands, "work") :: Map
            local cfg = (work.payload :: Map).config :: Map
            test.eq((((cfg.args :: Map).config :: Map).attempt), 2)

            local failed = (error_targets_of(res, "work") :: { Map })[1]
            test.eq(tostring(failed.node_id), "recover")
            test.eq(tostring(failed.transform), "{ code: type(error) == 'string' ? 'execution_failed' : error.code, message: type(error) == 'string' ? error : error.message }")
        end)



    end)




end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
