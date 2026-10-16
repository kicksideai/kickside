local test = require("test")
local uuid = require("uuid")
local uuid_v4 = uuid.v4
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local time = require("time")
local workflow = require("workflow")
local version_publish = require("version_publish")
local version_read = require("version_read")
local runs = require("runs")
local types = require("types")
local client = require("client")
local consts = require("consts")
local data_reader = require("data_reader")
local node_reader = require("node_reader")
local commit_repo = require("commit_repo")
local engine_scaffold = require("engine_scaffold")

type Map = { [string]: any }

local sc = engine_scaffold.new({
    test = test,
    uuid = uuid,
    json = json,
    funcs = funcs,
    security = security,
    time = time,
    workflow = workflow,
    version_publish = version_publish,
    runs = runs,
    types = types,
    client = client,
    consts = consts,
    data_reader = data_reader,
    node_reader = node_reader,
    commit_repo = commit_repo,
})
local wid = sc.wid
local n = sc.n
local fixture = sc.fixture
local fn = sc.fn
local e = sc.e
local apply_workflow = sc.apply_workflow
local apply_and_publish = sc.apply_and_publish
local launch = sc.launch
local simulate = sc.simulate
local output_for = sc.output_for
local nodes_by_def = sc.nodes_by_def
local wait_terminal = sc.wait_terminal
local function define_tests()
    test.describe("Workflow compiler live dataflow execution", function()





        test.it("runs a lane-guard-shaped edge transform with a one-based first-item subscript", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("lane_guard", { ref = "app:engine_lane_guard" }),
                fn("compose_brief", { ref = "app:engine_compose_brief" }),
            }, {
                e("e0", "t", "lane_guard"),
                e("e1", "lane_guard", "compose_brief", {
                    transform = "{ contact_id: output.passed_items[1].contact_id, outcome: output.outcome }",
                }),
            })

            local launched, c = launch(id, {
                passed_items = { { contact_id = "contact-1" } },
                outcome = "passed",
            })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, dataflow_id).result :: Map
            test.eq(result.contact_id, "contact-1")
            test.eq(result.outcome, "passed")
        end)

        test.it("routes a failed real node directly to workflow error output with mapped producer lineage", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("lane_guard", { ref = "app:engine_lane_guard_or_fail" }),
                fn("compose_brief", { ref = "app:engine_compose_brief" }),
                n("error", "error", { config = { error_schema = { type = "object" } } }),
            }, {
                e("e0", "t", "lane_guard"),
                e("e1", "lane_guard", "compose_brief", {
                    -- Workflow [2] lowers to the engine's [1], which is out of range
                    -- for this one-item array and must follow the configured error edge.
                    transform = "{ contact_id: output.passed_items[2].contact_id }",
                }),
                e("on_error", "lane_guard", "error", {
                    source_port = "failed",
                    transform = "{ mapped: true, reason: output }",
                }),
            })

            local launched, c = launch(id, {
                passed_items = { { contact_id = "contact-1" } },
                outcome = "passed",
            })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_FAILURE)
            local runtime_nodes = nodes_by_def(dataflow_id)
            test.is_nil(runtime_nodes.error, "Error is a definition boundary, not an engine node")
            local producer = runtime_nodes.lane_guard :: Map
            test.not_nil(producer)
            local error_outputs = data_reader.with_dataflow(dataflow_id)
                :with_nodes(tostring(producer.node_id))
                :with_data_types(consts.DATA_TYPE.WORKFLOW_OUTPUT)
                :fetch_options({ content = true, resolve_references = true })
                :all()
            test.eq(#(error_outputs :: { any }), 1)
            local row = (error_outputs :: { Map })[1]
            test.eq(tostring(row.discriminator), "error")
            local output = output_for(c, dataflow_id)
            test.eq(output.mapped, true)
            test.not_nil(output.reason)
        end)

        test.it("normalizes an unmapped string failure at the Error boundary without losing its reason", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("lane_guard", { ref = "app:engine_lane_guard_or_fail" }),
                fn("compose_brief", { ref = "app:engine_compose_brief" }),
                n("error", "error", { config = { error_schema = { type = "object" } } }),
            }, {
                e("e0", "t", "lane_guard"),
                e("e1", "lane_guard", "compose_brief", {
                    transform = "{ contact_id: output.passed_items[2].contact_id }",
                }),
                e("on_error", "lane_guard", "error", { source_port = "failed" }),
            })

            local launched, c = launch(id, {
                passed_items = { { contact_id = "contact-1" } },
                outcome = "passed",
            })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_FAILURE)
            local output = output_for(c, dataflow_id)
            test.eq(tostring(output.code), "execution_failed")
            test.is_true(type(output.message) == "string" and output.message ~= "")
            test.is_nil(nodes_by_def(dataflow_id).error)
        end)

        test.it("delivers the reminted run identity to a lowered function node", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("context", { ref = "app:engine_run_context" }),
            }, {
                e("e0", "t", "context"),
            })

            local launched, c = launch(id, { text = "identity" })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)

            local result = output_for(c, dataflow_id).result :: Map
            local run_context = result.run_context :: Map
            test.eq(tostring(run_context.run_id), tostring((launched :: Map).run_id))
            test.eq(tostring(run_context.dataflow_id), dataflow_id)
            test.eq(tostring((run_context.flow_ref :: Map).kind), "flow")
            test.eq(tostring((run_context.flow_ref :: Map).id), id)
            test.eq(tonumber((run_context.flow_ref :: Map).version), 1)
            test.is_nil(run_context.workflow_id)
            test.is_nil(run_context.version)
            test.eq(tostring(run_context.def_node_id), "context")
            test.eq(result.component_id, id)
            test.eq(tostring((result.input_echo :: Map).text), "identity")
        end)

        test.it("runs a transient simulation workflow to completed output without publishing", function()
            local id = wid()
            apply_workflow(id, {
                fixture("t"),
                fn("linear", { ref = "app:engine_linear" }),
            }, {
                e("e0", "t", "linear"),
            })
            test.eq(#(select(1, version_read.list(id)) :: { any }), 0)

            local launched, c = simulate(id, { text = "draft", count = 4 })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            local status = wait_terminal(c, dataflow_id)
            test.eq(status, consts.STATUS.COMPLETED_SUCCESS)
            test.eq(#(select(1, version_read.list(id)) :: { any }), 0)

            local run = select(1, runs.get_run(id, (launched :: Map).run_id))
            test.eq((run :: Map).origin, "simulation")
            test.is_nil((run :: Map).flow_ref)
            test.eq((((run :: Map).draft_ref :: Map).kind), "flow")

            local output = output_for(c, dataflow_id)
            test.eq((output.result :: Map).kind, "linear")
            test.eq((output.result :: Map).text, "draft")
            test.eq((output.result :: Map).transformed, "DRAFT:4")
        end)

    end)
end

-- The live engine proofs run as two test entries so each entry's live
-- dataflow work stays well inside the runner's per-entry budget.

local run_cases = test.run_cases(define_tests)
local function run(options)
    return run_cases(options)
end

return { run = run }
