-- Run-plane fixtures against the migrated schema. The dataflow client and status reader
-- are seams so the read model, dedup, and idempotent completion logic are
-- exercised without a live engine. Launch loads a published version, remints, records the
-- run row, and (stub) creates+starts the dataflow.

local test = require("test")
local uuid_v4 = require("uuid").v4
local json = require("json")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local workflow = require("workflow")
local version_publish = require("version_publish")
local version_read = require("version_read")
local stub_flows: { [string]: any } = {}
local runs = require("runs").new({ dataflow_get = function(id: string): (any?, string?) return stub_flows[id], nil end })
local dedup_scaffold = require("dedup_scaffold")
local exec_api = require("exec_api")
local runner = require("runner")
local agent_tool = require("agent_tool")
local types = require("types")
local store = require("store")
local repo = require("workflow_repo")
local errors = require("errors")
local admission = require("admission")
local maintenance = require("maintenance")
local blocks = require("block_catalog")
local client = require("client")

type Map = { [string]: any }

local C = types.COMMAND
local RUN_STARTED = "kickside.workflows.runs.events:started"
local RUN_FINISHED = "kickside.workflows.runs.events:finished"
local RUN_FAILED = "kickside.workflows.runs.events:failed"

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

-- Records what the stub engine was asked to create/start.
local function stub_client(sink: Map): (any?, string?)
    return dedup_scaffold.stub_client(sink, stub_flows)
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
    if not err and run.admission_state ~= nil then
        _, err = db:execute("UPDATE " .. types.TABLES.RUNS .. " SET admission_state=$1 WHERE run_id=$2",
            { run.admission_state, run.run_id })
    end
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

