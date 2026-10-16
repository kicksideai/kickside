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



    test.describe("Workflow run completion", function()


        test.it("run_completed marks the row terminal once (idempotent)", function()
            local id = wid()
            publishable(id)
            local sink: Map = { created = 0, started = 0 }
            runs._client_new = function() return stub_client(sink) end
            local meta_calls = { n = 0 }
            runs._update_public_meta = function(_c, _p) meta_calls.n = meta_calls.n + 1 end

            local res = select(1, runs.launch(id, { version = 1, input = {} }))
            local run = select(1, runs.get_run(id, (res :: Map).run_id))
            local dataflow_id = (run :: Map).dataflow_id

            local r1 = select(1, complete_stub(runs, { dataflow_id = dataflow_id, status = "completed" }))
            test.eq((r1 :: Map).changed, true)
            local after = select(1, runs.get_run(id, (res :: Map).run_id))
            test.eq((after :: Map).status, "completed")
            test.is_true((after :: Map).finished_at ~= nil)

            local r2 = select(1, complete_stub(runs, { dataflow_id = dataflow_id, status = "completed" }))
            test.eq((r2 :: Map).changed, false)
        end)

        test.it("completion and redelivery never enter the framework metadata writer", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            local attempts = 0
            runs._update_public_meta = function()
                attempts = attempts + 1
                return nil, errors.new({ kind = errors.UNAVAILABLE, message = "forbidden callback write" })
            end
            local launched = select(1, runs.launch(id, { version = 1, input = {} })) :: Map
            local first, first_err = complete_stub(runs, { run_id = launched.run_id, status = "completed" })
            test.is_nil(first_err)
            test.eq((first :: Map).changed, true)
            local second, second_err = complete_stub(runs, { run_id = launched.run_id, status = "completed" })
            test.is_nil(second_err)
            test.eq((second :: Map).changed, false)
            test.eq(attempts, 0)
        end)

        for _, hook_error in ipairs({ false, "" }) do
            test.it("preserves the runtime failure with hook error " .. tostring(hook_error), function()
                local id = wid()
                publishable(id)
                runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
                local res, launch_err = runs.launch(id, { version = 1, input = {} })
                test.is_nil(launch_err)
                local db, db_err = store.open_db()
                test.is_nil(db_err)
                local metadata, encode_err = json.encode({ error = "active orchestrator disappeared during runtime", runtime_failure = {
                    source = "dataflow.overseer", reason = "runtime_owner_lost",
                    message = "active orchestrator disappeared during runtime",
                } })
                test.is_nil(encode_err)
                local _, insert_err = db:execute("INSERT INTO dataflows"
                    .. " (dataflow_id,actor_id,type,status,metadata,created_at,updated_at)"
                    .. " VALUES ($1,$2,$3,$4,$5,$6,$7)", {
                        res.dataflow_id, "runs-test", "workflow", "failed", metadata,
                        "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z",
                    })
                db:release()
                test.is_nil(insert_err)
                local args = { dataflow_id = res.dataflow_id, status = "failed" }
                if hook_error ~= false then args.error = hook_error end
                local completed, completion_err = complete_stub(runs, args)
                test.is_nil(completion_err)
                test.not_nil(completed)
                local after, read_err = runs.get_run(id, res.run_id)
                test.is_nil(read_err)
                test.eq(after.status, "failed")
                test.eq(after.error, "active orchestrator disappeared during runtime")
                local listed, list_err = runs.list_runs(id, { limit = 10 })
                test.is_nil(list_err)
                test.eq(#listed, 1)
                test.eq(listed[1].status, "failed")
                test.eq(listed[1].error, after.error)
                local duplicate, duplicate_err = complete_stub(runs, {
                    dataflow_id = res.dataflow_id, status = "failed", error = "later callback",
                })
                test.is_nil(duplicate_err)
                test.is_false(duplicate.changed)
                test.eq((select(1, runs.get_run(id, res.run_id))).error, after.error)
            end)
        end

        test.it("preserves an unspecified error when a failed dataflow records no cause", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            local launched, launch_err = runs.launch(id, { version = 1, input = {} })
            test.is_nil(launch_err)
            local result, completion_err = complete_stub(runs, {
                dataflow_id = launched.dataflow_id, status = "failed",
            })
            test.is_nil(completion_err)
            test.not_nil(result)
            local after, read_err = runs.get_run(id, launched.run_id)
            test.is_nil(read_err)
            test.eq(after.error, "")
        end)

        test.it("returns malformed failure metadata before committing a terminal error", function()
            local original = store.open_db
            local writes, rolled_back = 0, false
            local tx = {
                query = function(_self, query)
                    if query:match("^SELECT metadata") then return {{ metadata = "{invalid" }}, nil end
                    return {{ status = "failed", admission_state = "admitted" }}, nil
                end,
                execute = function() writes = writes + 1; return { rows_affected = 1 }, nil end,
                rollback = function() rolled_back = true; return true, nil end,
                commit = function() return true, nil end,
            }
            store.open_db = function()
                return { type = function() return "sqlite", nil end,
                    begin = function() return tx, nil end, release = function() end }, nil
            end
            local result, completion_err = admission.merge({
                dataflow_id = "malformed-failure", run_id = "malformed-run",
            }, { status = "failed" })
            store.open_db = original
            test.is_nil(result)
            test.not_nil(completion_err)
            test.eq(writes, 0)
            test.is_true(rolled_back)
        end)

        test.it("maps a failed dataflow status to a failed run with the error", function()
            local id = wid()
            publishable(id)
            runs._client_new = function() return stub_client({ created = 0, started = 0 }) end
            runs._update_public_meta = function(_c, _p) end
            local res = select(1, runs.launch(id, { version = 1, input = {} }))
            local run = select(1, runs.get_run(id, (res :: Map).run_id))
            complete_stub(runs, { dataflow_id = (run :: Map).dataflow_id, status = "failed", error = "boom" })
            local after = select(1, runs.get_run(id, (res :: Map).run_id))
            test.eq((after :: Map).status, "failed")
            test.eq((after :: Map).error, "boom")
        end)







    end)




end

local run_cases = test.run_cases(define_tests)

local function run(options)
    local actor, actor_err = security.new_actor("runs-test", {})
    if actor_err or not actor then error("runs suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:tsplit_runs_test_workflow_run_completion_2_actor_run", options or {})
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
