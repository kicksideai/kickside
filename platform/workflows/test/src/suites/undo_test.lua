local test = require("test")
local uuid_v4 = require("uuid").v4
local workflow = require("workflow")
local workflow_state = require("workflow_state")
local workflow_inverse = require("workflow_inverse")
local undo = require("undo")
local types = require("types")
local process = require("process")
local security = require("security")
local funcs = require("funcs")
local channel = require("channel")
local time = require("time")

local C = types.COMMAND
local E = types.EVENT

local function cmd(ctype: string, body: any): any
    if ctype == C.NODE_ADD and type(body) == "table" then
        local node = body :: any
        if node.kind == "block" and type(node.ref) ~= "string" then node.ref = "app:block.engine_linear" end
    end
    return { type = ctype, body = body }
end

local function wid(): string
    return uuid_v4()
end

local function forward_of(events: any): any
    local out: { any } = {}
    for _, e in ipairs(events) do out[#out + 1] = { type = e.type, body = e.body } end
    return out
end

local function count_nodes(state: any): number
    return tonumber((state :: any).counts.nodes) or 0
end

local function define_tests()
    -- ─── pure tracker ────────────────────────────────────────────────────
    test.describe("Undo tracker", function()
        test.it("caps the undo stack at MAX_UNDO, dropping the oldest", function()
            local t = undo.new()
            for i = 1, types.MAX_UNDO + 5 do
                undo.record(t, { { type = "f", body = { n = i } } }, { { type = "i", body = { n = i } } })
            end
            test.eq(#t.undo, types.MAX_UNDO)
            test.eq(t.undo[1].forward[1].body.n, 6)
        end)

        test.it("clears the redo stack when a new batch is recorded", function()
            local t = undo.new()
            undo.record(t, { "f1" }, { "i1" })
            local entry = undo.take_undo(t)
            undo.finish_undo(t, entry)
            test.is_true(undo.can_redo(t))
            undo.record(t, { "f2" }, { "i2" })
            test.is_false(undo.can_redo(t))
        end)
    end)

    -- ─── inverse construction (pure) ─────────────────────────────────────
    test.describe("Inverse events", function()
        test.it("inverts an add batch to removes", function()
            local pre = workflow_state.empty_state()
            local events = {
                { type = E.NODE_ADDED, body = { id = "a", kind = "block" } },
                { type = E.EDGE_ADDED, body = { id = "e", source_id = "a", target_id = "a" } },
            }
            local inv = workflow_inverse.build_inverse(pre, events)
            test.eq(inv[1].type, E.EDGE_REMOVED)
            test.eq(inv[2].type, E.NODE_REMOVED)
        end)

        test.it("inverts a node removal by recreating the node and its incident edges", function()
            local pre = select(1, workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NODE_ADD, { id = "a", kind = "block", ref = "app:test_identity" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "b" }),
            }))
            local events = { { type = E.NODE_REMOVED, body = { id = "b" } } }
            local inv = workflow_inverse.build_inverse(pre, events)
            local kinds: { string } = {}
            for _, ev in ipairs(inv) do kinds[#kinds + 1] = ev.type end
            test.contains(table.concat(kinds, ","), E.NODE_ADDED)
            test.contains(table.concat(kinds, ","), E.EDGE_ADDED)
        end)
    end)

    -- ─── DB replay: undo/redo semantics + id preservation ────────────────
    test.describe("Undo replay", function()
        test.it("undoes a layout direction change back to the prior direction", function()
            local id = wid()
            local result, apply_err = workflow.apply(id, { cmd("layout.set-direction", { direction = "LR" }) }, "t")
            test.is_nil(apply_err)
            local state, read_err = workflow.state(id)
            test.is_nil(read_err)
            test.eq((state :: any).layout.direction, "LR")
            local _, inverse_err = workflow.apply_events(id, workflow_inverse.build_inverse((result :: any).pre_state, (result :: any).events), "t")
            test.is_nil(inverse_err)
            test.eq((select(1, workflow.state(id)) :: any).layout.direction, "TB")
        end)

        test.it("preserves a server-generated node id across undo and redo", function()
            local id = wid()
            local res = select(1, workflow.apply(id, { cmd(C.NODE_ADD, { kind = "block", ref = "app:test_identity", title = "Step" }) }, "t"))
            local generated = (res :: any).events[1].body.id
            test.not_nil(generated)

            local inverse = workflow_inverse.build_inverse((res :: any).pre_state, (res :: any).events)
            local forward = forward_of((res :: any).events)

            workflow.apply_events(id, inverse, "t")
            test.eq(count_nodes(select(1, workflow.state(id))), 0)

            workflow.apply_events(id, forward, "t")
            local state = select(1, workflow.state(id))
            test.eq(count_nodes(state), 1)
            test.eq((state :: any).nodes[1].id, generated)
        end)

        test.it("undoes the first resize of a dimension-less layout row exactly", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NOTE_ADD, { id = "n1", body = "hi" }),
                cmd(C.LAYOUT_SET_POSITION, { node_id = "n1", x = 10, y = 20 }),
            }, "t")

            local res = select(1, workflow.apply(id, {
                cmd(C.LAYOUT_SET_POSITION, { node_id = "n1", x = 10, y = 20, width = 500, height = 300 }),
            }, "t"))
            local inverse = workflow_inverse.build_inverse((res :: any).pre_state, (res :: any).events)
            workflow.apply_events(id, inverse, "t")

            local state = select(1, workflow.state(id))
            local pos = (state :: any).layout.positions.n1
            test.eq((pos :: any).x, 10)
            test.eq((pos :: any).y, 20)
            test.is_nil((pos :: any).width)
            test.is_nil((pos :: any).height)
        end)

        test.it("undoes a cascading node removal, restoring the node and edge", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block", ref = "app:test_identity" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "b" }),
            }, "t")

            local res = select(1, workflow.apply(id, { cmd(C.NODE_REMOVE, { id = "b" }) }, "t"))
            test.eq(count_nodes(select(1, workflow.state(id))), 1)

            local inverse = workflow_inverse.build_inverse((res :: any).pre_state, (res :: any).events)
            workflow.apply_events(id, inverse, "t")

            local state = select(1, workflow.state(id))
            test.eq((state :: any).counts.nodes, 2)
            test.eq((state :: any).counts.edges, 1)
        end)
    end)

    -- ─── editor writes ───────────────────────────────────────────────────
    test.describe("Editor writes", function()
        test.it("wakes the maintenance owner from a principal without process messaging authority", function()
            local policy = assert(security.policy("app:workflow_signal_constrained"))
            local inbox = process.inbox()
            local _, register_err = process.registry.register("kickside.workflows.runs:maintenance", nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            local woken, wake_err = funcs.new():with_actor(security.new_actor("principal:group:wf-signal", {}))
                :with_scope(security.new_scope({ policy })):call("app:workflow_signal_probe", {})
            local received = channel.select({ inbox:case_receive(), time.after("2s"):case_receive() })
            process.registry.unregister("kickside.workflows.runs:maintenance", process.registry.CONSISTENT)
            test.is_nil(wake_err, tostring(wake_err))
            test.is_true(woken)
            test.eq(received.channel, inbox, "the maintenance owner never received its wake")
        end)

        test.it("records label edits and restores them through undo and redo", function()
            local id = wid()
            local applied, apply_err = workflow.apply(id, { cmd(C.LABELS_SET, { labels = { "Northwind", "Fulfillment" } }) }, "t")
            test.is_nil(apply_err, tostring(apply_err))
            test.eq(applied.state.labels[1], "Northwind")
            test.eq(applied.state.labels[2], "Fulfillment")
            local undone, undo_err = workflow.undo(id, "t")
            test.is_nil(undo_err, tostring(undo_err))
            test.eq(#undone.state.labels, 0)
            local redone, redo_err = workflow.redo(id, "t")
            test.is_nil(redo_err, tostring(redo_err))
            test.eq(redone.state.labels[1], "Northwind")
            test.eq(redone.state.labels[2], "Fulfillment")
        end)

        test.it("apply, undo, and redo round-trip through the workflow writer", function()
            local id = wid()
            local applied, aerr = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block", ref = "app:test_identity" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "b" }),
            }, "t")
            test.is_nil(aerr)
            test.eq((applied :: any).head_seq, 3)
            test.is_true((applied :: any).can_undo)

            local undone = select(1, workflow.undo(id, "t"))
            test.is_true((undone :: any).can_redo)
            test.eq(count_nodes(select(1, workflow.state(id))), 0)

            test.not_nil(select(1, workflow.redo(id, "t")))
            local state = select(1, workflow.state(id))
            test.eq((state :: any).counts.nodes, 2)
            test.eq((state :: any).counts.edges, 1)
        end)

        test.it("reads an unedited workflow with empty history", function()
            local snapshot, err = workflow.state(wid())
            test.is_nil(err)
            test.is_false(snapshot.can_undo)
            test.is_false(snapshot.can_redo)
        end)

        test.it("reads the folded snapshot and history flags", function()
            local id = wid()
            local _, apply_err = workflow.apply(id, { cmd(C.NODE_ADD, { id = "start", kind = "start" }) }, "t")
            test.is_nil(apply_err)
            local status = select(1, workflow.state(id))
            test.eq(status.counts.nodes, 1)
            test.is_true(status.can_undo)
            test.is_false(status.can_redo)
            local _, undo_err = workflow.undo(id, "t")
            test.is_nil(undo_err)
            status = select(1, workflow.state(id))
            test.eq(status.counts.nodes, 0)
            test.is_false(status.can_undo)
            test.is_true(status.can_redo)
            local _, redo_err = workflow.redo(id, "t")
            test.is_nil(redo_err)
            status = select(1, workflow.state(id))
            test.eq(status.counts.nodes, 1)
            test.is_true(status.can_undo)
            test.is_false(status.can_redo)
        end)

        test.it("reports nothing to undo on a fresh workflow", function()
            local res, err = workflow.undo(wid(), "t")
            test.is_nil(res)
            test.contains(err:message(), "nothing to undo")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
