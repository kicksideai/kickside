local test = require("test")
local uuid_v4 = require("uuid").v4
local json = require("json")
local workflow = require("workflow")
local workflow_state = require("workflow_state")
local version_publish = require("version_publish")
local store = require("store")
local types = require("types")

local C = types.COMMAND
local E = types.EVENT

local function cmd(ctype: string, body: any): any
    if ctype == C.NODE_ADD and type(body) == "table" then
        local node = body :: any
        if node.kind == "block" and type(node.ref) ~= "string" then
            node.ref = "app:block.engine_linear"
        end
    end
    return { type = ctype, body = body }
end

local function wid(): string
    return uuid_v4()
end

local function find_by_id(list: any, id: string): any
    for _, item in ipairs(type(list) == "table" and list or {}) do
        if tostring((item :: any).id) == id then return item end
    end
    return nil
end

local function define_tests()
    -- ─── batch validation (pure fold, no DB) ─────────────────────────────
    test.describe("Workflow batch validation", function()
        test.it("stores flat labels as definition events and folds their latest set", function()
            local id = wid()
            local first, first_err = workflow.apply(id, {
                cmd(C.LABELS_SET, { labels = { "Revenue", "Priority", "Revenue" } }),
            }, "tester")
            test.is_nil(first_err)
            test.eq(((first :: any).events[1] :: any).type, E.LABELS_SET)

            local detail, detail_err = workflow.state(id)
            test.is_nil(detail_err)
            test.eq(#((detail :: any).labels), 2)
            test.eq(((detail :: any).labels)[1], "Revenue")
            test.eq(((detail :: any).labels)[2], "Priority")

            local _, second_err = workflow.apply(id, {
                cmd(C.LABELS_SET, { labels = { "Customer success" } }),
            }, "tester")
            test.is_nil(second_err)
            local latest = select(1, workflow.state(id))
            test.eq(#((latest :: any).labels), 1)
            test.eq(((latest :: any).labels)[1], "Customer success")

            local _, bad_err = workflow.apply(id, {
                cmd(C.LABELS_SET, { labels = { "Valid", 42 } }),
            }, "tester")
            test.contains(tostring(bad_err), "label at [2] must be a string")
        end)

        test.it("accepts a batch where an edge references nodes added earlier in the batch", function()
            local state, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block", title = "Prepare" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block", title = "Do" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "b" }),
            })
            test.is_nil(err)
            test.not_nil((state :: any).nodes.a)
            test.not_nil((state :: any).edges.e)
        end)

        test.it("folds canvas geometry handles away while retaining declared ports", function()
            local state, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block", title = "Prepare" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block", title = "Do" }),
                cmd(C.NODE_ADD, { id = "c", kind = "block", title = "Recover" }),
                cmd(C.EDGE_ADD, {
                    id = "plain", source_id = "a", target_id = "b",
                    source_port = "out-bottom", target_port = "in-top",
                }),
                cmd(C.EDGE_ADD, {
                    id = "declared", source_id = "b", target_id = "c",
                    source_port = "failed", target_port = "in-left",
                }),
            })
            test.is_nil(err)
            test.is_nil((state :: any).edges.plain.source_port)
            test.is_nil((state :: any).edges.plain.target_port)
            test.eq((state :: any).edges.declared.source_port, "failed")
            test.is_nil((state :: any).edges.declared.target_port)
        end)

        test.it("freezes an authored edge expression as mapping v1 with input", function()
            local state, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block", title = "Prepare" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block", title = "Do" }),
                cmd(C.EDGE_ADD, {
                    id = "e",
                    source_id = "a",
                    target_id = "b",
                    transform = "{ contact_id: output.record_id, prior: output }",
                }),
            })
            test.is_nil(err)
            local mapping = (state :: any).edges.e.transform
            test.eq(mapping.v, 1)
            test.eq(mapping.mode, "expr")
            test.eq(mapping.expr, "{ contact_id: input.record_id, prior: input }")
            test.is_nil(mapping.generated)
        end)

        test.it("rejects an unversioned edge mapping object", function()
            local _, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block", title = "Prepare" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block", title = "Do" }),
                cmd(C.EDGE_ADD, {
                    id = "e", source_id = "a", target_id = "b",
                    transform = { expr = "{ id: output.id }" },
                }),
            })
            test.contains(tostring(err), "mapping v1 is required")
        end)

        test.it("projects a declaration-owned Failed output port with its error schema", function()
            local id = wid()
            local _, apply_err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "work", kind = "block", ref = "app:block.engine_item_or_fail", config = {} }),
            }, "tester")
            test.is_nil(apply_err)

            local state, state_err = workflow.state(id)
            test.is_nil(state_err)
            local work = find_by_id((state :: any).nodes, "work") :: any
            test.not_nil(work)
            local ports = work.ports :: { any }
            test.eq(#ports, 2)
            test.eq(ports[2].id, "failed")
            test.eq(ports[2].direction, "out")
            local schema = ports[2].schema :: any
            test.eq(schema.required[2], "message")
            test.eq(schema.properties.code.type, "string")
            test.eq(schema.properties.message.type, "string")
            test.eq(schema.additionalProperties, false)
        end)

        test.it("rejects an edge whose target node does not exist", function()
            local _, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "missing" }),
            })
            test.contains(tostring(err), "edge target node not found")
        end)

        test.it("rejects a self-loop edge", function()
            local _, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "a" }),
            })
            test.contains(tostring(err), "self-loop refused")
        end)

        test.it("rejects an unknown node kind", function()
            local _, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "wormhole" }),
            })
            test.contains(tostring(err), "unknown node kind")
        end)


        test.it("accepts exact Blocks declared by installed modules", function()
            local state, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "r", kind = "block", ref = "kickside.research:block", title = "Research" }),
            })
            test.is_nil(err)
            test.not_nil((state :: any).nodes.r)
            test.eq((state :: any).nodes.r.kind, "block")
            test.eq((state :: any).nodes.r.ref, "kickside.research:block")
        end)

        test.it("rejects a duplicate node in the same batch", function()
            local _, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
            })
            test.contains(tostring(err), "node already exists")
        end)

        test.it("rejects an unknown command type", function()
            local _, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd("node.frobnicate", { id = "a" }),
            })
            test.contains(tostring(err), "unknown command")
        end)

        test.it("dedups a repeated remove instead of failing the batch", function()
            local state, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.NODE_REMOVE, { id = "a" }),
                cmd(C.NODE_REMOVE, { id = "a" }),
            })
            test.is_nil(err)
            test.is_nil((state :: any).nodes.a)
        end)

        test.it("refuses a reserved (__-prefixed) node/edge/note id", function()
            local _, nerr = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "__viewport__", kind = "block" }),
            })
            test.contains(tostring(nerr), "reserved node id refused")
            local _, eerr = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "__x", source_id = "a", target_id = "b" }),
            })
            test.contains(tostring(eerr), "reserved edge id refused")
            local _, noterr = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NOTE_ADD, { id = "__n", body = "hi" }),
            })
            test.contains(tostring(noterr), "reserved note id refused")
        end)

        test.it("dedups clearing a position that has no layout row (no event, no undo)", function()
            local id = wid()
            local res, err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.LAYOUT_CLEAR_POSITION, { node_id = "a" }),
            }, "tester")
            test.is_nil(err)
            -- only the node.added event is recorded; the empty clear contributes nothing.
            test.eq(#(res :: any).events, 1)
            test.eq((res :: any).head_seq, 1)
        end)

        test.it("rejects a command whose body exceeds the per-command size cap", function()
            local id = wid()
            local _, err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block", config = { blob = string.rep("y", 80 * 1024) } }),
            }, "tester")
            test.contains(tostring(err), "command_too_large")
            test.eq(select(1, workflow.state(id)).counts.nodes, 0)
        end)

        test.it("rejects a batch whose folded document exceeds the document size cap", function()
            local id = wid()
            -- many mid-sized nodes whose folded document blows past the 256KB cap while
            -- each command body stays under the per-command cap.
            local cmds: { any } = {}
            for i = 1, 12 do
                cmds[#cmds + 1] = cmd(C.NODE_ADD, { id = "n" .. tostring(i), kind = "block", config = { blob = string.rep("z", 30 * 1024) } })
            end
            local _, err = workflow.apply(id, cmds, "tester")
            test.contains(tostring(err), "document_too_large")
            test.eq(select(1, workflow.state(id)).counts.nodes, 0)
        end)
    end)

    -- ─── writer concurrency (single-transaction validate+append+project) ──

    -- ─── transactional atomicity + read model (DB) ───────────────────────

    -- ─── cascade remove (DB) ─────────────────────────────────────────────

    -- ─── layout + viewport (DB) ──────────────────────────────────────────

    -- ─── seq monotonicity + isolation (DB) ───────────────────────────────

    -- ─── delete purge (DB) ───────────────────────────────────────────────
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
