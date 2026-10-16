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

    test.describe("Workflow simulate", function()

        test.it("returns the real compiler error for an unrunnable graph", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "condition", kind = "branch", config = {} }),
            }, "tester")
            local sink: Map = { created = 0, started = 0 }
            runs._client_new = function() return stub_client(sink) end

            local res, err = runs.simulate(id, { input = {} })
            test.is_nil(res)
            test.eq(type(err), "table")
            test.eq((err :: Map).code, "compile_failed")
            test.contains(tostring((err :: Map).message), "Set the condition")
            test.eq(sink.created, 0)
        end)

        test.it("synthesizes whole-Flow simulation input from the compiled Start schema", function()
            local id = wid()
            workflow.apply(id, {
                cmd(C.NODE_ADD, { id = "start", kind = "start", config = {
                    input_schema = {
                        type = "object",
                        properties = {
                            name = { type = "string" },
                            count = { type = "integer" },
                        },
                        required = { "name", "count" },
                    },
                } }),
                cmd(C.NODE_ADD, { id = "f", kind = "block", ref = "app:block.engine_linear" }),
                cmd(C.NODE_ADD, { id = "finish", kind = "finish", config = {
                    output_schema = { type = "object" },
                } }),
                cmd(C.EDGE_ADD, { id = "e1", source_id = "start", target_id = "f" }),
                cmd(C.EDGE_ADD, { id = "e2", source_id = "f", target_id = "finish" }),
            }, "tester")
            local sink: Map = { created = 0, started = 0 }
            runs._client_new = function() return stub_client(sink) end

            local res, err = runs.simulate(id, {})
            test.is_nil(err)
            test.not_nil(res)

            local entry = nil
            for _, command in ipairs(sink.last_commands :: { Map }) do
                local payload = type(command.payload) == "table" and (command.payload :: Map) or {}
                if command.type == "CREATE_DATA" and tostring(payload.data_type) == "node.input" then
                    entry = payload
                end
            end
            test.not_nil(entry)
            test.eq(tostring(((entry :: Map).content :: Map).name), "value")
            test.eq(tonumber(((entry :: Map).content :: Map).count), 1)
        end)

    end)






end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_simulate_2_actor_run", options or {})
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
