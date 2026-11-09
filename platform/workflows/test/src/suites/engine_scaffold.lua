-- Shared scaffold for the live-engine execution suites. Each suite builds one
-- instance with its own imported modules; no mutable state is shared.
type Map = { [string]: any }

local function new(deps: any): Map
    local test = deps.test
    local uuid = deps.uuid
    local uuid_v4 = uuid.v4
    local json = deps.json
    local funcs = deps.funcs
    local security = deps.security
    local time = deps.time
    local workflow = deps.workflow
    local version_publish = deps.version_publish
    local runs = deps.runs
    local types = deps.types
    local client = deps.client
    local consts = deps.consts
    local data_reader = deps.data_reader
    local node_reader = deps.node_reader
    local commit_repo = deps.commit_repo

    local C = types.COMMAND

    local TERMINAL = {
        [consts.STATUS.COMPLETED_SUCCESS] = true,
        [consts.STATUS.COMPLETED_FAILURE] = true,
        [consts.STATUS.CANCELLED] = true,
        [consts.STATUS.TERMINATED] = true,
    }

    local nodes_by_def

    local function cmd(ctype: string, body: any): any
        return { type = ctype, body = body }
    end

    local function wid(): string
        return (uuid_v4()) :: string
    end

    local function n(id: string, kind: string, extra: any): Map
        local out: Map = { id = id, kind = kind }
        if type(extra) == "table" then
            for k, v in pairs(extra :: Map) do out[k] = v end
        end
        return out
    end

    local function fixture(id: string): Map
        return { id = id, kind = "block", ref = "app:block.engine_linear", _fixture_root = true }
    end

    local function fn(id: string, extra: any?): Map
        local out = n(id, "block", extra)
        local function_id = tostring(out.ref or "")
        local name = function_id:match("^[^:]+:(.+)$") or id
        out.ref = "app:block." .. name
        out.config = type(out.config) == "table" and out.config or {}
        return out
    end

    local function agent_step(id: string, extra: any?): Map
        local out = n(id, "block", extra)
        out.ref = "app:block.configurable_agent"
        out.config = type(out.config) == "table" and out.config or {}
        return out
    end

    local function wait_step(id: string, extra: any?): Map
        local out = n(id, "block", extra)
        out.ref = "app:block.test_external_wait"
        out.config = type(out.config) == "table" and out.config or {}
        return out
    end

    local function e(id: string, source: string, target: string, extra: any): Map
        local out: Map = { id = id, source_id = source, target_id = target }
        if type(extra) == "table" then
            for k, v in pairs(extra :: Map) do out[k] = v end
        end
        return out
    end

    local function restore_real_engine()
        runs._client_new = function() return client.new() end
        runs._update_public_meta = function(_component_id, _patch) end
    end

    local function apply_workflow(workflow_id: string, nodes: any, edges: any)
        local commands: { any } = {}
        local omitted: { [string]: boolean } = {}
        for _, node in ipairs(nodes) do
            if (node :: Map)._fixture_root == true then
                omitted[tostring((node :: Map).id)] = true
            else
                commands[#commands + 1] = cmd((C.NODE_ADD) :: string, node)
            end
        end
        for _, edge in ipairs(edges or {}) do
            if not omitted[tostring((edge :: Map).source_id)] and not omitted[tostring((edge :: Map).target_id)] then
                commands[#commands + 1] = cmd((C.EDGE_ADD) :: string, edge)
            end
        end

        local _, apply_err = workflow.apply(workflow_id, commands, "engine-test")
        test.is_nil(apply_err)
    end

    local function apply_and_publish(workflow_id: string, nodes: any, edges: any)
        apply_workflow(workflow_id, nodes, edges)
        local published, publish_err = version_publish.publish(workflow_id, "engine-test")
        test.is_nil(publish_err)
        test.not_nil(published)
        test.eq((published :: Map).ok, true)
        return published
    end

    local function suite_scope(): any
        local policy, policy_err = security.policy("app:workflows_suite_policy")
        if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
        local scope, scope_err = security.new_scope({ policy })
        if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
        return scope
    end

    local function call_as(actor_id: string, args: any, actor_meta: any?): (any, any?)
        local actor, actor_err = security.new_actor(actor_id,
            type(actor_meta) == "table" and actor_meta or {})
        if actor_err or not actor then return nil, actor_err end
        return funcs.new()
            :with_actor(actor)
            :with_scope(suite_scope())
            :call("app:engine_execution_seam", args or {})
    end

    local function actor_client(actor_id: string): any
        return {
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
            signal = function(_, dataflow_id: string, signal_id: string, payload: any): (any, any?)
                local result, err = call_as(actor_id, {
                    op = "signal",
                    dataflow_id = dataflow_id,
                    signal_id = signal_id,
                    payload = payload,
                })
                if err then return nil, err end
                if type(result) ~= "table" or (result :: Map).success ~= true then
                    return nil, tostring(type(result) == "table" and (result :: Map).error or "signal failed")
                end
                return (result :: Map).result, nil
            end,
        }
    end

    local function launch_as(actor_id: string, workflow_id: string, input: any, mode: string?, actor_meta: any?): (any, any)
        local launched, launch_err = call_as(actor_id, {
            op = "launch", workflow_id = workflow_id, input = input, mode = mode,
        }, actor_meta)
        test.is_nil(launch_err)
        test.not_nil(launched)
        test.eq((launched :: Map).success, true)
        return (launched :: Map).result, actor_client(actor_id)
    end

    local function launch(workflow_id: string, input: any): (any, any)
        return launch_as("engine-live-test", workflow_id, input)
    end

    local function simulate(workflow_id: string, input: any): (any, any)
        local launched, launch_err = call_as("engine-live-test", {
            op = "simulate",
            workflow_id = workflow_id,
            input = input,
        })
        test.is_nil(launch_err)
        test.not_nil(launched)
        test.eq((launched :: Map).success, true)
        return (launched :: Map).result, actor_client("engine-live-test")
    end

    local function wait_terminal(c: any, dataflow_id: string): string
        local last_status = "unknown"
        local last_err = nil
        for _ = 1, 100 do
            local status, status_err = c:get_status(dataflow_id)
            last_status = tostring(status or "nil")
            last_err = status_err
            if status_err == nil and TERMINAL[status] then
                return tostring(status)
            end
            time.sleep("100ms")
        end
        error("dataflow did not reach a terminal state: " .. dataflow_id ..
            " last_status=" .. tostring(last_status) .. " err=" .. tostring(last_err))
    end

    local function wait_run_terminal(workflow_id: string, run_id: string): Map
        local last_status = "missing"
        for _ = 1, 100 do
            local run, err = runs.get_run(workflow_id, run_id)
            test.is_nil(err)
            if type(run) == "table" then
                last_status = tostring((run :: Map).status or "")
                if types.RUN_TERMINAL[last_status] then return run :: Map end
            end
            time.sleep("50ms")
        end
        error("workflow run did not receive terminal completion: " .. run_id .. " status=" .. last_status)
    end

    local function wait_nonterminal(c: any, dataflow_id: string): string
        local status = tostring(select(1, c:get_status(dataflow_id)) or "")
        test.is_true(not TERMINAL[status], "dataflow should be paused/non-terminal, got " .. status)
        return status
    end

    local function wait_for_commit_type(dataflow_id: string, commit_type: string): Map
        for _ = 1, 100 do
            local commits, err = commit_repo.list_by_dataflow(dataflow_id, { limit = 500 })
            test.is_nil(err)
            for _, commit in ipairs(commits or {}) do
                local payload = type((commit :: Map).payload) == "table" and (commit :: Map).payload or {}
                local encoded = select(1, json.encode(payload))
                if type(encoded) == "string" and encoded:find(commit_type, 1, true) then
                    return commit :: Map
                end
            end
            time.sleep("50ms")
        end
        error("missing dataflow commit type " .. commit_type .. " for " .. dataflow_id)
    end

    local function assert_park_and_arm_are_atomic(dataflow_id: string)
        local commits, err = commit_repo.list_by_dataflow(dataflow_id, { limit = 500 })
        test.is_nil(err)
        local found = false
        for _, commit in ipairs(commits or {}) do
            local payload = type((commit :: Map).payload) == "table" and (commit :: Map).payload or {}
            local encoded = select(1, json.encode(payload))
            if type(encoded) == "string"
                and encoded:find("node.yield", 1, true)
                and encoded:find("app:engine_await_arm", 1, true) then
                found = true
                break
            end
        end
        test.is_true(found, "Await arm declaration and node.yield must persist atomically before arming")
    end

    local function wait_await_signal(dataflow_id: string): Map
        local last_status = "missing"
        local last_nodes = ""
        for _ = 1, 100 do
            local reader, reader_err = node_reader.with_dataflow(dataflow_id)
            test.is_nil(reader_err)
            local rows, rows_err = reader:all()
            test.is_nil(rows_err)
            local summaries: { string } = {}
            for _, raw in ipairs(rows :: { any }) do
                local row = raw :: Map
                local cfg = type(row.config) == "table" and (row.config :: Map) or {}
                local metadata = type(row.metadata) == "table" and (row.metadata :: Map) or {}
                summaries[#summaries + 1] = table.concat({
                    tostring(row.type or "?"),
                    tostring(row.status or "?"),
                    tostring(metadata.error_message or metadata.status_message or ""),
                }, ":")
                if tostring(row.type or "") == "kickside.blocks:await" then
                    last_status = tostring(row.status or "")
                    return { signal_id = tostring(cfg.signal_id or row.node_id), node_id = row.node_id }
                end
            end
            last_nodes = table.concat(summaries, ",")
            time.sleep("100ms")
        end
        error("workflow Await signal correlation not recorded for dataflow " .. dataflow_id ..
            " await_status=" .. tostring(last_status) .. " nodes=" .. last_nodes)
    end

    local function output_for(c: any, dataflow_id: string): Map
        local output, output_err = c:output(dataflow_id)
        test.is_nil(output_err)
        test.not_nil(output)
        return output :: Map
    end

    function nodes_by_def(dataflow_id: string): Map
        local reader, reader_err = node_reader.with_dataflow(dataflow_id)
        test.is_nil(reader_err)
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

    local function node_input_count(dataflow_id: string, node_id: string): number
        local rows = data_reader.with_dataflow(dataflow_id)
            :with_nodes(node_id)
            :with_data_types(consts.DATA_TYPE.NODE_INPUT)
            :all()
        return #(rows :: { any })
    end

    return {
        C = C,
        TERMINAL = TERMINAL,
        cmd = cmd,
        wid = wid,
        n = n,
        fixture = fixture,
        fn = fn,
        agent_step = agent_step,
        wait_step = wait_step,
        e = e,
        restore_real_engine = restore_real_engine,
        apply_workflow = apply_workflow,
        apply_and_publish = apply_and_publish,
        suite_scope = suite_scope,
        call_as = call_as,
        actor_client = actor_client,
        launch_as = launch_as,
        launch = launch,
        simulate = simulate,
        wait_terminal = wait_terminal,
        wait_run_terminal = wait_run_terminal,
        wait_nonterminal = wait_nonterminal,
        wait_for_commit_type = wait_for_commit_type,
        assert_park_and_arm_are_atomic = assert_park_and_arm_are_atomic,
        wait_await_signal = wait_await_signal,
        output_for = output_for,
        nodes_by_def = nodes_by_def,
        node_input_count = node_input_count,
    }
end

return { new = new }
