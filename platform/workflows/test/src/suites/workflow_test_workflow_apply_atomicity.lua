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
    test.describe("Workflow apply atomicity", function()
        test.it("publishes a draft whose canvas edges used presentation handles", function()
            local id = wid()
            local _, apply_err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "start", kind = "start", config = {
                    input_schema = { type = "object", properties = {} },
                } }),
                cmd(C.NODE_ADD, { id = "work", kind = "block", ref = "app:block.engine_linear", config = {} }),
                cmd(C.NODE_ADD, { id = "finish", kind = "finish", config = {
                    output_schema = { type = "object", properties = {} },
                } }),
                cmd(C.EDGE_ADD, {
                    id = "entry", source_id = "start", target_id = "work",
                    source_port = "out-bottom", target_port = "in-top",
                }),
                cmd(C.EDGE_ADD, {
                    id = "exit", source_id = "work", target_id = "finish",
                    source_port = "out-right", target_port = "in-left",
                }),
            }, "tester")
            test.is_nil(apply_err)

            local published, publish_err = version_publish.publish(id, "tester")
            test.is_nil(publish_err)
            test.is_true((published :: any).ok,
                tostring((published :: any).errors and (published :: any).errors[1]
                    and ((published :: any).errors[1] :: any).message))
            test.eq((published :: any).version, 1)
        end)

        test.it("persists nothing when any command in the batch is invalid", function()
            local id = wid()
            local _, err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "a", kind = "block" }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "ghost" }),
            }, "tester")
            test.not_nil(err)

            local state = select(1, workflow.state(id))
            test.eq((state :: any).counts.nodes, 0)
            test.eq((state :: any).head_seq, 0)
        end)

        test.it("refuses removal of boundary nodes after the workflow interface is published", function()
            local id = wid()
            local _, aerr = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "start", kind = "start", config = {
                    input_schema = { type = "object", properties = { lead_id = { type = "string" } } },
                } }),
                cmd(C.NODE_ADD, { id = "finish", kind = "finish", config = {
                    output_schema = { type = "object", properties = { score = { type = "number" } } },
                } }),
                cmd(C.NODE_ADD, { id = "score", kind = "block", ref = "app:block.engine_linear" }),
                cmd(C.EDGE_ADD, { id = "e1", source_id = "start", source_port = "out", target_id = "score", target_port = "in" }),
                cmd(C.EDGE_ADD, { id = "e2", source_id = "score", source_port = "result", target_id = "finish", target_port = "in" }),
            }, "tester")
            test.is_nil(aerr)
            local published = select(1, version_publish.publish(id, "tester"))
            test.is_true((published :: any).ok, tostring((published :: any).errors and (published :: any).errors[1] and ((published :: any).errors[1] :: any).message))

            local _, err = workflow.apply(id, {
                cmd(C.NODE_REMOVE, { id = "start" }),
            }, "tester")
            test.contains(tostring(err), types.BOUNDARY_REMOVE_REFUSED)
            test.contains(tostring(err), "node_id=start")

            local state = select(1, workflow.state(id))
            local start = find_by_id((state :: any).nodes, "start")
            test.not_nil(start)
            test.is_true((start :: any).pinned)
            test.is_false((start :: any).deletable)
        end)

        test.it("reports a refused boundary removal as a structured invalid error", function()
            local id = wid()
            local _, aerr = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "start", kind = "start", config = {
                    input_schema = { type = "object", properties = { lead_id = { type = "string" } } },
                } }),
                cmd(C.NODE_ADD, { id = "finish", kind = "finish", config = {
                    output_schema = { type = "object", properties = { score = { type = "number" } } },
                } }),
                cmd(C.NODE_ADD, { id = "score", kind = "block", ref = "app:block.engine_linear" }),
                cmd(C.EDGE_ADD, { id = "e1", source_id = "start", source_port = "out", target_id = "score", target_port = "in" }),
                cmd(C.EDGE_ADD, { id = "e2", source_id = "score", source_port = "result", target_id = "finish", target_port = "in" }),
            }, "tester")
            test.is_nil(aerr)
            local published = select(1, version_publish.publish(id, "tester"))
            test.is_true((published :: any).ok)

            local _, err = workflow.apply(id, {
                cmd(C.NODE_REMOVE, { id = "finish" }),
            }, "tester")
            test.not_nil(err)
            test.eq((err :: any):kind(), errors.INVALID)
            local details = (err :: any):details()
            test.eq(details.reason, types.BOUNDARY_REMOVE_REFUSED)
            test.eq(details.node_id, "finish")
            test.eq(details.kind, "finish")
        end)

        test.it("round-trips empty boundary schema properties as JSON objects", function()
            local id = wid()
            local _, err = workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "start", kind = "start", config = {
                    input_schema = { type = "object", properties = {} },
                } }),
                cmd(C.NODE_ADD, { id = "finish", kind = "finish", config = {
                    output_schema = { type = "object", properties = {} },
                } }),
            }, "tester")
            test.is_nil(err)

            local state = select(1, workflow.state(id))
            local start = find_by_id((state :: any).nodes, "start")
            local cfg_json = tostring(json.encode(((start :: any).config :: any).input_schema) or "")
            local iface_json = tostring(json.encode(((state :: any).interface :: any).input_schema) or "")
            local port_json = tostring(json.encode((((start :: any).ports :: { any })[1] :: any).schema) or "")
            test.contains(cfg_json, "\"properties\":{}")
            test.contains(iface_json, "\"properties\":{}")
            test.contains(port_json, "\"properties\":{}")
            test.is_nil((cfg_json:find("\"properties\":%[%]", 1, false)))
            test.is_nil((iface_json:find("\"properties\":%[%]", 1, false)))
            test.is_nil((port_json:find("\"properties\":%[%]", 1, false)))
        end)

        test.it("commits a valid batch and folds the read model", function()
            local id = wid()
            local res, err = workflow.apply(id, {
                cmd(C.NODE_ADD, {
                    id = "a",
                    kind = "block",
                    title = "Load account",
                    ref = "app:block.engine_linear",
                    config = { source = "primary" },
                }),
                cmd(C.NODE_ADD, {
                    id = "b",
                    kind = "block",
                    ref = "app:block.configurable_agent",
                    config = {},
                }),
                cmd(C.EDGE_ADD, { id = "e", source_id = "a", target_id = "b", transform = "{ ok: output.ok }" }),
            }, "tester")
            test.is_nil(err)
            test.eq(#(res :: any).events, 3)

            local state = select(1, workflow.state(id))
            test.eq((state :: any).counts.nodes, 2)
            test.eq((state :: any).counts.edges, 1)
            local node_a = find_by_id((state :: any).nodes, "a")
            test.eq((node_a :: any).config.source, "primary")
            test.eq((node_a :: any).ref, "app:block.engine_linear")
            test.eq((node_a :: any).output_schema.type, "object")
            local node_b = find_by_id((state :: any).nodes, "b")
            test.eq((node_b :: any).input_schema.type, "object")
            test.eq((node_b :: any).config_schema.type, "object")
            local edge = find_by_id((state :: any).edges, "e")
            test.eq((edge :: any).transform.expr, "{ ok: input.ok }")
        end)
    end)

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
