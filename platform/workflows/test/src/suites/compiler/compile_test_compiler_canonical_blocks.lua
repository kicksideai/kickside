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
    ["app:tool_count_files"] = {
        id = "app:tool_count_files",
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
        execution = { kind = "tool", tool_id = "app:tool_count_files" },
    },
}

local function define_tests()




    test.describe("compiler: canonical Blocks", function()
        test.it("lowers a virtual tool Block directly and freezes its exact tool id", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    n("count", "block", {
                        ref = "app:tool_count_files",
                        title = "Count Files",
                        config = { pattern = "*.csv" },
                    }),
                },
                { e("e0", "t", "count") }), { blocks = TOOL_KIND }))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))

            local count = node_cmd((res :: Map).commands, "count")
            test.not_nil(count)
            local payload = (count :: Map).payload :: Map
            test.eq(tostring(payload.node_type), consts.NODE_TYPE.FUNC)
            local cfg = payload.config :: Map
            test.eq(cfg.func_id, "app:tool_count_files")
            test.eq((cfg.args :: Map).pattern, "*.csv")
            test.is_nil(cfg.input_transform)
            local tools = (res :: Map).allowlist.tools :: { any }
            test.eq(#tools, 2)
            test.eq(tools[1], "app:engine_linear")
            test.eq(tools[2], "app:tool_count_files")
        end)

        test.it("lowers an exact Block directly with declared port routing", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    declared_step("r", "research", { config = { agent_id = "a:x", prompt = "p" } }),
                    fn("done", { ref = "m:done" }),
                },
                {
                    e("e0", "t", "r"),
                    e("e1", "r", "done", { source_port = "result" }),
                }), { blocks = RESEARCH_KIND }))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))

            local r = node_cmd((res :: Map).commands, "r")
            test.not_nil(r)
            local rp = (r :: Map).payload :: Map
            test.eq(tostring(rp.node_type), consts.NODE_TYPE.FUNC)
            local cfg = rp.config :: Map
            test.eq(tostring(cfg.func_id), "kickside.research.workflow:run")
            test.eq(tostring((((cfg.args :: Map).config :: Map).agent_id)), "a:x")
            test.eq(tostring((((cfg.args :: Map).config :: Map).prompt)), "p")

            local tg = first_target(res, "r", "done")
            test.eq(tostring((tg :: Map).condition), "output.outcome == 'result'")
        end)

        test.it("refuses a Block missing a required config field", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    declared_step("r", "research", { config = { prompt = "p" } }),
                },
                { e("e0", "t", "r") }), { blocks = RESEARCH_KIND }))
            test.is_false((res :: Map).ok)
            test.is_true(error_codes(res).node_config_missing)
        end)

        test.it("requires each declared Block config field to be concretely bound", function()
            local missing = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    declared_step("knowledge_sink", "sink", { config = {} }),
                },
                { e("e0", "t", "knowledge_sink") }), { blocks = SINK_KIND }))
            test.is_false((missing :: Map).ok)
            test.is_true(error_codes(missing).node_config_missing)
            local message = error_message(missing, "node_config_missing")
            test.contains(message, "knowledge_sink")
            test.contains(message, "kb_id")

            local bound = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    declared_step("knowledge_sink", "sink", { config = {
                        kb_id = "knowledge-base-1",
                    } }),
                }, { e("e0", "t", "knowledge_sink") }), { blocks = SINK_KIND }))
            test.is_true((bound :: Map).ok, tostring((bound :: Map).errors and (bound :: Map).errors[1] and ((bound :: Map).errors[1] :: Map).message))
        end)

        test.it("enforces a declared Block config schema, including nested and bounded values", function()
            local function compile_config(config: Map): Map
                return select(1, compiler.compile(doc({
                    fn("t"),
                    declared_step("review", "review", { config = config }),
                }, { e("e0", "t", "review") }), { blocks = REVIEW_KIND })) :: Map
            end

            test.is_true(compile_config({
                prompt = "Approve?", priority = "urgent",
                form = { type = "object", required = { "reason" } },
            }).ok)

            for _, bad in ipairs({
                { config = { prompt = 42 }, contains = "must be string" },
                { config = { prompt = "Approve?", priority = "critical" }, contains = "allowed values" },
                { config = { prompt = "Approve?", extra = true }, contains = "not declared" },
                { config = { prompt = "Approve?", form = { type = "array" } }, contains = "allowed values" },
                { config = { prompt = "Approve?", form = { type = "object", required = { "a", "b", "c", "d", "e" } } }, contains = "at most 4" },
            }) do
                local result = compile_config((bad :: Map).config)
                test.is_false(result.ok)
                test.is_true(error_codes(result).node_config_invalid)
                test.contains(error_message(result, "node_config_invalid"), tostring((bad :: Map).contains))
            end
        end)
    end)


end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
