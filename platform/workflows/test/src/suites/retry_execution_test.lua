-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
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
local e = sc.e
local launch = sc.launch
local output_for = sc.output_for
local nodes_by_def = sc.nodes_by_def
local wait_terminal = sc.wait_terminal
local function define_tests()
    test.describe("Workflow native function retry execution", function()
        local function publish(policy)
            local id = wid()
            sc.apply_workflow(id, {
                n("step", "block", {ref = "app:block.retry_step", retry_policy = policy,
                    start_to_close_timeout = "2s", schedule_to_close_timeout = "5s"}),
                n("error", "error", {config = {error_schema = {type = "object"}}}),
            }, {e("failed", "step", "error", {source_port = "failed"})})
            local published, err = version_publish.publish(id, "tester")
            test.is_nil(err, tostring(err))
            test.is_true(published.ok, json.encode(published.errors))
            return id
        end
        test.it("sets and clears overrides through WorkflowsManage and advertises the node fields", function()
            local actor, actor_err = security.new_actor("retry-author-" .. uuid_v4(), {})
            test.is_nil(actor_err)
            local function tool(id, args)
                local result, err = funcs.new():with_actor(actor):with_scope(sc.suite_scope()):call(id, args)
                test.is_nil(err, tostring(err))
                test.is_true(result.success)
                return result
            end
            local manage = "kickside.workflows.agent:flows_manage"
            local created = tool(manage, {action = "create", title = "Retry example"})
            local id = created.workflow.id
            tool(manage, {action = "apply", id = id, commands = {{type = "node.add", body = {
                id = "step", kind = "block", ref = "app:block.engine_public_step",
                retry_policy = {maximum_attempts = 3}, start_to_close_timeout = "1s", schedule_to_close_timeout = 5000}}}})
            local snapshot = workflow.state(id)
            local step
            for _, node in ipairs(snapshot.nodes) do if node.id == "step" then step = node end end
            test.eq(step.retry_policy.maximum_attempts, 3)
            tool(manage, {action = "apply", id = id, commands = {{type = "node.update", body = {
                id = "step", retry_policy = false, start_to_close_timeout = false, schedule_to_close_timeout = false}}}})
            snapshot = workflow.state(id)
            for _, node in ipairs(snapshot.nodes) do
                if node.id == "step" then
                    test.is_nil(node.retry_policy)
                    test.is_nil(node.start_to_close_timeout)
                    test.is_nil(node.schedule_to_close_timeout)
                end
            end
            local catalog = tool("kickside.workflows.agent:flows_read", {action = "catalog", catalog_id = "node_kinds:block"})
            test.not_nil(catalog.item.fields.retry_policy)
            test.not_nil(catalog.item.fields.start_to_close_timeout)
            test.not_nil(catalog.item.fields.schedule_to_close_timeout)
            tool(manage, {action = "delete", id = id})
        end)
        test.it("retries two retryable failures and succeeds on the third attempt", function()
            local id = publish({maximum_attempts = 3, initial_interval = "10ms"})
            local launched, c = launch(id, {fail_attempts = 2, retryable = true, value = "done"})
            test.eq(wait_terminal(c, launched.dataflow_id), consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, launched.dataflow_id).result
            test.eq(result.attempt, 3)
            test.eq(result.value, "done")
            test.eq(nodes_by_def(launched.dataflow_id).step.metadata.func_retry, false)
        end)
        test.it("stops after three attempts when the policy omits its attempt count", function()
            local id = publish({initial_interval = "10ms"})
            local launched, c = launch(id, {fail_attempts = 10, retryable = true})
            test.eq(wait_terminal(c, launched.dataflow_id), consts.STATUS.COMPLETED_FAILURE)
            local node = nodes_by_def(launched.dataflow_id).step
            test.eq(node.metadata.error.attempts, 3)
            test.eq(node.metadata.func_retry, false)
        end)
        test.it("routes a non-retryable failure once to the Error boundary", function()
            local id = publish({maximum_attempts = 3, initial_interval = "10ms"})
            local launched, c = launch(id, {fail_attempts = 10, retryable = false})
            test.eq(wait_terminal(c, launched.dataflow_id), consts.STATUS.COMPLETED_FAILURE)
            local node = nodes_by_def(launched.dataflow_id).step
            test.eq(node.metadata.error.attempts, 1)
            test.eq(node.metadata.error.cause.retryable, false)
            local output = output_for(c, launched.dataflow_id)
            test.eq(output.code, "FUNCTION_EXECUTION_FAILED")
            test.contains(output.message, "Attempt failed")
            local rows = data_reader.with_dataflow(launched.dataflow_id)
                :with_data_types(consts.DATA_TYPE.WORKFLOW_OUTPUT):all()
            test.eq(#rows, 1)
            test.eq(rows[1].discriminator, "error")
        end)
    end)
end
return {run = test.run_cases(define_tests)}
