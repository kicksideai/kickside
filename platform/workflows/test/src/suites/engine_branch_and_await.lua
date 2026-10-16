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
local launch_as = sc.launch_as
local output_for = sc.output_for
local nodes_by_def = sc.nodes_by_def
local node_input_count = sc.node_input_count
local wait_terminal = sc.wait_terminal
local wait_run_terminal = sc.wait_run_terminal
local wait_nonterminal = sc.wait_nonterminal
local wait_for_commit_type = sc.wait_for_commit_type
local wait_await_signal = sc.wait_await_signal
local assert_park_and_arm_are_atomic = sc.assert_park_and_arm_are_atomic
local function define_tests()
    test.describe("Workflow compiler live dataflow execution: branches, Awaits and items", function()
        test.it("routes dissolved branch predicates at runtime", function()
            local id = wid()
            apply_and_publish(id, {
                fixture("t"),
                fn("decide", { ref = "app:engine_decide" }),
                n("branch", "branch", { config = { predicate = "route_a" } }),
                fn("a", { ref = "app:engine_arm_a" }),
                fn("b", { ref = "app:engine_arm_b" }),
            }, {
                e("e0", "t", "decide"),
                e("e1", "decide", "branch"),
                e("true", "branch", "a", { source_port = "true" }),
                e("false", "branch", "b", { source_port = "false" }),
            })

            local true_run, true_client = launch(id, { amount = 12 })
            local true_df = tostring((true_run :: Map).dataflow_id or "")
            test.eq(wait_terminal(true_client, true_df), consts.STATUS.COMPLETED_SUCCESS)
            local true_output = output_for(true_client, true_df).result :: Map
            test.eq(true_output.arm, "A")
            test.eq(true_output.ran_a, true)
            test.eq(true_output.ran_b, false)
            local true_nodes = nodes_by_def(true_df)
            test.eq(node_input_count(true_df, (true_nodes.a :: Map).node_id), 1)
            test.eq(node_input_count(true_df, (true_nodes.b :: Map).node_id), 0)

            local false_run, false_client = launch(id, { amount = 3 })
            local false_df = tostring((false_run :: Map).dataflow_id or "")
            test.eq(wait_terminal(false_client, false_df), consts.STATUS.COMPLETED_SUCCESS)
            local false_output = output_for(false_client, false_df).result :: Map
            test.eq(false_output.arm, "B")
            test.eq(false_output.ran_a, false)
            test.eq(false_output.ran_b, true)
            local false_nodes = nodes_by_def(false_df)
            test.eq(node_input_count(false_df, (false_nodes.a :: Map).node_id), 0)
            test.eq(node_input_count(false_df, (false_nodes.b :: Map).node_id), 1)
        end)

        test.it("parks a declared Await and resumes through a generic Dataflow signal", function()
            local id = wid()
            local actor_id = "await-owner-" .. uuid_v4()
            apply_and_publish(id, {
                fixture("t"),
                n("h", "block", { ref = "app:block.test_external_wait", config = {} }),
                fn("a", { ref = "app:engine_arm_a" }),
                fn("b", { ref = "app:engine_arm_b" }),
            }, {
                e("e0", "t", "h"),
                e("continue", "h", "a", { source_port = "then" }),
                e("stop", "h", "b", { source_port = "else" }),
            })

            local launched, c = launch_as(actor_id, id, { amount = 12 })
            local run_id = tostring((launched :: Map).run_id)
            local dataflow_id = tostring((launched :: Map).dataflow_id)
            wait_nonterminal(c, dataflow_id)
            local signal = wait_await_signal(dataflow_id)
            test.not_nil(wait_for_commit_type(dataflow_id, "node.yield"))
            assert_park_and_arm_are_atomic(dataflow_id)

            -- Parking is not completion: the workflow projection stays open while
            -- Dataflow durably owns the signal wait.
            time.sleep("100ms")
            local parked = select(1, runs.get_run(id, run_id)) :: Map
            test.is_true(parked.status == "running", "parked run status=" ..
                tostring(parked.status) .. " error=" .. tostring(parked.error))
            test.is_nil(parked.finished_at)
            test.is_nil(parked.error)

            local resumed, resume_err = c:signal(dataflow_id, tostring(signal.signal_id), {
                outcome = "continue",
                detail = { reason = "ready" },
            })
            test.is_nil(resume_err)
            test.not_nil(resumed)
            test.eq(wait_terminal(c, dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local completed_run = wait_run_terminal(id, run_id)
            test.eq(completed_run.status, "completed")
            local output = output_for(c, dataflow_id).result :: Map
            test.eq(output.arm, "A")
            test.eq(((output.source :: Map).detail :: Map).reason, "ready")
            test.eq((output.source :: Map).outcome, "continue")
        end)







    end)
end


local run_cases = test.run_cases(define_tests)
local function run_flow_control(options)
    return run_cases(options)
end

return { run_flow_control = run_flow_control }
