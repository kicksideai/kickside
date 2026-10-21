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

        test.it("joins each loop item directly with its derived output", function()
            local id = wid()
            apply_and_publish(id, {
                n("p", "for_each", { config = { source_array_key = "items", batch_size = 2 } }),
                fn("item", { ref = "app:engine_item" }),
                n("join", "combine", { config = { mode = "wait_all" } }),
            }, {
                e("body-item", "p", "item", { source_port = "body" }),
                e("body-join", "p", "join", { source_port = "body",
                    transform = { v = 1, mode = "expr", expr = "{ item: output }" } }),
                e("item-join", "item", "join", {
                    transform = { v = 1, mode = "expr", expr = "{ derived: output }" } }),
            })

            local launched, c = launch(id, { items = {
                { name = "one", value = 1 },
                { name = "two", value = 2 },
            } })
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, dataflow_id).result :: { Map }
            test.eq(#result, 2)
            for i, name in ipairs({ "one", "two" }) do
                local joined = result[i]
                test.is_table(joined.in1)
                test.eq(((joined.in1 :: Map).derived :: Map).doubled, i * 2)
                test.eq(((joined.in2 :: Map).item :: Map).name, name)
            end
        end)

        test.it("preserves scalar loop items through transformed direct joins", function()
            local id = wid()
            apply_and_publish(id, {
                n("p", "for_each", { config = { source_array_key = "items", batch_size = 2 } }),
                fn("item", { ref = "app:engine_item" }),
                n("join", "combine", { config = { mode = "wait_all" } }),
            }, {
                e("body-item", "p", "item", { source_port = "body" }),
                e("body-join", "p", "join", { source_port = "body",
                    transform = { v = 1, mode = "expr", expr = "{ item: output * 3 }" } }),
                e("item-join", "item", "join", {
                    transform = { v = 1, mode = "expr", expr = "{ derived: output.doubled }" } }),
            })

            local launched, c = launch(id, { items = { 1, 2 } })
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, dataflow_id).result :: { Map }
            test.eq(#result, 2)
            for index, item in ipairs(result) do
                test.eq(tonumber(((item.in1 :: Map).derived)), index * 2)
                test.eq(tonumber(((item.in2 :: Map).item)), index * 3)
            end
        end)

        test.it("joins cycle context directly with its body result", function()
            local id = wid()
            apply_and_publish(id, {
                n("c", "cycle", { config = {
                    continue_condition = "false",
                    max_iterations = 2,
                    initial_state = { seed = 5 },
                } }),
                fn("step", { ref = "app:coverage_cycle_step" }),
                n("join", "combine", { config = { mode = "wait_all" } }),
            }, {
                e("body-step", "c", "step", { source_port = "body" }),
                e("body-join", "c", "join", { source_port = "body",
                    transform = { v = 1, mode = "expr", expr = "{ context_iteration: output.iteration, context_seed: output.state.seed }" } }),
                e("step-join", "step", "join", {
                    transform = { v = 1, mode = "expr", expr = "{ derived_iteration: output.result.iteration }" } }),
            })

            local launched, c = launch(id, { input = { name = "one" } })
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, dataflow_id).result :: Map
            test.eq(tonumber(((result.in1 :: Map).derived_iteration)), 1)
            test.eq(tonumber(((result.in2 :: Map).context_iteration)), 1)
            test.eq(tonumber(((result.in2 :: Map).context_seed)), 5)
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

        test.it("completes with every item error when continue_on_error is explicit", function()
            local id = wid()
            apply_and_publish(id, {
                n("p", "for_each", { config = { continue_on_error = true } }),
                fn("item", { ref = "app:engine_item_or_fail" }),
            }, {
                e("body", "p", "item", { source_port = "body" }),
            })
            local launched, c = launch(id, { items = {
                { name = "one", fail = true },
                { name = "two", fail = true },
            } })
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local run = sc.wait_run_terminal(id, tostring((launched :: Map).run_id))
            test.eq(run.status, types.RUN_STATUS.COMPLETED)
            local result = output_for(c, dataflow_id).result :: { Map }
            test.eq(#result, 2)
            for i, name in ipairs({ "one", "two" }) do
                test.is_nil(result[i].result)
                test.is_table(result[i].error)
                test.eq((result[i].error :: Map).code, "FUNCTION_EXECUTION_FAILED")
                test.contains(tostring((result[i].error :: Map).message), "intentional item failure: " .. name)
            end
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
