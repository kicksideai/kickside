local test = require("test")
local process = require("process")
local sql = require("sql")
local time = require("time")
local channel = require("channel")
local uuid = require("uuid")
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local workflow = require("workflow")
local workflow_repo = require("workflow_repo")
local version_publish = require("version_publish")
local version_read = require("version_read")
local compiler = require("compiler")
local admission = require("admission")
local client = require("client")
local identity = require("execution_identity")
local types = require("types")

local function db_query(query: string, params: any): (any?, any?)
    local db, open_err = sql.get("app:db")
    if open_err or not db then return nil, open_err end
    local rows, read_err = db:query(query, params)
    db:release()
    return rows, read_err
end

local function published_workflow(): (string, any)
    local created, create_err = workflow_repo.create("maintenance-live")
    test.is_nil(create_err)
    test.not_nil(created)
    local id = created.id
    local commands = {
        { type = types.COMMAND.NODE_ADD, body = { id = "entry", kind = "block", ref = "app:block.engine_linear" } },
        { type = types.COMMAND.NODE_ADD, body = { id = "finish", kind = "block", ref = "app:block.engine_linear" } },
        { type = types.COMMAND.EDGE_ADD, body = { id = "edge", source_id = "entry", target_id = "finish" } },
    }
    local _, apply_err = workflow.apply(id, commands, "maintenance-live")
    test.is_nil(apply_err)
    local published, publish_err = version_publish.publish(id, "maintenance-live")
    test.is_nil(publish_err)
    test.eq(published.ok, true)
    local version, version_err = version_read.get(id, 1)
    test.is_nil(version_err)
    test.not_nil(version)
    return id, version
end

local function reserve(workflow_id: string, version: any): (any, any)
    local run_id, dataflow_id = uuid.v4(), uuid.v4()
    local commands, _, remint_err = compiler.remint(version.compiled_commands, uuid.v4, { count = 1 }, {
        run_id = run_id, dataflow_id = dataflow_id, version = 1,
        workflow_stack = { workflow_id }, depth = 0,
    })
    test.is_nil(remint_err)
    test.not_nil(commands)
    local captured, capture_err = identity.capture()
    test.is_nil(capture_err)
    local encoded, identity_err = identity.to_row(captured)
    test.is_nil(identity_err)
    local options = { dataflow_id = dataflow_id, type = "workflow",
        metadata = { run_id = run_id, origin = "published",
            flow_ref = { kind = "flow", id = workflow_id, version = 1 } } }
    local payload_json, encode_err = json.encode({ version = 1, input = { count = 1 },
        commands = commands, options = options, start_options = {} })
    test.is_nil(encode_err)
    local reserved, reserve_err = admission.reserve({
        run_id = run_id, dataflow_id = dataflow_id, workflow_id = workflow_id,
        version = 1, trigger_kind = "manual", origin = "published",
        execution_identity_json = encoded.actor_context,
        creation_payload_json = payload_json,
    })
    test.is_nil(reserve_err)
    test.not_nil(reserved)
    return reserved.row, { commands = commands, options = options }
end

local function define_tests()
    test.describe("workflow maintenance live service", function()
        local service_pid: string? = nil
        local listener_pid: string? = nil
        local signal: any = nil
        test.after_all(function()
            if service_pid then process.cancel(service_pid, "5s") end
            if listener_pid then process.cancel(listener_pid, "5s") end
            if signal then process.unlisten(signal) end
        end)

        test.it("reconciles a real terminal flow after its completion hook is lost", function()
            local workflow_id, version = published_workflow()
            local row, payload = reserve(workflow_id, version)
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local _, create_err = cli:create_workflow(payload.commands, payload.options)
            test.is_nil(create_err)
            local result, execute_err = cli:execute(row.dataflow_id, {})
            test.is_nil(execute_err)
            test.eq(result.success, true)
            local status, status_err = cli:get_status(row.dataflow_id)
            test.is_nil(status_err)
            test.eq(status, "completed")

            local db, open_err = sql.get("app:db")
            test.is_nil(open_err)
            if not db then error("test database unavailable") end
            local _, due_err = db:execute("UPDATE workflow_runs SET completion_check_at=$1 WHERE run_id=$2",
                { "2000-01-01T00:00:00Z", row.run_id })
            db:release()
            test.is_nil(due_err)

            local actor = security.actor()
            test.not_nil(actor)
            local reply_topic = "workflow.maintenance.event." .. uuid.v4()
            signal = process.listen(reply_topic, { message = true })
            local pid, listener_err = process.spawn_monitored("app:maintenance_event_listener", "app:processes", {
                actor_id = actor:id(), workflow_id = workflow_id,
                reply_pid = tostring(process.pid()), reply_topic = reply_topic,
            })
            test.is_nil(listener_err)
            test.not_nil(pid)
            listener_pid = tostring(pid)
            local ready_timeout = time.after("5s")
            local ready = channel.select({ signal:case_receive(), ready_timeout:case_receive() })
            test.eq(ready.channel, signal, "thread event listener did not register")
            local ready_data = ready.value:payload():data()
            test.eq(ready_data.kind, "ready")
            test.is_true(ready_data.ok, tostring(ready_data.error))

            local service, spawn_err = process.spawn_monitored(
                "kickside.workflows.runs:maintenance_process", "app:processes", {})
            test.is_nil(spawn_err)
            test.not_nil(service)
            service_pid = tostring(service)

            local deadline = time.after("15s")
            local received = channel.select({ signal:case_receive(), deadline:case_receive() })
            test.eq(received.channel, signal, "maintenance did not publish a terminal lifecycle event")
            local notification = received.value:payload():data()
            test.eq(notification.kind, "thread_event")
            test.eq(notification.thread_id, workflow_id)

            local events, event_err = db_query("SELECT type FROM kickside_event WHERE thread_id=$1"
                .. " AND external_source='kickside.workflow_run' AND external_id=$2 AND external_version='1'",
                { workflow_id, row.run_id })
            test.is_nil(event_err)
            test.eq(#events, 1)
            test.eq(events[1].type, "kickside.workflows.runs.events:finished")
            local runs, run_err = db_query("SELECT status,admission_state,completion_check_token"
                .. " FROM workflow_runs WHERE run_id=$1", { row.run_id })
            test.is_nil(run_err)
            test.eq(runs[1].status, "completed")
            test.eq(runs[1].admission_state, "admitted")
            test.not_nil(runs[1].completion_check_token)
        end)
    end)
end

local cases = test.run_cases(define_tests)

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function run(options: any): any
    local actor_id = "maintenance-live-" .. uuid.v4()
    local db, db_err = sql.get("app:db")
    if db_err or not db then error("maintenance suite db: " .. tostring(db_err)) end
    local _, insert_err = db:execute("INSERT INTO app_users"
        .. " (user_id, email, full_name, password_hash, status)"
        .. " VALUES ($1, $2, $3, 'x', 'active')",
        { actor_id, actor_id .. "@example.test", actor_id })
    db:release()
    if insert_err then error("maintenance suite user: " .. tostring(insert_err)) end
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then error("maintenance suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call("app:maintenance_live_actor_run", options or {})
    if err then error("maintenance suite: " .. tostring(err)) end
    return result
end

return { run = run, actor_run = function(options: any): any return cases(options) end }
