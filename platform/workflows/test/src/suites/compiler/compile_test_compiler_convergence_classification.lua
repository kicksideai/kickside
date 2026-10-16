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

    test.describe("compiler: convergence classification", function()
        test.it("lowers both Combine convergence modes explicitly", function()
            local canonical = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("fan", { ref = "t:fan" }),
                    fn("l", { ref = "t:l" }),
                    fn("r", { ref = "t:r" }),
                    n("all", "combine", { config = { mode = "wait_all", output_mode = "array" } }),
                    n("first", "combine", { config = { mode = "first_wins" } }),
                },
                {
                    e("e0", "t", "fan"),
                    e("e1", "fan", "l"), e("e2", "fan", "r"),
                    e("e3", "l", "all"), e("e4", "r", "all"),
                    e("e5", "l", "first"), e("e6", "r", "first"),
                }), {}))
            test.is_true((canonical :: Map).ok, tostring((canonical :: Map).errors and (canonical :: Map).errors[1] and ((canonical :: Map).errors[1] :: Map).message))
            local all = node_cmd((canonical :: Map).commands, "all")
            local first = node_cmd((canonical :: Map).commands, "first")
            test.eq(tostring(((all :: Map).payload :: Map).node_type), consts.NODE_TYPE.STATE)
            test.eq(#((((all :: Map).payload :: Map).config.inputs :: Map).required :: { any }), 2)
            test.eq(tostring(((all :: Map).payload :: Map).config.output_mode), "array")
            test.is_nil(((first :: Map).payload :: Map).config.inputs)
        end)

        test.it("refuses wait-all Combine fed only by mutually-exclusive Branch arms", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("decide", { ref = "t:decide" }),
                    n("branch", "branch", { config = { predicate = "approved" } }),
                    fn("yes", { ref = "t:yes" }),
                    fn("no", { ref = "t:no" }),
                    n("combine", "combine", { config = { mode = "wait_all" } }),
                },
                {
                    e("e0", "t", "decide"), e("e1", "decide", "branch"),
                    e("yes", "branch", "yes", { source_port = "true" }),
                    e("no", "branch", "no", { source_port = "false" }),
                    e("e2", "yes", "combine"), e("e3", "no", "combine"),
                }), {}))
            test.is_false((res :: Map).ok)
            test.is_true(error_codes(res).combine_wait_all_exclusive_paths)
            test.contains(tostring((((res :: Map).errors :: { Map })[1] :: Map).message), "first_wins")
        end)

        test.it("wait-all Combine declares inputs.required for every branch", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("fan", { ref = "t:fan" }),
                    fn("l", { ref = "t:l" }),
                    fn("r", { ref = "t:r" }),
                    n("j", "combine", { config = { mode = "wait_all" } }),
                },
                {
                    e("e0", "t", "fan"),
                    e("e1", "fan", "l"), e("e2", "fan", "r"),
                    e("e3", "l", "j"), e("e4", "r", "j"),
                }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            local j = node_cmd((res :: Map).commands, "j")
            local cfg = ((j :: Map).payload :: Map).config
            test.not_nil(cfg.inputs, "wait-all Combine declares inputs")
            test.eq(#(((cfg.inputs :: Map).required) :: { any }), 2)
        end)

        test.it("first-wins Combine drops inputs.required", function()
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("fan", { ref = "t:fan" }),
                    fn("l", { ref = "t:l" }),
                    fn("r", { ref = "t:r" }),
                    n("j", "combine", { config = { mode = "first_wins" } }),
                },
                {
                    e("e0", "t", "fan"),
                    e("e1", "fan", "l"), e("e2", "fan", "r"),
                    e("e3", "l", "j"), e("e4", "r", "j"),
                }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            local j = node_cmd((res :: Map).commands, "j")
            test.is_nil(((j :: Map).payload :: Map).config.inputs, "first arrival fires on the first completed leg")
        end)

        test.it("exclusive Branch convergence does not declare inputs.required", function()
            -- both branches converge on `end`, but only one fires (mutually exclusive):
            -- declaring required would deadlock the untaken branch.
            local res = select(1, compiler.compile(doc(
                {
                    fn("t"),
                    fn("d", { ref = "t:decide" }),
                    n("b", "branch", { config = { predicate = "ok" } }),
                    fn("yes", { ref = "t:yes" }),
                    fn("no", { ref = "t:no" }),
                    fn("end", { ref = "t:end" }),
                },
                {
                    e("e0", "t", "d"),
                    e("e1", "d", "b"),
                    e("e2", "b", "yes", { source_port = "true" }),
                    e("e3", "b", "no", { source_port = "false" }),
                    e("e4", "yes", "end"), e("e5", "no", "end"),
                }), {}))
            test.is_true((res :: Map).ok, tostring((res :: Map).errors and (res :: Map).errors[1] and ((res :: Map).errors[1] :: Map).message))
            local endc = node_cmd((res :: Map).commands, "end")
            local cfg = ((endc :: Map).payload :: Map).config
            test.is_nil(cfg.inputs, "exclusive convergence declares no inputs.required")
            -- both incoming edges keep the default discriminator (fire on first).
            local d = node_cmd((res :: Map).commands, "yes")
            local tg = (((d :: Map).payload :: Map).config.data_targets :: { Map })[1]
            test.eq(tostring(tg.discriminator), "default")
        end)
    end)





end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
