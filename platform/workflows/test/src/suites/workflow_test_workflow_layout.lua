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

    -- ─── writer concurrency (single-transaction validate+append+project) ──

    -- ─── transactional atomicity + read model (DB) ───────────────────────

    -- ─── cascade remove (DB) ─────────────────────────────────────────────

    -- ─── layout + viewport (DB) ──────────────────────────────────────────
    test.describe("Workflow layout", function()
        test.it("stores the viewport as a reserved row and node positions separately", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.LAYOUT_SET_POSITION, { node_id = "a", x = 5, y = 6, width = 100, height = 40 }),
                cmd(C.LAYOUT_SET_VIEWPORT, { x = -50, y = -60, zoom = 1.5 }),
            }, "tester")

            local state = select(1, workflow.state(id))
            local pos = (state :: any).layout.positions.a
            test.eq((pos :: any).x, 5)
            test.eq((pos :: any).width, 100)
            local vp = (state :: any).layout.viewport
            test.eq((vp :: any).zoom, 1.5)
            test.eq((vp :: any).x, -50)
            test.is_nil((state :: any).layout.positions[types.VIEWPORT_NODE_ID])
        end)

        test.it("persists the canvas layout direction with the definition", function()
            local id = wid()
            local fresh, fresh_err = workflow.state(id)
            test.is_nil(fresh_err)
            test.eq((fresh :: any).layout.direction, "TB")
            local _, err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd("layout.set-direction", { direction = "LR" }),
            }, "tester")
            test.is_nil(err)
            local state, state_err = workflow.state(id)
            test.is_nil(state_err)
            test.eq((state :: any).layout.direction, "LR")
            test.is_nil((state :: any).layout.positions["__layout__"])
        end)

        test.it("refuses clearing the reserved direction row through node layout commands", function()
            local id = wid()
            local _, set_err = workflow.apply(id, { cmd("layout.set-direction", { direction = "LR" }) }, "tester")
            test.is_nil(set_err)
            local _, clear_err = workflow.apply(id, { cmd(C.LAYOUT_CLEAR_POSITION, { node_id = "__layout__" }) }, "tester")
            test.contains(tostring(clear_err), "reserved layout id refused")
            test.eq((select(1, workflow.state(id)) :: any).layout.direction, "LR")
        end)

        test.it("rejects an unknown layout direction", function()
            local _, err = workflow.apply(wid(), { cmd("layout.set-direction", { direction = "diagonal" }) }, "tester")
            test.contains(tostring(err), "layout direction must be TB or LR")
        end)

        test.it("rejects positioning a node that does not exist", function()
            local id = wid()
            local _, err = workflow.apply(id, { cmd(C.LAYOUT_SET_POSITION, { node_id = "ghost", x = 1, y = 1 }) }, "tester")
            test.contains(tostring(err), "layout target not found")
        end)

        test.it("positions a note (notes are layout-placeable like nodes)", function()
            local id = wid()
            local _, err = workflow.apply(id, {
                cmd(C.NOTE_ADD, { id = "n1", body = "hi" }),
                cmd(C.LAYOUT_SET_POSITION, { node_id = "n1", x = 12, y = 34 }),
            }, "tester")
            test.is_nil(err)
            local state = select(1, workflow.state(id))
            local pos = (state :: any).layout.positions.n1
            test.eq((pos :: any).x, 12)
            test.eq((pos :: any).y, 34)
        end)

        test.it("a position-only update preserves saved layout dimensions", function()
            local id = wid()
            local _, aerr = workflow.apply(id, {
                cmd(C.NOTE_ADD, { id = "f1", body = "Zone", kind = "frame" }),
                cmd(C.LAYOUT_SET_POSITION, { node_id = "f1", x = 0, y = 0, width = 640, height = 400 }),
            }, "tester")
            test.is_nil(aerr)
            local _, merr = workflow.apply(id, {
                cmd(C.LAYOUT_SET_POSITION, { node_id = "f1", x = 100, y = 80 }),
            }, "tester")
            test.is_nil(merr)
            local state = select(1, workflow.state(id))
            local pos = (state :: any).layout.positions.f1
            test.eq((pos :: any).x, 100)
            test.eq((pos :: any).y, 80)
            test.eq((pos :: any).width, 640)
            test.eq((pos :: any).height, 400)
        end)

        test.it("persists a note kind, defaulting to 'note' and round-tripping 'frame'", function()
            local id = wid()
            local _, err = workflow.apply(id, {
                cmd(C.NOTE_ADD, { id = "n1", body = "plain" }),
                cmd(C.NOTE_ADD, { id = "f1", body = "Zone", kind = "frame", color = "slate" }),
            }, "tester")
            test.is_nil(err)
            local notes = select(1, workflow.notes(id, {}))
            local by_id: { [string]: any } = {}
            for _, n in ipairs(notes :: any) do by_id[tostring((n :: any).id)] = n end
            test.eq((by_id.n1 :: any).kind, "note")
            test.eq((by_id.f1 :: any).kind, "frame")
            test.eq((by_id.f1 :: any).color, "slate")
        end)

        test.it("rejects an unknown note kind", function()
            local _, err = workflow_state.validate_and_fold(workflow_state.empty_state(), {
                cmd(C.NOTE_ADD, { id = "n1", body = "x", kind = "widget" }),
            })
            test.contains(tostring(err), "unknown note kind")
        end)
    end)

    -- ─── seq monotonicity + isolation (DB) ───────────────────────────────

    -- ─── delete purge (DB) ───────────────────────────────────────────────
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
