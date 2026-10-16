local test = require("test")
local builders = require("builders")
local graph = require("graph")
local materialize = require("materialize")
local compiler = require("compiler")
local consts = require("consts")
local block_catalog = require("block_catalog")

type Map = { [string]: any }
local doc, n, fn = builders.doc, builders.n, builders.fn
local agent_step, wait_step, e = builders.agent_step, builders.wait_step, builders.e

local function first_error_message(res: any): string
    local errors = type(res) == "table" and (res :: Map).errors or nil
    local first = type(errors) == "table" and (errors :: { any })[1] or nil
    return tostring(type(first) == "table" and (first :: Map).message or "")
end

local function error_codes(res: any): { [string]: boolean }
    local set: { [string]: boolean } = {}
    for _, err in ipairs((res :: Map).errors or {}) do set[tostring((err :: Map).code)] = true end
    return set
end

local function node_cmd(commands: { Map }, def_id: string): Map?
    for _, c in ipairs(commands) do
        if c.type == consts.COMMAND_TYPES.CREATE_NODE then
            local p = c.payload :: Map
            local md = type(p.metadata) == "table" and (p.metadata :: Map) or {}
            if tostring(md.def_node_id or "") == def_id then return c end
        end
    end
    return nil
end

local function targets(commands: { Map }, def_id: string): { Map }
    local cmd = node_cmd(commands, def_id)
    if not cmd then return {} end
    return ((((cmd :: Map).payload :: Map).config :: Map).data_targets or {}) :: { Map }
end

local function target(commands: { Map }, def_id: string, to_id: string): Map?
    for _, tg in ipairs(targets(commands, def_id)) do
        if tostring(tg.node_id or "") == to_id then return tg end
    end
    return nil
end

