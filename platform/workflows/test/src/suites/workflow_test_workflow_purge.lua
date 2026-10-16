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

    -- ─── seq monotonicity + isolation (DB) ───────────────────────────────

    -- ─── delete purge (DB) ───────────────────────────────────────────────
    test.describe("Workflow purge", function()
        test.it("purge removes all definition rows and events for the workflow", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "b" }),
                cmd(C.NOTE_ADD, { id = "n", body = "hi" }),
                cmd(C.LAYOUT_SET_POSITION, { node_id = "a", x = 1, y = 1 }),
            }, "t")

            local ok, err = workflow.purge(id)
            test.is_true(ok, tostring(err))

            local state = select(1, workflow.state(id))
            test.eq((state :: any).counts.nodes, 0)
            test.eq((state :: any).counts.edges, 0)
            test.eq((state :: any).counts.notes, 0)
            test.eq((state :: any).head_seq, 0)
            local events = select(1, workflow.events(id, 0))
            test.eq(#(events :: any), 0)
        end)

        test.it("purge refuses to orphan an active workflow run", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.NODE_ADD, { id = "b", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "b" }),
            }, "t")
            local db = select(1, store.open_db())
            test.not_nil(db)
            local _, ierr = (db :: any):execute(
                "INSERT INTO " .. types.TABLES.RUNS ..
                " (run_id, workflow_id, version, dataflow_id, status, started_at) VALUES ($1, $2, $3, $4, $5, $6)",
                { "run-active-" .. id, id, 1, "df-active-" .. id, "running", "2026-01-01T00:00:00Z" })
            ; (db :: any):release()
            test.is_nil(ierr)

            local ok, err = workflow.purge(id)
            test.is_false(ok)
            test.contains(tostring(err), "active run")
            local state = select(1, workflow.state(id))
            test.eq((state :: any).counts.nodes, 2)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
