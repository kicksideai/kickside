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




    test.describe("Workflow execution facade", function()




        test.it("normalizes structured launch failures at the execution facade", function()
            local scoped_runner = runner.new({ runs_launch = function(_workflow_id: string, _opts: Map): (Map?, any?)
                return nil, { code = "start_input_invalid", message = "missing required property: email" }
            end })
            local result, err = scoped_runner.run({ kind = "flow", id = "wf-execution-failure", version = 1 }, {}, {})
            test.is_nil(result)
            test.contains(tostring(err), "start_input_invalid")
            test.contains(tostring(err), "email")
        end)

        test.it("runs a published Flow through the generic Flow tool", function()
            local id = wid()
            publishable_workflow(id)

            local real_catalog = agent_tool._catalog
            local real_runner = agent_tool._execute
            local real_context_get = agent_tool._context_get
            local captured: Map = {}
            agent_tool._catalog = function(): (any?, string?)
                return {{
                    title = "Score lead",
                    flow_ref = { kind = "flow", id = id, version = 1 },
                    input_schema = { type = "object", required = { "lead_id" }, properties = { lead_id = { type = "string" } } },
                    output_schema = { type = "object" },
                }}, nil
            end
            agent_tool._execute = function(flow_ref: any, input: any, opts: any): (Map?, string?)
                captured.flow_ref = flow_ref
                captured.input = input
                captured.opts = opts
                return { run_id = "run-tool", dataflow_id = "df-tool", status = "completed", success = true, data = { result = { score = 0.82 } } }, nil
            end
            agent_tool._context_get = function(key: string): any
                return key == "session_id" and "session-chat-1" or nil
            end

            local result, ierr = agent_tool.flow_run_handler({
                flow_ref = { kind = "flow", id = id, version = 1 },
                input = { lead_id = "lead-1", source = "tool" },
            })
            agent_tool._catalog = real_catalog
            agent_tool._execute = real_runner
            agent_tool._context_get = real_context_get

            test.is_nil(ierr)
            test.eq((result :: Map).score, 0.82)
            test.eq(((captured.flow_ref :: Map).id), id)
            test.eq(((captured.input :: Map).lead_id), "lead-1")
            test.eq(((captured.opts :: Map).mode), "sync")
            test.eq(((captured.opts :: Map).trigger_kind), "agent_flow")
            test.eq(((captured.opts :: Map).session_id), "session-chat-1")
        end)

        test.it("refuses an inexact Flow reference at the agent boundary", function()
            local result, err = agent_tool.flow_run_handler({ flow_ref = { kind = "flow", id = "wf" }, input = {} })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(tostring(err), "positive integer")
        end)

        test.it("fails Flow tool requests with typed errors and returns a failed run as a domain error", function()
            local real_catalog = agent_tool._catalog
            local real_runner = agent_tool._execute
            local ref = { kind = "flow", id = "wf-typed", version = 1 }
            agent_tool._catalog = function(): (any?, string?)
                return {{
                    title = "Typed",
                    flow_ref = ref,
                    input_schema = { type = "object", required = { "lead_id" }, properties = { lead_id = { type = "string" } } },
                    output_schema = { type = "object" },
                }}, nil
            end
            agent_tool._execute = function(): (Map?, string?)
                return { run_id = "run-failed", success = false, error = "lead scoring failed" }, nil
            end

            local _, input_err = agent_tool.flow_run_handler({ flow_ref = ref, input = "x" })
            local _, schema_err = agent_tool.flow_run_handler({ flow_ref = ref, input = {} })
            local _, version_err = agent_tool.flow_run_handler({ flow_ref = { kind = "flow", id = "wf-typed", version = 2 }, input = { lead_id = "l" } })
            local failed, failed_err = agent_tool.flow_run_handler({ flow_ref = ref, input = { lead_id = "l" } })
            agent_tool._catalog = function(): (any?, error?)
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "catalog unavailable" })
            end
            local _, catalog_err = agent_tool.flow_run_handler({ flow_ref = ref, input = { lead_id = "l" } })
            agent_tool._catalog = real_catalog
            agent_tool._execute = real_runner

            test.is_true(errors.is(input_err, errors.INVALID))
            test.is_true(errors.is(schema_err, errors.INVALID))
            test.is_true(errors.is(version_err, errors.NOT_FOUND))
            test.is_true(errors.is(catalog_err, errors.UNAVAILABLE))
            test.is_nil(failed_err)
            test.eq((failed :: Map).success, false)
            test.eq((failed :: Map).error, "lead scoring failed")
            test.eq((failed :: Map).run_id, "run-failed")
        end)

        test.it("rejects unsupported launch modes", function()
            local inline, ierr = runner.run({ kind = "flow", id = "wf-b", version = 1 }, {}, {
                mode = "detached",
            })
            test.is_nil(inline)
            test.contains(tostring(ierr), "detached")
        end)
    end)



end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_execution_facade_2_actor_run", options or {})
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
