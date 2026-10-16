local test = require("test")
local uuid_v4 = require("uuid").v4
local funcs = require("funcs")
local security = require("security")
local process = require("process")
local channel = require("channel")
local time = require("time")
local workflow = require("workflow")
local version_publish = require("version_publish")
local types = require("types")
local engine_consts = require("engine_consts")
local data_reader = require("data_reader")
local node_reader = require("node_reader")

type Map = { [string]: any }

local C = types.COMMAND
local GAUNTLET_ACTOR = "gauntlet"
local gauntlet_workflow_ids: { [string]: boolean } = {}
local event_listeners: { any } = {}
local TERMINAL = {
    [engine_consts.STATUS.COMPLETED_SUCCESS] = true,
    [engine_consts.STATUS.COMPLETED_FAILURE] = true,
    [engine_consts.STATUS.CANCELLED] = true,
    [engine_consts.STATUS.TERMINATED] = true,
}

local builders = require("builders")
local n, fn, wait_step, e = builders.n, builders.fn, builders.wait_step, builders.e

local function wf_id(): string
    local id = uuid_v4()
    gauntlet_workflow_ids[id] = true
    return id
end

local function cleanup_gauntlet_workflows()
    for _, listener in ipairs(event_listeners) do
        if not listener.closed then
            process.send(listener.pid, "stop", {})
            process.unlisten(listener.events)
            listener.closed = true
        end
    end
    event_listeners = {}
    local ids: { string } = {}
    for id, _ in pairs(gauntlet_workflow_ids) do ids[#ids + 1] = id end
    for _, id in ipairs(ids) do
        local ok, purge_err = workflow.purge(id)
        test.is_true(ok, "gauntlet fixture cleanup failed for " .. id .. ": " .. tostring(purge_err))
    end
    gauntlet_workflow_ids = {}
end

local function apply_workflow(workflow_id: string, nodes: any, edges: any)
    local commands: { any } = {}
    local omitted: { [string]: boolean } = {}
    for _, node in ipairs(nodes) do
        if (node :: Map)._fixture_root == true then
            omitted[tostring((node :: Map).id)] = true
        else
            commands[#commands + 1] = { type = C.NODE_ADD, body = node }
        end
    end
    for _, edge in ipairs(edges or {}) do
        if not omitted[tostring((edge :: Map).source_id)] and not omitted[tostring((edge :: Map).target_id)] then
            commands[#commands + 1] = { type = C.EDGE_ADD, body = edge }
        end
    end
    local _, apply_err = workflow.apply(workflow_id, commands, "gauntlet")
    test.is_nil(apply_err)
end

local function apply_and_publish(workflow_id: string, nodes: any, edges: any)
    apply_workflow(workflow_id, nodes, edges)
    local published, publish_err = version_publish.publish(workflow_id, "gauntlet")
    test.is_nil(publish_err)
    test.not_nil(published)
    test.eq((published :: Map).ok, true)
end

local function wait_terminal(c: any, dataflow_id: string): string
    local status, status_err = c:get_status(dataflow_id)
    test.is_nil(status_err)
    if not TERMINAL[status] then
        local driven, drive_err = c:execute(dataflow_id)
        test.is_nil(drive_err)
        test.not_nil(driven)
        status, status_err = c:get_status(dataflow_id)
        test.is_nil(status_err)
    end
    local deadline = time.after("30s")
    while not TERMINAL[status] do
        local selected = channel.select({ c.events:case_receive(), deadline:case_receive() })
        test.is_true(selected.channel ~= deadline,
            "dataflow completion event did not arrive: " .. dataflow_id .. " status=" .. tostring(status))
        local payload = selected.value
        if type(payload) == "table" and payload.dataflow_id == dataflow_id then
            status, status_err = c:get_status(dataflow_id)
            test.is_nil(status_err)
        end
    end
    local reconciled, reconcile_err = c:reconcile(dataflow_id)
    test.is_nil(reconcile_err)
    test.not_nil(reconciled)
    c:close()
    return tostring(status)
end

local function wait_nonterminal(c: any, dataflow_id: string)
    local status = tostring(select(1, c:get_status(dataflow_id)) or "")
    test.is_true(not TERMINAL[status], "dataflow should be waiting, got " .. status)
end

local function output_for(c: any, dataflow_id: string): Map
    local output, output_err = c:output(dataflow_id)
    test.is_nil(output_err)
    test.not_nil(output)
    return output :: Map
end

local function nodes_by_def(dataflow_id: string): Map
    local reader, reader_err = node_reader.with_dataflow(dataflow_id)
    test.is_nil(reader_err)
    if not reader then error("node reader unavailable") end
    local rows, rows_err = reader:fetch_options({}):all()
    test.is_nil(rows_err)
    local out: Map = {}
    for _, row in ipairs(rows :: { any }) do
        local metadata = type(row.metadata) == "table" and row.metadata or {}
        local def_id = tostring((metadata :: Map).def_node_id or "")
        if def_id ~= "" then out[def_id] = row end
    end
    return out
end

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function call_as(actor_id: string, args: any): (any, any?)
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then return nil, actor_err end
    return funcs.new()
        :with_actor(actor)
        :with_scope(suite_scope())
        :call("app:coverage_gauntlet_seam", args or {})
end

local function actor_client(actor_id: string): any
    local reply_topic = "gauntlet:dataflow:" .. uuid_v4()
    local events = process.listen(reply_topic)
    local pid, spawn_err = process.spawn("app:gauntlet_event_listener", engine_consts.HOST_ID, {
        actor_id = actor_id, reply_pid = tostring(process.pid()), reply_topic = reply_topic,
    })
    test.is_nil(spawn_err)
    test.not_nil(pid)
    local deadline = time.after("10s")
    local ready = channel.select({ events:case_receive(), deadline:case_receive() })
    test.is_true(ready.channel ~= deadline, "dataflow event listener did not become ready")
    local ready_payload = ready.value
    test.eq(ready_payload.kind, "ready")
    test.is_true(ready_payload.ok == true, tostring(ready_payload.error))
    local listener = { pid = tostring(pid), events = events, closed = false }
    event_listeners[#event_listeners + 1] = listener
    return {
        events = events,
        close = function()
            if listener.closed then return end
            process.send(listener.pid, "stop", {})
            process.unlisten(events)
            listener.closed = true
        end,
        get_status = function(_, dataflow_id: string): (any, any?)
            local result, err = call_as(actor_id, { op = "get_status", dataflow_id = dataflow_id })
            if err then return nil, err end
            if type(result) ~= "table" or (result :: Map).success ~= true then
                return nil, tostring(type(result) == "table" and (result :: Map).error or "status failed")
            end
            return (result :: Map).result, nil
        end,
        output = function(_, dataflow_id: string): (any, any?)
            local result, err = call_as(actor_id, { op = "output", dataflow_id = dataflow_id })
            if err then return nil, err end
            if type(result) ~= "table" or (result :: Map).success ~= true then
                return nil, tostring(type(result) == "table" and (result :: Map).error or "output failed")
            end
            return (result :: Map).result, nil
        end,
        execute = function(_, dataflow_id: string): (any, any?)
            local result, err = call_as(actor_id, { op = "drive", dataflow_id = dataflow_id })
            if err then return nil, err end
            if type(result) ~= "table" or (result :: Map).success ~= true then
                return nil, type(result) == "table" and (result :: Map).error or "drive failed"
            end
            return (result :: Map).result, nil
        end,
        reconcile = function(_, dataflow_id: string): (any, any?)
            local result, err = call_as(actor_id, { op = "reconcile", dataflow_id = dataflow_id })
            if err then return nil, err end
            if type(result) ~= "table" or (result :: Map).success ~= true then
                return nil, type(result) == "table" and (result :: Map).error or "reconcile failed"
            end
            return (result :: Map).result, nil
        end,
    }
end

local function launch(workflow_id: string, input: any): (any, any)
    local actor_id = "gauntlet-live-" .. uuid_v4()
    local c = actor_client(actor_id)
    local launched, launch_err = call_as(actor_id, {
        op = "launch",
        workflow_id = workflow_id,
        input = input,
    })
    test.is_nil(launch_err)
    test.not_nil(launched)
    test.eq((launched :: Map).success, true)
    return (launched :: Map).result, c
end

local function wait_await_signal(dataflow_id: string): Map
    local reader, reader_err = node_reader.with_dataflow(dataflow_id)
    test.is_nil(reader_err)
    if not reader then error("node reader unavailable") end
    local rows, rows_err = reader:all()
    test.is_nil(rows_err)
    for _, raw in ipairs(rows :: { any }) do
        local entry = raw :: Map
        if tostring(entry.type or "") == "kickside.blocks:await" then
            local cfg = type(entry.config) == "table" and (entry.config :: Map) or {}
            return { signal_id = tostring(cfg.signal_id or entry.node_id), node_id = entry.node_id }
        end
    end
    error("await signal was not recorded after one durable drive for " .. dataflow_id)
end

local function node_input_count(dataflow_id: string, node_id: string): number
    local rows = data_reader.with_dataflow(dataflow_id)
        :with_nodes(node_id)
        :with_data_types(engine_consts.DATA_TYPE.NODE_INPUT)
        :all()
    return #(rows :: { any })
end

local function define_tests()
    test.describe("workflow coverage gauntlet: live engine", function()
        test.before_all(cleanup_gauntlet_workflows)
        test.after_all(cleanup_gauntlet_workflows)

        test.it("runs sequential edge transforms into the terminal node", function()
            local id = wf_id()
            apply_and_publish(id, {
                fn("t"),
                fn("linear", { ref = "app:engine_linear" }),
            }, {
                e("e0", "t", "linear", { transform = "{ text: output.text, count: output.input_echo.count }" }),
            })
            local launched, c = launch(id, { text = "map", count = 9 })
            local df = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, df), engine_consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, df).result :: Map
            test.eq(result.kind, "linear")
            test.eq(result.transformed, "MAP:9")
            test.eq(((result.input_echo :: Map).count), 9)
        end)

        test.it("runs a branch merge without deadlocking the untaken arm", function()
            local id = wf_id()
            apply_and_publish(id, {
                fn("t"),
                fn("decide", { ref = "app:engine_decide" }),
                n("b", "branch", { config = { predicate = "route_a" } }),
                fn("a", { ref = "app:engine_arm_a" }),
                fn("r", { ref = "app:engine_arm_b" }),
                n("m", "combine", { config = { mode = "first_wins" } }),
            }, {
                e("e0", "t", "decide", { transform = "output.input_echo" }),
                e("e1", "decide", "b"),
                e("true", "b", "a", { source_port = "true" }),
                e("false", "b", "r", { source_port = "false" }),
                e("am", "a", "m"),
                e("rm", "r", "m"),
            })
            local launched, c = launch(id, { amount = 12 })
            local df = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, df), engine_consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, df).result :: Map
            test.eq(result.arm, "A")
            local by_def = nodes_by_def(df)
            test.eq(node_input_count(df, (by_def.r :: Map).node_id), 0)
        end)

        test.it("resumes a durable signal wait in the middle of a graph", function()
            local id = wf_id()
            local actor_id = "gauntlet-signal-" .. uuid_v4()
            apply_and_publish(id, {
                fn("t"),
                wait_step("sig", { config = { signal_id = "sig:gauntlet-live" } }),
                fn("a", { ref = "app:engine_arm_a" }),
            }, {
                e("e0", "t", "sig"),
                e("e1", "sig", "a"),
            })
            local c = actor_client(actor_id)
            local launched_call, launch_err = call_as(actor_id, {
                op = "launch", workflow_id = id, input = { ignored = true },
            })
            test.is_nil(launch_err)
            test.eq((launched_call :: Map).success, true)
            local launched = (launched_call :: Map).result :: Map
            local df = tostring((launched :: Map).dataflow_id)
            wait_nonterminal(c, df)
            local signal = wait_await_signal(df)
            local resume_call, rerr = call_as(actor_id, {
                op = "resume",
                dataflow_id = df,
                signal_id = signal.signal_id,
                payload = { amount = 42, route_a = true },
            })
            test.is_nil(rerr)
            test.eq((resume_call :: Map).success, true)
            local resumed = (resume_call :: Map).result :: Map
            test.eq((resumed :: Map).ok, true)
            test.eq(wait_terminal(c, df), engine_consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, df).result :: Map
            test.eq(result.arm, "A")
            test.eq(result.amount, 42)
        end)

        test.it("resumes a provider-declared Await through its continue arm", function()
            local id = wf_id()
            local actor_id = "gauntlet-await-" .. uuid_v4()
            apply_and_publish(id, {
                fn("t"),
                n("h", "block", { ref = "app:block.test_external_wait", config = {} }),
                fn("a", { ref = "app:engine_arm_a" }),
                fn("r", { ref = "app:engine_arm_b" }),
            }, {
                e("e0", "t", "h"),
                e("yes", "h", "a", { source_port = "then" }),
                e("no", "h", "r", { source_port = "else" }),
            })
            local c = actor_client(actor_id)
            local launched, launch_err = call_as(actor_id, { op = "launch", workflow_id = id, input = { amount = 1 } })
            test.is_nil(launch_err)
            test.eq((launched :: Map).success, true)
            local run = (launched :: Map).result :: Map
            local df = tostring(run.dataflow_id)
            wait_nonterminal(c, df)
            local signal = wait_await_signal(df)
            local resumed, rerr = call_as(actor_id, {
                op = "resume",
                dataflow_id = df,
                signal_id = signal.signal_id,
                payload = { outcome = "continue", form = { reason = "covered" } },
            })
            test.is_nil(rerr)
            test.eq((resumed :: Map).success, true)
            test.eq(wait_terminal(c, df), engine_consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, df).result :: Map
            test.eq(result.arm, "A")
            test.eq(((result.source :: Map).form :: Map).reason, "covered")
        end)

        test.it("runs a cycle for multiple iterations and exits by continue_condition", function()
            local id = wf_id()
            apply_and_publish(id, {
                fn("t"),
                n("c", "cycle", {
                    config = {
                        continue_condition = "iteration < 3",
                        max_iterations = 4,
                        initial_state = { seed = 1 },
                    },
                }),
                fn("cycle_step", { ref = "app:coverage_cycle_step" }),
            }, {
                e("e0", "t", "c", { transform = "output.input_echo" }),
                e("body", "c", "cycle_step", { source_port = "body" }),
            })
            local launched, c = launch(id, { text = "loop" })
            local df = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, df), engine_consts.STATUS.COMPLETED_SUCCESS)
            local result = output_for(c, df).result :: Map
            test.eq(tonumber(result.iteration), 3)
            test.eq(((result.state :: Map).seed), 1)
            test.eq(((result.state :: Map).source :: Map).text, "loop")
        end)

        test.it("keeps loop-cap exhaustion fatal without a declaration-owned Failed port", function()
            local id = wf_id()
            apply_and_publish(id, {
                fn("t"),
                n("c", "cycle", {
                    config = {
                        continue_condition = "true",
                        max_iterations = 1,
                    },
                }),
                fn("cycle_step", { ref = "app:coverage_cycle_step" }),
            }, {
                e("e0", "t", "c", { transform = "output.input_echo" }),
                e("body", "c", "cycle_step", { source_port = "body" }),
            })
            local launched, c = launch(id, { text = "cap" })
            local df = tostring((launched :: Map).dataflow_id)
            test.eq(wait_terminal(c, df), engine_consts.STATUS.COMPLETED_FAILURE)
            local cycle = nodes_by_def(df).c :: Map
            test.eq(tostring(cycle.status), engine_consts.STATUS.COMPLETED_FAILURE)
            local reason = (cycle.metadata :: Map).error :: Map
            test.eq(tostring(reason.code), "MAX_ITERATIONS_EXCEEDED")
            test.contains(tostring(reason.message), "Maximum iterations (1) exceeded")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
