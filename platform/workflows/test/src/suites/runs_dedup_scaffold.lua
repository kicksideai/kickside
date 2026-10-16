-- Shared scaffold for the runs dedup suites. Each suite builds one instance
-- with its own imported modules; per-instance evidence keeps suites isolated.
type Map = { [string]: any }

local M = {}

function M.stub_client(sink: Map, flows: Map): (any?, string?)
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

function M.readers(node_rows: { Map }, data_rows: { Map }, observe: any?): (any, any)
    local function reader(rows: { Map }, kind: string): any
        return function(): any
            return { with_dataflow = function(id: string): any
                if observe then observe(kind, "dataflow", { id }) end
                local q: any = {}
                function q:fetch_options(_opts: any): any return self end
                function q:order_by(_field: string, _direction: string): any return self end
                function q:with_nodes(...: any): any self.nodes = { ... }; return self end
                function q:with_data(...: any): any
                    self.ids = { ... }
                    if observe then observe(kind, "data", self.ids) end
                    return self
                end
                function q:all(): any
                    local out: { Map } = {}
                    for _, row in ipairs(rows) do
                        local keep = true
                        if self.nodes then
                            keep = false
                            for _, node in ipairs(self.nodes) do if row.node_id == node then keep = true end end
                        end
                        if self.ids then
                            keep = false
                            for _, data in ipairs(self.ids) do if row.data_id == data then keep = true end end
                        end
                        if keep then out[#out + 1] = row end
                    end
                    return out
                end
                return q
            end }
        end
    end
    return reader(node_rows, "node"), reader(data_rows, "data")
end

local function new(deps: any): Map
    local test = deps.test
    local uuid = deps.uuid
    local uuid_v4 = uuid.v4
    local json = deps.json
    local security = deps.security
    local funcs = deps.funcs
    local workflow = deps.workflow
    local version_publish = deps.version_publish
    local version_read = deps.version_read
    local runs = deps.runs
    local exec_api = deps.exec_api
    local types = deps.types
    local store = deps.store
    local maintenance = deps.maintenance
    local blocks = deps.blocks

    local C = types.COMMAND
    local RUN_STARTED = "kickside.workflows.runs.events:started"
    local RUN_FINISHED = "kickside.workflows.runs.events:finished"
    local RUN_FAILED = "kickside.workflows.runs.events:failed"
    local stub_flows: Map = {}

    local function cmd(ctype: string, body: any): any
        if ctype == C.NODE_ADD and type(body) == "table" then
            local node = body :: any
            if node.kind == "block" and type(node.ref) ~= "string" then node.ref = "app:block.engine_linear" end
        end
        return { type = ctype, body = body }
    end

    local function wid(): string
        return uuid_v4()
    end

    local function unauthenticated_run_detail_response(): Map
        local captured: Map = {}
        local response: Map = {
            set_content_type = function(_self: any, content_type: any) captured.content_type = content_type end,
            set_status = function(_self: any, status: any) captured.status = status end,
            write_json = function(_self: any, body: any) captured.body = body end,
        }
        local fake_http: Map = {
            CONTENT = { JSON = "application/json" },
            STATUS = { UNAUTHORIZED = 401 },
            request = function()
                return {
                    param = function(_self: any, name: string)
                        return name == "id" and "no-access" or "no-access-run"
                    end,
                }
            end,
            response = function() return response end,
        }
        local scoped_api = exec_api.new({ http = fake_http,
            security = { actor = function() return nil end } })
        scoped_api.get_run()
        return captured
    end

    local function publishable(id: string)
        workflow.apply(id, {
            cmd(C.NODE_ADD, { id = "t", kind = "block", ref = "app:block.engine_linear", title = "Prepare" }),
            cmd(C.NODE_ADD, { id = "f", kind = "block", ref = "app:block.engine_linear" }),
            cmd(C.EDGE_ADD, { id = "e", source_id = "t", target_id = "f" }),
        }, "tester")
        version_publish.publish(id, "tester")
    end

    local function publishable_workflow(id: string)
        workflow.apply(id, {
            cmd(C.NODE_ADD, { id = "start", kind = "start", title = "Start", config = {
                input_schema = {
                    type = "object",
                    required = { "lead_id" },
                    properties = { lead_id = { type = "string" }, source = { type = "string" } },
                },
            } }),
            cmd(C.NODE_ADD, { id = "worker", kind = "block", ref = "app:block.engine_item_or_fail", title = "Score" }),
            cmd(C.NODE_ADD, { id = "finish", kind = "finish", title = "Finish", config = {
                output_schema = {
                    type = "object",
                    required = { "score" },
                    properties = { score = { type = "number" } },
                },
            } }),
            cmd(C.NODE_ADD, { id = "error", kind = "error", title = "Error", config = {
                error_schema = {
                    type = "object",
                    required = { "message" },
                    properties = { message = { type = "string" } },
                },
            } }),
            cmd(C.EDGE_ADD, { id = "e1", source_id = "start", source_port = "out", target_id = "worker" }),
            cmd(C.EDGE_ADD, { id = "e2", source_id = "worker", target_id = "finish", target_port = "in" }),
            cmd(C.EDGE_ADD, { id = "e3", source_id = "worker", source_port = "failed", target_id = "error", target_port = "in" }),
        }, "tester")
        version_publish.publish(id, "tester")
    end

    local SINK_KIND = {
        ["test.blocks:sink"] = {
            id = "test.blocks:sink",
            kind = "block",
            config_schema = {
                type = "object",
                required = { "kb_id" },
                properties = { kb_id = { type = "string", minLength = 2 } },
            },
            ports = { { id = "result", direction = "out" } },
            execution = { kind = "function", function_id = "m:sink" },
            declaration = {
                id = "test.blocks:sink", kind = "registry.entry", meta = { type = "kickside.block" },
                data = { block = {
                    api_version = "kickside.block/v1",
                    input = { type = "object", additionalProperties = true },
                    config = { type = "object", required = { "kb_id" }, properties = { kb_id = { type = "string", minLength = 2 } } },
                    output = { type = "object", additionalProperties = true },
                    ports = { { id = "result", direction = "out" } },
                    execution = { kind = "function", function_id = "m:sink" },
                } },
            },
        },
    }

    local function with_sink_catalog(fn: any)
        local sink_publish = version_publish.new({ block_catalog = function()
            local catalog, catalog_err = blocks.catalog()
            if catalog_err or type(catalog) ~= "table" then return catalog, catalog_err end
            local copied: Map = {}
            for id, declaration in pairs(catalog :: Map) do copied[id] = declaration end
            for id, declaration in pairs(SINK_KIND) do copied[id] = declaration end
            return copied, nil
        end })
        fn(sink_publish, runs.new({ version_publish = sink_publish }))
    end

    local function publishable_sink(id: string, version_repo: any)
        local _, apply_err = workflow.apply(id, {
            cmd(C.NODE_ADD, { id = "entry", kind = "block", ref = "app:block.engine_linear" }),
            cmd(C.NODE_ADD, { id = "knowledge_sink", kind = "block", ref = "test.blocks:sink", config = { kb_id = "kb-live" } }),
            cmd(C.EDGE_ADD, { id = "to_sink", source_id = "entry", target_id = "knowledge_sink" }),
        }, "tester")
        test.is_nil(apply_err)
        local published = select(1, version_repo.publish(id, "tester"))
        test.is_true((published :: Map).ok)
    end

    -- The stub engine records what it is asked to create/start.
    runs._dataflow_get = function(dataflow_id: string): (any?, string?) return stub_flows[dataflow_id], nil end
    local function stub_client(sink: Map): (any?, string?)
        return M.stub_client(sink, stub_flows)
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

    local function with_lifecycle(recorder: Map, fn: any)
        local scoped_runs = runs.fork()
        recorder.events = {}
        scoped_runs._append_event = function(thread_id: string, event: Map): (any?, string?)
            (recorder.events :: { any })[#(recorder.events :: { any }) + 1] = { thread_id = thread_id, event = event }
            return { success = true }, nil
        end
        fn(scoped_runs)
        for _, emitted in ipairs(recorder.events :: { any }) do
            local event = emitted.event :: Map
            if event.type == RUN_STARTED then
                local run_id = tostring((event.body :: Map).run_id)
                local db = select(1, store.open_db())
                local rows = (db :: any):query("SELECT terminal_event_pending FROM workflow_runs WHERE run_id=$1", { run_id })
                local pending = rows and rows[1] and rows[1].terminal_event_pending
                if pending == true or pending == 1 then
                    local _, due_err = (db :: any):execute("UPDATE workflow_runs SET terminal_event_check_at=$1"
                        .. " WHERE run_id=$2", { "2000-01-01T00:00:00Z", run_id })
                    test.is_nil(due_err)
                    ;(db :: any):release()
                    local checker = maintenance.new({
                        client_new = function() return stub_client({ created = 0, started = 0 }), nil end,
                        append_event = function(thread_id: string, terminal_event: Map)
                            return scoped_runs._append_event(thread_id, terminal_event)
                        end,
                    })
                    local tick, tick_err = checker.tick(1, run_id)
                    test.is_nil(tick_err)
                    test.eq(tick.failures, 0, tostring(tick.last_error))
                else
                    (db :: any):release()
                end
            end
        end
    end

    local function with_threads_contract(recorder: Map, fn: any)
        local scoped_runs = runs.fork()
        local actor = { id = function() return "lifecycle-actor" end }
        local scope = { id = "lifecycle-scope" }
        scoped_runs._security_actor = function() return actor end
        scoped_runs._security_scope = function() return scope end
        scoped_runs._threads_contract = function()
            return {
                with_actor = function(_self: any, actor: any)
                    recorder.actor = actor
                    return {
                        with_scope = function(_scoped: any, scope: any)
                            recorder.scope = scope
                            return {
                                open = function()
                                    return {
                                        emit = function(_inst: any, args: Map)
                                            recorder.emit = args
                                            return { success = true }, nil
                                        end,
                                    }, nil
                                end,
                            }
                        end,
                    }
                end,
            }, nil
        end
        fn(scoped_runs)
    end

    local function count_runs(id: string): number
        local list = select(1, runs.list_runs(id, { limit = 200 }))
        return #(list :: { any })
    end

    local function count_versions(id: string): number
        local list = select(1, version_read.list(id))
        return #(list :: { any })
    end

    local function encode_json(v: any): string
        local out, err = json.encode(type(v) == "table" and v or {})
        if err or type(out) ~= "string" then return "{}" end
        return out
    end

    local function insert_run_row(run: Map)
        local db = select(1, store.open_db())
        if not db then error("db unavailable") end
        local _, err = db:execute(
            "INSERT INTO " .. types.TABLES.RUNS ..
            " (run_id, workflow_id, version, dataflow_id, trigger_kind, origin, status, started_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            {
                run.run_id,
                run.workflow_id,
                tonumber(run.version) or 1,
                run.dataflow_id,
                run.trigger_kind or "manual",
                run.origin or "published",
                run.status or "running",
                run.started_at or "2026-01-01T00:00:00Z",
            })
        db:release()
        if err then error("insert run: " .. tostring(err)) end
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
            :call("app:runs_simulate_seam", args or {})
    end

    return {
        C = C,
        cmd = cmd,
        wid = wid,
        unauthenticated_run_detail_response = unauthenticated_run_detail_response,
        publishable = publishable,
        publishable_workflow = publishable_workflow,
        with_sink_catalog = with_sink_catalog,
        publishable_sink = publishable_sink,
        stub_client = stub_client,
        complete_stub = complete_stub,
        with_lifecycle = with_lifecycle,
        with_threads_contract = with_threads_contract,
        count_runs = count_runs,
        count_versions = count_versions,
        encode_json = encode_json,
        insert_run_row = insert_run_row,
        suite_scope = suite_scope,
        call_as = call_as,
    }
end

M.new = new
return M