local function define_tests()





    test.describe("Workflow runs read model", function()
        test.it("lists runs newest first with paging", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            runs._update_public_meta = function(_c, _p) end
            for _ = 1, 3 do runs.launch(id, { version = 1, input = {} }) end
            local page = select(1, runs.list_runs(id, { limit = 2, offset = 0 }))
            test.eq(#(page :: { any }), 2)
            local rest = select(1, runs.list_runs(id, { limit = 2, offset = 2 }))
            test.eq(#(rest :: { any }), 1)
        end)

        for _, state in ipairs({
            {status = "pending", admission_state = "unadmitted"},
            {status = "pending", admission_state = "admitted"},
            {status = "completed", admission_state = "admitted"},
        }) do
            test.it("keeps engine admission private in the established run projection: " .. state.status .. "/" .. state.admission_state, function()
                local id = wid()
                local run_id, dataflow_id = "run-public-" .. id, "df-public-" .. id
                insert_run_row({run_id = run_id, workflow_id = id, dataflow_id = dataflow_id,
                    status = state.status, admission_state = state.admission_state})
                local run, run_err = runs.get_run(id, run_id)
                test.is_nil(run_err)
                test.not_nil(run)
                test.eq((run :: Map).run_id, run_id)
                test.eq((run :: Map).dataflow_id, dataflow_id)
                test.eq((run :: Map).status, state.status)
                test.is_nil((run :: Map).admission_state)
                local page, page_err = runs.list_runs(id, {})
                test.is_nil(page_err)
                test.eq(#(page :: {Map}), 1)
                test.is_nil(((page :: {Map})[1]).admission_state)
                local detail, detail_err = runs.debug_detail(id, run_id)
                test.is_nil(detail_err)
                test.not_nil(detail)
                test.is_nil(((detail :: Map).run :: Map).admission_state)
            end)
        end

        test.it("exposes persisted engine failure details in the run detail", function()
            local id = wid()
            local run_id, dataflow_id = uuid_v4(), uuid_v4()
            insert_run_row({ run_id = run_id, workflow_id = id, dataflow_id = dataflow_id, status = "failed" })
            local details = { { node_id = "test_node", error = { code = "EXEC_FAILED",
                cause = { kind = "NotFound", retryable = false,
                    details = { error_type = "model_error", model = "test_model", api_key = "synthetic-secret" } } } } }
            stub_flows[dataflow_id] = { status = "failed", metadata = { error_details = details } }
            local detail, err = runs.debug_detail(id, run_id)
            test.is_nil(err)
            local returned = detail.run.error_details
            test.not_nil(returned)
            test.eq(returned[1].error.cause.kind, "NotFound")
            test.is_false(returned[1].error.cause.retryable)
            test.eq(returned[1].error.cause.details.error_type, "model_error")
            test.eq(returned[1].error.cause.details.model, "test_model")
            test.eq(returned[1].error.cause.details.api_key, "[redacted]")
        end)

        test.it("lists an unadmitted reservation without reading its allocated engine id", function()
            local id = wid()
            local run_id, dataflow_id = "run-reserved-" .. id, "df-reserved-" .. id
            insert_run_row({ run_id = run_id, workflow_id = id, dataflow_id = dataflow_id,
                status = "pending", admission_state = "unadmitted" })
            local calls = 0
            local original = runs._dataflow_get
            runs._dataflow_get = function(_id: string): (any?, string?)
                calls = calls + 1
                return nil, "Workflow not found"
            end
            local page, err = runs.list_runs(id, { limit = 10 })
            runs._dataflow_get = original
            test.is_nil(err)
            test.eq(calls, 0)
            local rows = page :: { Map }
            test.eq(#rows, 1)
            test.eq(rows[1].run_id, run_id)
            test.eq(rows[1].dataflow_id, dataflow_id)
            test.eq(rows[1].status, "pending")
            test.is_nil(rows[1].dataflow_status)
        end)

        test.it("projects an unadmitted reservation through detail export and timeline without engine reads", function()
            local id = wid()
            local run_id = "run-reserved-detail-" .. id
            insert_run_row({ run_id = run_id, workflow_id = id, dataflow_id = "df-reserved-detail-" .. id,
                status = "pending", admission_state = "unadmitted" })
            local calls = 0
            local original = runs._dataflow_get
            runs._dataflow_get = function(_id: string): (any?, string?)
                calls = calls + 1
                return nil, "Workflow not found"
            end
            local detail, detail_err = runs.debug_detail(id, run_id)
            local export, export_err = runs.run_export(id, run_id)
            local timeline, timeline_err = runs.run_timeline(id, run_id, {})
            runs._dataflow_get = original
            test.is_nil(detail_err)
            test.is_nil(export_err)
            test.is_nil(timeline_err)
            test.eq(calls, 0)
            test.eq(((detail :: Map).run :: Map).status, "pending")
            test.eq(#((detail :: Map).nodes :: { any }), 0)
            test.is_nil((detail :: Map).snapshot)
            test.is_nil((export :: Map).dataflow)
            test.eq(#((export :: Map).nodes :: { any }), 0)
            test.eq(#((export :: Map).data :: { any }), 0)
            test.eq((timeline :: Map).count, 1)
            test.eq((((timeline :: Map).events :: { Map })[1]).source, "flow_run")
        end)

        test.it("returns empty node projections for an unadmitted reservation without reading engine storage", function()
            local id = wid()
            local run_id = "run-reserved-nodes-" .. id
            insert_run_row({ run_id = run_id, workflow_id = id, dataflow_id = "df-reserved-nodes-" .. id,
                status = "pending", admission_state = "unadmitted" })
            local calls = 0
            local original = runs._node_reader
            runs._node_reader = function(): any
                calls = calls + 1
                return { with_dataflow = function(_id: string): any
                    local q: any = {}
                    function q:fetch_options(_opts: any): any return self end
                    function q:all(): (any?, string?) return nil, "engine nodes unavailable" end
                    return q
                end }
            end
            local headers, headers_err = runs.run_node_headers(id, run_id)
            local data, data_err = runs.run_node_data(id, run_id, "node", {})
            runs._node_reader = original
            test.is_nil(headers_err)
            test.is_nil(data_err)
            test.eq(calls, 0)
            test.eq(#(headers :: { any }), 0)
            test.eq(#(data :: { any }), 0)
        end)

        test.it("preserves engine read errors for an admitted run with pending status", function()
            local id = wid()
            local run_id = "run-admitted-pending-" .. id
            insert_run_row({ run_id = run_id, workflow_id = id, dataflow_id = "df-admitted-pending-" .. id,
                status = "pending", admission_state = "admitted" })
            local original = runs._dataflow_get
            runs._dataflow_get = function(_id: string): (any?, string?) return nil, "engine status unavailable" end
            local page, page_err = runs.list_runs(id, {})
            local detail, detail_err = runs.debug_detail(id, run_id)
            runs._dataflow_get = original
            test.is_nil(page)
            test.eq(page_err, "engine status unavailable")
            test.is_nil(detail)
            test.eq(detail_err, "engine status unavailable")
        end)

        test.it("returns a live status read error instead of an incomplete runs page", function()
            local id = wid()
            insert_run_row({ run_id = "run-unreadable-" .. id, workflow_id = id, dataflow_id = "df-unreadable-" .. id,
                status = "running", started_at = "2026-01-01T00:00:00Z" })
            local original = runs._dataflow_get
            runs._dataflow_get = function(_id: string): (any?, any) return nil, "engine status unavailable" end
            local page, err = runs.list_runs(id, { limit = 10 })
            runs._dataflow_get = original
            test.is_nil(page)
            test.contains(tostring(err), "engine status unavailable")
        end)
        test.it("reports the engine status of an active run so a parked run reads as waiting", function()
            local id = wid()
            insert_run_row({ run_id = "run-parked-" .. id, workflow_id = id, dataflow_id = "df-parked-" .. id, status = "running", started_at = "2026-01-01T00:00:02Z" })
            insert_run_row({ run_id = "run-busy-" .. id, workflow_id = id, dataflow_id = "df-busy-" .. id, status = "running", started_at = "2026-01-01T00:00:01Z" })
            insert_run_row({ run_id = "run-done-" .. id, workflow_id = id, dataflow_id = "df-done-" .. id, status = "completed", started_at = "2026-01-01T00:00:00Z" })
            local asked: { [string]: boolean } = {}
            local old_flow = runs._dataflow_get
            runs._dataflow_get = function(dataflow_id: string): any
                asked[dataflow_id] = true
                if dataflow_id == "df-parked-" .. id then return { dataflow_id = dataflow_id, status = "waiting" } end
                return { dataflow_id = dataflow_id, status = "running" }
            end
            local page, err = runs.list_runs(id, { limit = 10, offset = 0 })
            runs._dataflow_get = old_flow
            test.is_nil(err)
            local rows = page :: { Map }
            test.eq(#rows, 3)
            test.eq(rows[1].status, "running")
            test.eq(rows[1].dataflow_status, "waiting")
            test.eq(rows[2].dataflow_status, "running")
            test.is_nil(rows[3].dataflow_status)
            test.is_nil(asked["df-done-" .. id])
        end)

        test.it("keeps terminal completion idempotent without invoking framework metadata", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            local refreshes = 0
            runs._update_public_meta = function(_c, _p) refreshes = refreshes + 1 end
            local launched = select(1, runs.launch(id, { version = 1, input = {} }))
            local first = select(1, complete_stub(runs, { run_id = (launched :: Map).run_id, status = "completed" }))
            local second = select(1, complete_stub(runs, { run_id = (launched :: Map).run_id, status = "completed" }))
            test.eq((first :: Map).changed, true)
            test.eq((second :: Map).changed, false)
            test.eq(refreshes, 0)
        end)
    end)


end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_runs_read_model_actor_run", options or {})
    if err then error("runs suite: " .. tostring(err)) end
    return result
end

local function actor_run(options)
    return run_cases(options)
end

local function seam(args: any): any
    local a = type(args) == "table" and (args :: Map) or {}
    if a.op == "create" then
        local r, err = repo.create(a.title)
        return { id = r and (r :: Map).id or nil, error = err }
    elseif a.op == "simulate" then
        local access_err = repo.require_access(tostring(a.id or ""), repo.ACCESS.WRITE :: number)
        if access_err then return { success = false, error = "access denied" } end
        local res, err = runs.simulate(tostring(a.id or ""), a.opts or {})
        if err then return { success = false, error = tostring(err) } end
        if type(res) ~= "table" or (res :: Map).ok ~= true then
            return { success = false, error = tostring((res :: Map).error or "simulate failed") }
        end
        return { success = true, run_id = (res :: Map).run_id }
    end
    return { success = false, error = "unknown op" }
end

return { run = run, actor_run = actor_run, seam = seam }
