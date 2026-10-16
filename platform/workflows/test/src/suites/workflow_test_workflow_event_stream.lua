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
    test.describe("Workflow event stream", function()
        test.it("assigns a monotonic per-workflow seq and isolates workflows", function()
            local w1, w2 = wid(), wid()
            local r1 = select(1, workflow.apply(w1, { cmd(C.NODE_ADD, { id = "a", kind = "block" }) }, "t"))
            local r2 = select(1, workflow.apply(w1, { cmd(C.NODE_ADD, { id = "b", kind = "block" }) }, "t"))
            test.eq((r1 :: any).head_seq, 1)
            test.eq((r2 :: any).head_seq, 2)
            test.eq((r2 :: any).events[1].seq, 2)

            local r3 = select(1, workflow.apply(w2, { cmd(C.NODE_ADD, { id = "a", kind = "block" }) }, "t"))
            test.eq((r3 :: any).head_seq, 1)

            local events = select(1, workflow.events(w1, 1))
            test.eq(#(events :: any), 1)
            test.eq((events :: any)[1].seq, 2)
        end)

        test.it("folds workflow params from the event stream", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.PARAM_SET, { key = "timeout", value = 30 }),
                cmd(C.PARAM_SET, { key = "retries", value = 3 }),
            }, "t")
            workflow.apply(id, { cmd(C.PARAM_SET, { key = "timeout", value = 60 }) }, "t")

            local state = select(1, workflow.state(id))
            test.eq((state :: any).params.timeout, 60)
            test.eq((state :: any).params.retries, 3)
        end)

        test.it("caps the event tail returned to callers", function()
            local id = wid()
            local commands: { any } = {}
            for i = 1, 510 do
                commands[#commands + 1] = cmd(C.PARAM_SET, { key = "k" .. tostring(i), value = i })
            end
            workflow.apply(id, commands, "t")

            local events = select(1, workflow.events(id, 0))
            test.eq(#(events :: any), 500)
            test.eq((events :: any)[1].seq, 1)
            test.eq((events :: any)[500].seq, 500)
        end)
    end)

    -- ─── delete purge (DB) ───────────────────────────────────────────────
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