local function compile_full(document: Map): ({ Map }, Map)
    local catalog = select(1, block_catalog.catalog())
    local options = { workflow_id = "wf-gauntlet", version = 1, blocks = catalog }
    local ir, gerrors = graph.build(document, options)
    test.not_nil(ir, gerrors and gerrors[1] and tostring((gerrors[1] :: Map).message) or "graph build failed")
    test.eq(#gerrors, 0)

    local commands, merr = materialize.emit(ir, options)
    test.not_nil(commands, tostring(merr))

    local res = select(1, compiler.compile(document, options))
    test.is_true((res :: Map).ok, first_error_message(res))
    test.eq(#((commands :: { Map })), #(((res :: Map).commands) :: { Map }))
    return commands :: { Map }, ir :: Map
end

local function define_tests()
    test.describe("workflow coverage gauntlet: compile stream", function()
        test.it("covers sequential transforms and gated fan-out mappings", function()
            local commands = compile_full(doc({
                fn("t"),
                fn("a", { ref = "m:a" }),
                fn("b", { ref = "m:b" }),
                n("condition", "branch", { config = { predicate = "ok" } }),
                fn("c", { ref = "m:c" }),
                fn("skip", { ref = "m:skip" }),
            }, {
                e("e0", "t", "a", { transform = { v = 1, mode = "expr", expr = "{ text: input.text, count: input.count }" } }),
                e("e1", "a", "b", { transform = "output" }),
                e("e2", "b", "condition"),
                e("e3", "condition", "c", { source_port = "true", transform = "{ payload: output, seen: true }" }),
                e("e4", "condition", "skip", { source_port = "false" }),
            }))
            test.eq(tostring((target(commands, "t", "a") :: Map).transform), "{ text: output.text, count: output.count }")
            test.eq(tostring((target(commands, "a", "b") :: Map).transform), "output")
            test.eq(tostring((target(commands, "b", "c") :: Map).condition), "output.ok")
            test.eq(tostring((target(commands, "b", "skip") :: Map).condition), "!(output.ok)")
        end)

        test.it("dissolves branch arms into an exclusive merge without inputs.required", function()
            local commands = compile_full(doc({
                fn("t"),
                fn("decide", { ref = "m:decide" }),
                n("if", "branch", { config = { predicate = "route == 'a'" } }),
                fn("a", { ref = "m:a" }),
                fn("b", { ref = "m:b" }),
                n("m", "combine", { config = { mode = "first_wins", output_mode = "object" } }),
            }, {
                e("e0", "t", "decide"),
                e("e1", "decide", "if"),
                e("true", "if", "a", { source_port = "true", transform = "{ arm: 'a', source: output }" }),
                e("false", "if", "b", { source_port = "false", transform = "{ arm: 'b', source: output }" }),
                e("ea", "a", "m"),
                e("eb", "b", "m"),
            }))
            test.is_nil(node_cmd(commands, "if"))
            test.eq(tostring((target(commands, "decide", "a") :: Map).condition), "output.route == 'a'")
            test.eq(tostring((target(commands, "decide", "b") :: Map).condition), "!(output.route == 'a')")
            local merge = node_cmd(commands, "m") :: Map
            test.eq(tostring((merge.payload :: Map).node_type), consts.NODE_TYPE.STATE)
            test.is_nil(((merge.payload :: Map).config :: Map).inputs)
        end)

        test.it("covers for_each item templates, heterogeneous fan-in, join wait-all, and downstream branch", function()
            local commands = compile_full(doc({
                fn("t"),
                n("p", "for_each", { config = { source_array_key = "items", batch_size = 2, continue_on_error = true } }),
                fn("item_func", { ref = "m:item" }),
                agent_step("item_agent", { config = { agent_id = "agents:item-review", model = "class:fast" } }),
                fn("side", { ref = "m:side" }),
                n("j", "combine", { config = { mode = "wait_all", output_mode = "object" } }),
                n("after", "branch", { config = { predicate = "in1.total_iterations > 0" } }),
                fn("ok", { ref = "m:ok" }),
                fn("empty", { ref = "m:empty" }),
            }, {
                e("e0", "t", "p"),
                e("body1", "p", "item_func", { source_port = "body" }),
                e("body2", "item_func", "item_agent"),
                e("side", "t", "side", { transform = "{ source: output }" }),
                e("pj", "p", "j"),
                e("sj", "side", "j"),
                e("jb", "j", "after"),
                e("true", "after", "ok", { source_port = "true" }),
                e("false", "after", "empty", { source_port = "false" }),
            }))
            local p = node_cmd(commands, "p") :: Map
            test.eq(tostring((p.payload :: Map).node_type), consts.NODE_TYPE.PARALLEL)
            test.eq(tostring((((p.payload :: Map).config :: Map).source_array_key)), "items")
            test.eq(tostring((node_cmd(commands, "item_func") :: Map).payload.parent_node_id), "p")
            test.eq(tostring((node_cmd(commands, "item_agent") :: Map).payload.parent_node_id), "p")
            test.eq(tostring((node_cmd(commands, "item_agent") :: Map).payload.node_type), "userspace.dataflow.node.agent:node")
            local join = node_cmd(commands, "j") :: Map
            local required = ((((join.payload :: Map).config :: Map).inputs :: Map).required) :: { any }
            test.eq(#required, 2)
            test.not_nil(target(commands, "j", "ok"))
            test.not_nil(target(commands, "j", "empty"))
        end)

        test.it("covers cycle, signal, declared Await, nested branches, and illegal feedback", function()
            local commands = compile_full(doc({
                fn("t"),
                n("c", "cycle", {
                    config = {
                        continue_condition = "iteration < 3",
                        max_iterations = 4,
                        initial_state = { count = 0 },
                    },
                }),
                fn("cycle_step", { ref = "app:coverage_cycle_step" }),
                wait_step("sig", { config = { signal_id = "sig:gauntlet" } }),
                n("h", "block", { ref = "app:block.test_external_wait", config = {} }),
                n("b1", "branch", { config = { predicate = "ready" } }),
                n("b2", "branch", { config = { predicate = "approved" } }),
                fn("approve", { ref = "m:approve" }),
                fn("review", { ref = "m:review" }),
                fn("reject", { ref = "m:reject" }),
            }, {
                e("e0", "t", "c"),
                e("cycle-body", "c", "cycle_step", { source_port = "body" }),
                e("e1", "c", "sig"),
                e("e2", "sig", "h"),
                e("yes", "h", "b1", { source_port = "then" }),
                e("no", "h", "reject", { source_port = "else" }),
                e("b1t", "b1", "b2", { source_port = "true" }),
                e("b1f", "b1", "review", { source_port = "false" }),
                e("b2t", "b2", "approve", { source_port = "true" }),
                e("b2f", "b2", "review", { source_port = "false" }),
            }))
            test.eq(tostring((node_cmd(commands, "c") :: Map).payload.node_type), consts.NODE_TYPE.CYCLE)
            test.eq(tostring(((node_cmd(commands, "c") :: Map).payload.config :: Map).continue_condition), "iteration < 3")
            test.eq(tostring((node_cmd(commands, "sig") :: Map).payload.node_type), "kickside.blocks:await")
            test.eq(tostring((node_cmd(commands, "h") :: Map).payload.node_type), "kickside.blocks:await")
            test.eq(tostring((target(commands, "h", "approve") :: Map).condition), "(output.outcome == 'continue') && ((output.ready) && (output.approved))")
            test.eq(tostring((target(commands, "h", "reject") :: Map).condition), "output.outcome == 'stop'")

            local bad_feedback = select(1, compiler.compile(doc({
                fn("t"),
                fn("u", { ref = "m:u" }),
                n("b", "branch", { config = { predicate = "ok" } }),
                fn("arm", { ref = "m:arm" }),
                fn("done", { ref = "m:done" }),
            }, {
                e("e0", "t", "u"),
                e("e1", "u", "b"),
                e("true", "b", "arm", { source_port = "true" }),
                e("back", "arm", "u"),
                e("false", "b", "done", { source_port = "false" }),
            }), { blocks = select(1, block_catalog.catalog()) }))
            test.is_false((bad_feedback :: Map).ok)
            test.is_true(error_codes(bad_feedback).graph_cycle)

            -- A cycle's `body` port now roots its repeated subgraph, just like parallel,
            -- so a body edge is valid and the body node lowers as a template child.
            local cycle_body = select(1, compiler.compile(doc({
                fn("t"),
                n("c2", "cycle", { config = { continue_condition = "iteration < 2" } }),
                fn("step", { ref = "m:step" }),
            }, {
                e("e0", "t", "c2"),
                e("body", "c2", "step", { source_port = "body" }),
            }), { blocks = select(1, block_catalog.catalog()) }))
            test.is_true((cycle_body :: Map).ok)
            test.is_nil(error_codes(cycle_body).edge_port_invalid)
        end)
    end)

end

local cases = test.run_cases(define_tests)
return { run = function(options: any): any return cases(options) end }
