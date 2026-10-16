local test = require("test")
local uuid = require("uuid")
local uuid_v4 = uuid.v4
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local time = require("time")
local workflow = require("workflow")
local version_publish = require("version_publish")
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
local apply_and_publish = sc.apply_and_publish
local launch = sc.launch
local output_for = sc.output_for
local nodes_by_def = sc.nodes_by_def
local wait_terminal = sc.wait_terminal
local function define_tests()
    test.describe("Workflow compiler live dataflow execution: branches, Awaits and items", function()




        test.it("runs a for_each body and emits an ordered result array", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                n("p", "for_each", { config = { source_array_key = "items", batch_size = 2 } }),
                fn("item", { ref = "app:engine_item" }),
            }, {
                e("e0", "t", "p"),
                e("body", "p", "item", { source_port = "body" }),
            })

            local launched, c = launch(id, {
                items = {
                    { name = "one", value = 1 },
                    { name = "two", value = 2 },
                    { name = "three", value = 3 },
                },
            })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)

            local result = (output_for(c, dataflow_id).result :: { any })
            test.eq(#result, 3)
            for i, expected in ipairs({ 2, 4, 6 }) do
                test.eq(((result[i] :: Map).doubled), expected)
            end

            local nodes = nodes_by_def(dataflow_id)
            local iteration_rows = data_reader.with_dataflow(dataflow_id)
                :with_nodes((nodes.p :: Map).node_id)
                :with_data_types(consts.DATA_TYPE.ITERATION_RESULT)
                :all()
            test.eq(#(iteration_rows :: { any }), 3)
        end)

        test.it("surfaces an item failure reason in continue_on_error output", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                n("p", "for_each", { config = { source_array_key = "items", batch_size = 2, continue_on_error = true } }),
                fn("item", { ref = "app:engine_item_or_fail" }),
            }, {
                e("e0", "t", "p"),
                e("body", "p", "item", { source_port = "body" }),
            })

            local launched, c = launch(id, {
                items = {
                    { name = "good", value = 1 },
                    { name = "bluebird", value = 2, fail = true },
                },
            })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)

            local result = output_for(c, dataflow_id).result :: { any }
            test.eq(#result, 2)
            local failed = result[2] :: Map
            test.is_table(failed.error)
            test.eq(tostring((failed.error :: Map).code), "FUNCTION_EXECUTION_FAILED")
            test.contains(tostring((failed.error :: Map).message), "intentional item failure: bluebird")
        end)

        test.it("fails fast by default with the structured item failure reason", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                n("p", "for_each", { config = { source_array_key = "items" } }),
                fn("item", { ref = "app:engine_item_or_fail" }),
            }, {
                e("e0", "t", "p"),
                e("body", "p", "item", { source_port = "body" }),
            })

            local launched, c = launch(id, {
                items = {
                    { name = "bluebird", value = 2, fail = true },
                    { name = "later", value = 3 },
                },
            })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_FAILURE)

            local node = nodes_by_def(dataflow_id).p :: Map
            test.eq(tostring(node.status), consts.STATUS.COMPLETED_FAILURE)
            local reason = ((node.metadata :: Map).error :: Map)
            test.is_table(reason)
            test.eq(tostring(reason.code), "FUNCTION_EXECUTION_FAILED")
            test.contains(tostring(reason.message), "intentional item failure: bluebird")
        end)

        test.it("routes a wired generic Failed port as the stable payload and completes through recovery", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("fail", { ref = "app:engine_item_or_fail" }),
                fn("recover", { ref = "app:engine_compose_brief" }),
            }, {
                e("e0", "t", "fail"),
                e("failed", "fail", "recover", { source_port = "failed" }),
            })

            local launched, c = launch(id, { name = "bluebird", fail = true })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)

            local result = output_for(c, dataflow_id).result :: Map
            test.eq(tostring(result.code), "FUNCTION_EXECUTION_FAILED")
            test.contains(tostring(result.message), "intentional item failure: bluebird")
            test.eq(tostring((nodes_by_def(dataflow_id).fail :: Map).status), consts.STATUS.COMPLETED_FAILURE)
        end)

        test.it("routes a tool's typed error to its Failed port", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                n("tool", "block", { ref = "app:tool_outcome", config = { outcome = "typed" } }),
                fn("recover", { ref = "app:engine_compose_brief" }),
            }, {
                e("e0", "t", "tool"),
                e("failed", "tool", "recover", { source_port = "failed" }),
            })

            local launched, c = launch(id, { name = "bluebird" })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, dataflow_id).result :: Map
            test.eq(tostring(result.code), "FUNCTION_EXECUTION_FAILED")
            test.contains(tostring(result.message), "tool backend unavailable")
            test.eq(tostring((nodes_by_def(dataflow_id).tool :: Map).status), consts.STATUS.COMPLETED_FAILURE)
        end)

        test.it("delivers a tool's domain error as its structured result", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                n("tool", "block", { ref = "app:tool_outcome", config = { outcome = "domain", lead_id = "lead-7" } }),
                fn("next", { ref = "app:engine_compose_brief" }),
            }, {
                e("e0", "t", "tool"),
                e("e1", "tool", "next"),
            })

            local launched, c = launch(id, { name = "bluebird" })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, dataflow_id).result :: Map
            test.eq(result.success, false)
            test.eq(result.error, "lead not found")
            test.eq(result.code, "lead_not_found")
            test.eq(result.lead_id, "lead-7")
        end)

        test.it("keeps an unwired generic Failed port fatal", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("fail", { ref = "app:engine_item_or_fail" }),
            }, {
                e("e0", "t", "fail"),
            })

            local launched, c = launch(id, { name = "bluebird", fail = true })
            local dataflow_id = tostring((launched :: Map).dataflow_id or "")
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_FAILURE)
            local reason = ((nodes_by_def(dataflow_id).fail :: Map).metadata :: Map).error :: Map
            test.eq(tostring(reason.code), "FUNCTION_EXECUTION_FAILED")
            test.contains(tostring(reason.message), "intentional item failure: bluebird")
        end)
    end)
end


local run_cases = test.run_cases(define_tests)
local function run_flow_control(options)
    return run_cases(options)
end

return { run_flow_control = run_flow_control }
