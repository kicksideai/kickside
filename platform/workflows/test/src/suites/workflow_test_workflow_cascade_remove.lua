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
    test.describe("Workflow cascade remove", function()
        test.it("removing a node cascades its incident edges and layout row", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block" }),
                cmd(C.NODE_ADD, { id = "c", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e1", source_id = "a", target_id = "b" }),
                cmd(C.EDGE_ADD, { id = "e2", source_id = "b", target_id = "c" }),
                cmd(C.LAYOUT_SET_POSITION, { node_id = "b", x = 10, y = 20 }),
            }, "tester")

            local res, err = workflow.apply(id, { cmd(C.NODE_REMOVE, { id = "b" }) }, "tester")
            test.is_nil(err)

            local state = select(1, workflow.state(id))
            test.eq((state :: any).counts.nodes, 2)
            test.eq((state :: any).counts.edges, 0)
            test.is_nil((state :: any).layout.positions.b)
        end)
    end)

    -- ─── layout + viewport (DB) ──────────────────────────────────────────

    -- ─── seq monotonicity + isolation (DB) ───────────────────────────────

    -- ─── delete purge (DB) ───────────────────────────────────────────────
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
