local test = require("test")
local uuid_v4 = require("uuid").v4
local json = require("json")
local sql = require("sql")
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
    test.describe("Workflow writer concurrency", function()
        test.it("preserves empty schema objects in events, projections and reads", function()
            local id = wid()
            local schema = { type = "object", properties = {}, required = {}, additionalProperties = {} }
            local _, err = workflow.apply(id, { cmd(C.NODE_ADD, {
                id = "start", kind = "start", config = { input_schema = schema },
            }) }, "tester")
            test.is_nil(err, tostring(err))
            local function check_schema(value: any)
                local wire = tostring(json.encode(value))
                test.contains(wire, '"properties":{}')
                test.contains(wire, '"additionalProperties":{}')
                test.contains(wire, '"required":[]')
            end
            -- Schema-bearing positions retain object shape at storage and read boundaries.
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err, tostring(db_err))
            if not db then error("test database unavailable") end
            local stored, stored_err = db:query("SELECT body FROM " .. types.TABLES.EVENTS .. " WHERE workflow_id=$1 AND seq=1", { id })
            test.is_nil(stored_err, tostring(stored_err))
            local event_body = json.decode(stored[1].body)
            check_schema(event_body.config.input_schema)
            local projected, projected_err = db:query("SELECT config FROM " .. types.TABLES.NODES .. " WHERE workflow_id=$1 AND id=$2", { id, "start" })
            test.is_nil(projected_err, tostring(projected_err))
            local config = json.decode(projected[1].config)
            check_schema(config.input_schema)
            local stored_body = '{"id":"start","kind":"start","config":{"input_schema":{"type":"object","properties":[],"required":[],"additionalProperties":[]}}}'
            local _, stored_err = db:execute("UPDATE " .. types.TABLES.EVENTS .. " SET body=$1 WHERE workflow_id=$2 AND seq=1", { stored_body, id })
            db:release()
            test.is_nil(stored_err, tostring(stored_err))
            local events, events_err = workflow.events(id, 0)
            test.is_nil(events_err, tostring(events_err))
            check_schema(events[1].body.config.input_schema)
            local state, state_err = workflow.state(id)
            test.is_nil(state_err, tostring(state_err))
            check_schema(find_by_id(state.nodes, "start").config.input_schema)
            local updated = { type = "object", properties = { anything = {}, nested = { type = "object", properties = {} } } }
            local _, update_err = workflow.apply(id, { cmd(C.NODE_UPDATE, {
                id = "start", config = { input_schema = updated },
            }) }, "tester")
            test.is_nil(update_err, tostring(update_err))
            local current = select(1, workflow.state(id))
            local encoded = tostring(json.encode(find_by_id(current.nodes, "start").config.input_schema))
            test.contains(encoded, '"anything":{}')
            test.contains(encoded, '"properties":{}')
        end)

        test.it("returns a read error for corrupt event JSON", function()
            local id = wid()
            local _, err = workflow.apply(id, { cmd(C.NODE_ADD, { id = "start", kind = "start", config = {} }) }, "tester")
            test.is_nil(err, tostring(err))
            local db = assert(sql.get("app:db"))
            local _, write_err = db:execute("UPDATE " .. types.TABLES.EVENTS .. " SET body=$1 WHERE workflow_id=$2 AND seq=1", { "{broken", id })
            db:release()
            test.is_nil(write_err, tostring(write_err))
            local events, read_err = workflow.events(id, 0)
            test.is_nil(events)
            test.contains(tostring(read_err), "workflow event body is invalid at seq 1")
        end)

        test.it("adding the same node id twice: exactly one succeeds, history has one node.added", function()
            local id = wid()
            local r1, e1 = workflow.apply(id, { cmd(C.NODE_ADD, { id = "x", kind = "block" }) }, "tester")
            test.is_nil(e1)
            test.eq(#(r1 :: any).events, 1)

            -- the second add validates against committed state (inside the tx) and is
            -- rejected — it cannot mutate the existing node via ON CONFLICT DO UPDATE.
            local _, e2 = workflow.apply(id, { cmd(C.NODE_ADD, { id = "x", kind = "block", ref = "m:other" }) }, "tester")
            test.contains(tostring(e2), "node already exists")

            local events = select(1, workflow.events(id, 0))
            local added = 0
            for _, ev in ipairs(events :: any) do
                if tostring((ev :: any).type):find("node.added") and (ev :: any).body.id == "x" then added = added + 1 end
            end
            test.eq(added, 1)
            -- the node kept its original kind; the losing add did not overwrite it.
            local node = find_by_id(select(1, workflow.state(id)).nodes, "x")
            test.eq((node :: any).kind, "block")
        end)
    end)

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
