local test = require("test")
local workflow = require("workflow")
local version_publish = require("version_publish")
local runs = require("runs")
local types = require("types")
local store = require("store")
local repo = require("workflow_repo")
local component = require("component")
local security = require("security")
local funcs = require("funcs")

type Map = { [string]: any }
local C = types.COMMAND
local stub_flows: Map = {}

local function cmd(ctype: string, body: any): any
    if ctype == C.NODE_ADD and type(body) == "table" then
        local node = body :: any
        if node.kind == "block" and type(node.ref) ~= "string" then node.ref = "app:block.engine_linear" end
    end
    return { type = ctype, body = body }
end

local function publishable(id: string)
    workflow.apply(id, {
        cmd(C.NODE_ADD, { id = "t", kind = "block", ref = "app:block.engine_linear", title = "Prepare" }),
        cmd(C.NODE_ADD, { id = "f", kind = "block", ref = "app:block.engine_linear" }),
        cmd(C.EDGE_ADD, { id = "e", source_id = "t", target_id = "f" }),
    }, "tester")
    version_publish.publish(id, "tester")
end

-- Records what the stub engine was asked to create/start.
local function stub_client(sink: Map): (any?, string?)
    local flows = stub_flows
    return {
        create_workflow = function(_self: any, commands: any, options: any): (any?, string?)
            sink.created = sink.created + 1
            sink.last_commands = commands
            sink.last_options = options
            flows[tostring((options :: Map).dataflow_id)] = { status = "pending" }
            return tostring((options :: Map).dataflow_id or "df"), nil
        end,
        get_status = function(_self: any, dataflow_id: string): (any?, any?)
            if not flows[dataflow_id] then return nil, "Workflow not found or access denied" end
            return flows[dataflow_id].status, nil
        end,
        start = function(_self: any, dataflow_id: any, options: any): (any?, string?)
            sink.started = sink.started + 1
            sink.last_start_options = options
            flows[tostring(dataflow_id)] = { status = "running" }
            return dataflow_id, nil
        end,
        execute = function(_self: any, dataflow_id: any, options: any): (any?, string?)
            sink.executed = (tonumber(sink.executed) or 0) + 1
            sink.last_start_options = options
            flows[tostring(dataflow_id)] = { status = "completed" }
            return { success = true, dataflow_id = dataflow_id, data = sink.execute_output or {} }, nil
        end,
        output = function(_self: any, dataflow_id: any): (any?, string?)
            if type(sink.outputs) == "table" then return (sink.outputs :: Map)[tostring(dataflow_id)], nil end
            return nil, nil
        end,
        signal = function(_self: any, dataflow_id: any, signal_id: any, payload: any): (any?, string?)
            sink.signals = type(sink.signals) == "table" and sink.signals or {}
            (sink.signals :: { any })[#(sink.signals :: { any }) + 1] = {
                dataflow_id = dataflow_id,
                signal_id = signal_id,
                payload = payload,
            }
            return { commit_id = "commit-child" }, nil
        end,
    }, nil
end

local function complete_stub(target: any, args: Map): (any?, any?)
    local statuses: Map = { completed = "completed", failed = "failed",
        cancelled = "cancelled", terminated = "terminated" }
    local status = statuses[args.status]
    if status then
        local dataflow_id = args.dataflow_id
        if not dataflow_id and args.run_id then
            local db = select(1, store.open_db())
            local rows = (db :: any):query("SELECT dataflow_id FROM workflow_runs WHERE run_id=$1", { args.run_id })
            ;(db :: any):release()
            dataflow_id = rows and rows[1] and rows[1].dataflow_id or nil
        end
        if dataflow_id then
            stub_flows[tostring(dataflow_id)] = { status = status }

        end
    end
    return target.run_completed(args)
end

local function define_tests()
    test.describe("Workflow completion public metadata", function()
        test.it("a user-run completion callback cannot write public metadata", function()
            local created, create_err = repo.create("Completion metadata")
            test.is_nil(create_err)
            local id = (created :: Map).id
            publishable(id)
            local meta_calls = 0
            local scoped = runs.new({ client_new = function() return stub_client({ created = 0, started = 0 }) end,
                update_public_meta = function() meta_calls = meta_calls + 1; return true, nil end })
            local launched, launch_err = scoped.launch(id, { version = 1, input = {} })
            test.is_nil(launch_err)
            local done, done_err = complete_stub(scoped, { run_id = (launched :: Map).run_id, status = "completed" })
            test.is_nil(done_err)
            test.eq((done :: Map).status, "completed")
            test.eq(meta_calls, 0)
            local db = select(1, store.open_db())
            local rows, read_err = (db :: any):query(
                "SELECT public_meta_refreshed_at FROM workflow_runs WHERE run_id=$1", { (launched :: Map).run_id })
            ;(db :: any):release()
            test.is_nil(read_err)
            test.is_nil(rows[1].public_meta_refreshed_at)
            local write_db = select(1, store.open_db())
            local _, token_err = (write_db :: any):execute(
                "UPDATE workflow_runs SET terminal_event_token=$1 WHERE run_id=$2",
                { "metadata-publication-test", (launched :: Map).run_id })
            ;(write_db :: any):release()
            test.is_nil(token_err)
            local published, publish_err = funcs.call("kickside.workflows.runs:maintenance_publish", {
                phase = "publish_event", run_id = (launched :: Map).run_id,
                token = "metadata-publication-test",
            })
            test.is_nil(publish_err)
            test.eq(published, true)
            local components, meta_err = component.query({ component_ids = { id }, include = { meta = true }, limit = 1 })
            test.is_nil(meta_err)
            test.eq(tonumber(components[1].meta.runs_total), 1)
            test.is_true(type(components[1].meta.last_run_at) == "string")
        end)

    end)
end

local run_cases = test.run_cases(define_tests)

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function run(options: any): any
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("completion suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:run_completed_public_meta_actor_run", options or {})
    if err then error("completion suite: " .. tostring(err)) end
    return result
end

return { run = run, actor_run = function(options: any): any return run_cases(options) end }
