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






    test.describe("Workflow run detail API", function()


        test.it("returns a step's produced value from the rows its successful result routed", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            runs._update_public_meta = function(_c, _p) end
            local launched = select(1, runs.launch(id, { version = 1, input = {} })) :: Map
            local node_reader, data_reader = dedup_scaffold.readers({
                { node_id = "engine-code", type = "func", status = "completed", metadata = { def_node_id = "code" } },
                { node_id = "engine-next", type = "state", status = "completed", metadata = { def_node_id = "next" } },
            }, {
                { data_id = "d1", node_id = "engine-code", type = "node.input", discriminator = "default", content = { query = "q" } },
                { data_id = "d2", node_id = "engine-next", type = "node.input", discriminator = "in1", content = { passages = "found" } },
                { data_id = "d3", node_id = "engine-code", type = "node.result", discriminator = "result.success", content = { success = true, data_ids = { "d2" } } },
            })
            local scoped_runs = runs.new({ node_reader = node_reader, data_reader = data_reader })
            local data, err = scoped_runs.run_node_data(id, launched.run_id, "code", {})
            test.is_nil(err)
            local own = data :: { Map }
            test.eq(#own, 2)
            test.eq(own[1].data_id, "d1")
            test.eq(own[2].data_id, "d3")
            local result = own[2].content :: Map
            test.eq((result.data_ids :: { string })[1], "d2")
            test.eq((result.output :: Map).passages, "found")
        end)

        test.it("pages a step's data rows with next_offset", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            runs._update_public_meta = function(_c, _p) end
            local launched = select(1, runs.launch(id, { version = 1, input = {} })) :: Map
            local node_reader, data_reader = dedup_scaffold.readers({
                { node_id = "engine-code", type = "func", status = "completed", metadata = { def_node_id = "code" } },
            }, {
                { data_id = "d1", node_id = "engine-code", type = "node.input", discriminator = "default", content = { query = "q" } },
                { data_id = "d2", node_id = "engine-code", type = "node.input", discriminator = "default", content = { query = "r" } },
            })
            local scoped_runs = runs.new({ node_reader = node_reader, data_reader = data_reader })
            local first, first_err, first_next = scoped_runs.run_node_data(id, launched.run_id, "code", { limit = 1 })
            test.is_nil(first_err)
            test.eq(#first, 1)
            test.eq(first[1].data_id, "d1")
            test.eq(first_next, 1)
            local second, second_err, second_next = scoped_runs.run_node_data(id, launched.run_id, "code", { limit = 1, offset = first_next })
            test.is_nil(second_err)
            test.eq(#second, 1)
            test.eq(second[1].data_id, "d2")
            test.is_nil(second_next)
        end)

        test.it("resolves completed step output references inside the same dataflow", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            runs._update_public_meta = function(_c, _p) end
            local launched = select(1, runs.launch(id, { version = 1, input = {} })) :: Map
            local node_reader, data_reader = dedup_scaffold.readers({
                { node_id = "engine-1", type = "func", status = "completed", metadata = { def_node_id = "t", title = "Prepare" } },
            }, {
                { data_id = "completion-1", node_id = "engine-1", type = "node.result", content_type = "application/json",
                    content = '{"success":true,"message":"Completed","data_ids":["output-1"]}' },
                { data_id = "output-1", node_id = "engine-2", type = "node.input", content_type = "application/json",
                    content = '{"product":"Northwind Tea","crates":48}' },
            }, function(kind: string, selector: string, values: { any })
                if kind == "data" then
                    if selector == "dataflow" then test.eq(values[1], launched.dataflow_id) end
                    if selector == "data" then test.eq(values[1], "output-1") end
                end
            end)
            local scoped_runs = runs.new({ node_reader = node_reader, data_reader = data_reader })
            local rows, err = scoped_runs.run_node_data(id, launched.run_id, "t", {})
            test.is_nil(err, tostring(err))
            local result = type(rows[1].content) == "string" and json.decode(rows[1].content) or rows[1].content
            test.eq(result.output.product, "Northwind Tea")
            test.eq(result.output.crates, 48)
            test.eq(result.data_ids[1], "output-1")
        end)

        test.it("run_node_data preserves a typed reader error instead of stringifying it", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            runs._update_public_meta = function(_c, _p) end
            local launched = select(1, runs.launch(id, { version = 1, input = {} })) :: Map
            local typed: Map = { kind = "UNAVAILABLE", message = "data store unreachable" }
            local old_nodes, old_data = runs._node_reader, runs._data_reader
            runs._node_reader = function(): any
                return { with_dataflow = function(_dfid: string): any
                    local q: any = {}
                    function q:fetch_options(_opts: any): any return self end
                    function q:all(): any
                        return { { node_id = "engine-1", type = "func", status = "completed",
                            metadata = { def_node_id = "t", title = "Prepare" } } }
                    end
                    return q
                end }
            end
            runs._data_reader = function(): any
                return { with_dataflow = function(_dfid: string): any
                    local q: any = {}
                    function q:with_nodes(...: any): any return self end
                    function q:order_by(_field: string, _direction: string): any return self end
                    function q:all(): any return nil, typed end
                    return q
                end }
            end
            local rows, rows_err = runs.run_node_data(id, (launched :: Map).run_id, "t", {})
            runs._node_reader, runs._data_reader = old_nodes, old_data
            test.is_nil(rows)
            test.not_nil(rows_err)
            test.is_true(type(rows_err) ~= "string")
            test.eq((rows_err :: Map).kind, "UNAVAILABLE")
        end)

        test.it("keeps terminal lifecycle boundaries around engine events when timestamps tie", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            runs._update_public_meta = function(_c, _p) end
            local launched = select(1, runs.launch(id, { version = 1, input = {} })) :: Map
            local old_flow = runs._dataflow_get
            runs._dataflow_get = function(_id: string): any return nil end
            local completed = select(1, complete_stub(runs, { run_id = launched.run_id, status = "completed" }))
            local timeline, timeline_err = runs.run_timeline(id, launched.run_id, { limit = 100, offset = 0 })
            runs._dataflow_get = old_flow

            test.is_nil(timeline_err)
            test.eq((completed :: Map).changed, true)
            local events = (timeline :: Map).events :: { Map }
            test.eq(#events, 2)
            test.eq(events[1].type, "flow.started")
            test.eq(events[2].type, "flow.finished")
            test.is_nil(events[1]._phase)
            test.is_nil(events[2]._ordinal)
        end)

        test.it("includes completed output and the pinned version", function()
            local id = wid()
            publishable(id)
            local sink: Map = {
                created = 0,
                started = 0,
                outputs = {},
            }
            runs._client_new = function() return stub_client(sink) end
            runs._update_public_meta = function(_c, _p) end
            local launched = select(1, runs.launch(id, { version = 1, input = {} }))
            test.not_nil(launched)
            local run_id = tostring((launched :: Map).run_id)
            local outputs = sink.outputs :: Map
            outputs[tostring((launched :: Map).dataflow_id)] = { result = { score = 0.82, source = "finish" } }
            complete_stub(runs, { run_id = run_id, status = "completed" })

            local detail, detail_err = exec_api.new({ runs_completion = runs, runs_debug = runs }).run_detail_response(id, run_id)

            test.is_nil(detail_err)
            test.not_nil(detail)
            test.eq((((detail :: Map).run :: Map).status), "completed")
            local detail_ref = (((detail :: Map).run :: Map).flow_ref :: Map)
            test.eq(detail_ref.kind, "flow")
            test.eq(detail_ref.id, id)
            test.eq(detail_ref.version, 1)
            local detail_output = ((detail :: Map).run :: Map).output
            test.eq((((detail_output :: Map).result :: Map).score), 0.82)
            test.eq((((detail_output :: Map).result :: Map).source), "finish")
        end)





    end)

end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_run_detail_api_2_actor_run", options or {})
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
