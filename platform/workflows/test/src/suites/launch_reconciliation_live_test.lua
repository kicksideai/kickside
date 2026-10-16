local test = require("test")
local process = require("process")
local channel = require("channel")
local retention = require("retention")
local time = require("time")
local uuid = require("uuid")
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local workflow = require("workflow")
local version_publish = require("version_publish")
local version_read = require("version_read")
local compiler = require("compiler")
local admission = require("admission")
local maintenance = require("maintenance")
local client = require("client")
local runs = require("runs")
local store = require("store")
local identity = require("execution_identity")
local types = require("types")
local engine_api = require("engine_api")

type Map = { [string]: any }

local function published(failing: boolean?): (string, Map)
    local id = uuid.v4()
    local commands = {
        { type = types.COMMAND.NODE_ADD, body = { id = "entry", kind = "block", ref = failing and "app:block.engine_item_or_fail" or "app:block.engine_linear" } },
        { type = types.COMMAND.NODE_ADD, body = { id = "finish", kind = "block", ref = "app:block.engine_linear" } },
        { type = types.COMMAND.EDGE_ADD, body = { id = "edge", source_id = "entry", target_id = "finish" } },
    }
    local _, apply_err = workflow.apply(id, commands, "live-reconcile")
    test.is_nil(apply_err)
    local result, publish_err = version_publish.publish(id, "live-reconcile")
    test.is_nil(publish_err)
    test.eq(result.ok, true)
    local version, version_err = version_read.get(id, 1)
    test.is_nil(version_err)
    test.not_nil(version)
    return id, version :: Map
end

local function reserve(id: string, version: Map, input: Map, before_commit: boolean?, trigger_id: string?, completion_hook: boolean?): (Map, Map)
    local run_id, dataflow_id = uuid.v4(), uuid.v4()
    local commands, _, remint_err = compiler.remint(version.compiled_commands, uuid.v4, input, {
        run_id = run_id, dataflow_id = dataflow_id, version = 1,
        workflow_stack = { id }, depth = 0,
    })
    test.is_nil(remint_err)
    test.not_nil(commands)
    local captured, capture_err = identity.capture()
    test.is_nil(capture_err)
    local encoded, encode_err = identity.to_row(captured)
    test.is_nil(encode_err)
    local options = { dataflow_id = dataflow_id, type = "workflow",
        metadata = { run_id = run_id, origin = "published",
            flow_ref = { kind = "flow", id = id, version = 1 } } }
    if completion_hook then options.on_complete = types.RUN_COMPLETED_FUNC end
    local payload = { version = 1, input = input, commands = commands, options = options,
        start_options = {} }
    local payload_json, json_err = json.encode(payload)
    test.is_nil(json_err)
    if before_commit then return { run_id = run_id, dataflow_id = dataflow_id }, payload end
    local reservation, reserve_err = admission.reserve({
        run_id = run_id, dataflow_id = dataflow_id, workflow_id = id,
        version = 1, trigger_kind = trigger_id and "binding" or "manual", origin = "published",
        trigger_id = trigger_id, dedup_key = trigger_id and tostring(input.count) or nil,
        automation_revision = trigger_id and 1 or nil,
        execution_identity_json = encoded.actor_context,
        creation_payload_json = payload_json,
    })
    test.is_nil(reserve_err)
    test.not_nil(reservation)
    return reservation.row or reservation, payload
end

local function read_row(run_id: string): Map
    local db, open_err = store.open_db()
    test.is_nil(open_err)
    local rows, read_err = db:query("SELECT * FROM workflow_runs WHERE run_id=$1", { run_id })
    db:release()
    test.is_nil(read_err)
    test.not_nil(rows and rows[1])
    return rows[1]
end

local function force_due(run_id: string)
    local db, open_err = store.open_db()
    test.is_nil(open_err)
    local _, due_err = db:execute("UPDATE workflow_runs SET completion_check_at='2000-01-01T00:00:00Z'"
        .. " WHERE run_id=$1", { run_id })
    db:release()
    test.is_nil(due_err)
end

local function terminal_events(run_id: string): number
    local db, open_err = store.open_db()
    test.is_nil(open_err)
    local rows, read_err = db:query("SELECT COUNT(*) AS n FROM kickside_event"
        .. " WHERE external_source='kickside.workflow_run' AND external_id=$1 AND external_version='1'",
        { run_id })
    db:release()
    test.is_nil(read_err)
    return tonumber(rows[1].n) or 0
end

local function wait_terminal(cli: any, id: string): string
    for _ = 1, 200 do
        local status, err = cli:get_status(id)
        test.is_nil(err)
        if status == "completed" or status == "failed" then return status end
        time.sleep(10 * time.MILLISECOND)
    end
    error("flow did not finish: " .. id)
end

local function pending_event(row: Map): boolean
    return row.terminal_event_pending == true or row.terminal_event_pending == 1
end

local function define_tests()
    test.describe("live workflow and Dataflow reconciliation", function()
        test.it("failed creation retains its cause when the flow remains absent", function()
            for _, cause in ipairs({ "execution context capture denied", {
                kind = "permission_denied", message = "creation denied", retryable = false,
            } }) do
                local creates = 0
                local cli = {
                    get_status = function() return nil, "Workflow not found or access denied" end,
                    create_workflow = function()
                        creates = creates + 1
                        return nil, cause
                    end,
                }
                local current, err = engine_api.run(cli,
                    { dataflow_id = "uncreated-flow", admission_state = "unadmitted" },
                    { commands = {}, options = {} })
                test.is_nil(current)
                test.is_true(err == cause, tostring(err))
                test.eq(creates, 1)
            end
        end)

        test.it("successful creation retains a failed subsequent observation", function()
            local reads = 0
            local cli = {
                get_status = function()
                    reads = reads + 1
                    return nil, reads == 1 and "absent" or "observation unavailable"
                end,
                create_workflow = function() return "created-flow", nil end,
            }
            local current, err = engine_api.run(cli,
                { dataflow_id = "created-flow", admission_state = "unadmitted" },
                { commands = {}, options = {} })
            test.is_nil(current)
            test.eq(err, "observation unavailable")
        end)

        test.it("lost creation acknowledgement recovers the committed running flow", function()
            local reads, creates = 0, 0
            local cli = {
                get_status = function()
                    reads = reads + 1
                    if reads == 1 then return nil, "absent" end
                    return "running", nil
                end,
                create_workflow = function()
                    creates = creates + 1
                    return nil, "creation acknowledgement unavailable"
                end,
            }
            local current, err = engine_api.run(cli,
                { dataflow_id = "committed-flow", admission_state = "unadmitted" },
                { commands = {}, options = {} })
            test.is_nil(err)
            test.eq(current.status, "running")
            test.eq(creates, 1)
        end)

        test.it("finalizes a fresh failed unadmitted flow without a completion hook", function()
            local id, version = published(true)
            local row, payload = reserve(id, version, { fail = true, name = "orphan-proof" })
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local _, create_err = cli:create_workflow(payload.commands, payload.options)
            test.is_nil(create_err)
            local result, execute_err = cli:execute(row.dataflow_id, {})
            test.not_nil(execute_err)
            test.contains(tostring(execute_err), "intentional item failure")
            test.eq(wait_terminal(cli, row.dataflow_id), "failed")
            test.eq(read_row(row.run_id).admission_state, "unadmitted")
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            local finished = read_row(row.run_id)
            test.eq(finished.status, "failed")
            test.contains(finished.error, "intentional item failure")
            test.eq(finished.admission_state, "admitted")
            test.not_nil(finished.finished_at)
            test.is_nil(finished.completion_check_at)
            test.eq(terminal_events(row.run_id), 1)
            test.eq(pending_event(finished), false)
        end)

        test.it("legacy missing payload fails before observation; terminal projection publishes once", function()
            local id, version = published(true)
            local row, payload = reserve(id, version, { fail = true, name = "legacy-proof" })
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local _, create_err = cli:create_workflow(payload.commands, payload.options)
            test.is_nil(create_err)
            local result, execute_err = cli:execute(row.dataflow_id, {})
            test.not_nil(execute_err)
            test.contains(tostring(execute_err), "intentional item failure")
            test.eq(wait_terminal(cli, row.dataflow_id), "failed")
            local db, open_err = store.open_db()
            test.is_nil(open_err)
            local _, row_err = db:execute("UPDATE workflow_runs SET status='running',creation_payload_json=NULL WHERE run_id=$1", { row.run_id })
            test.is_nil(row_err)
            local legacy_metadata, encode_err = json.encode({ run_id = row.run_id,
                flow_ref = { kind = "flow", id = id, version = 1 },
                runtime_failure = { reason = "runtime_owner_lost", message = "legacy runtime failure" } })
            test.is_nil(encode_err)
            local _, metadata_err = db:execute("UPDATE dataflows SET metadata=$1 WHERE dataflow_id=$2", { legacy_metadata, row.dataflow_id })
            test.is_nil(metadata_err)
            db:release()
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.checked, 1)
            test.eq(tick.failures, 1)
            test.contains(tostring(tick.last_error), "creation payload is missing")
            local stuck = read_row(row.run_id)
            test.eq(stuck.status, "running")
            test.eq(stuck.admission_state, "unadmitted")
            test.not_nil(stuck.completion_check_token)
            test.not_nil(stuck.completion_check_at)
            test.eq(terminal_events(row.run_id), 0)
            local merged, merge_err = admission.merge(stuck, { status = "failed" }, stuck.completion_check_token)
            test.is_nil(merge_err)
            test.eq(merged.changed, true)
            local queued = read_row(row.run_id)
            test.eq(queued.status, "failed")
            test.eq(queued.admission_state, "admitted")
            test.eq(queued.error, "", "legacy internal metadata does not supply a public error")
            test.not_nil(queued.finished_at)
            test.is_nil(queued.completion_check_at)
            test.eq(pending_event(queued), true)
            test.eq(queued.terminal_event_check_at, queued.finished_at)
            test.is_nil(queued.creation_payload_json)
            local published_tick, publish_err = maintenance.tick(1, row.run_id)
            test.is_nil(publish_err)
            test.eq(published_tick.failures, 0, tostring(published_tick.last_error))
            test.eq(published_tick.checked, 0)
            test.eq(published_tick.published, 1)
            test.eq(terminal_events(row.run_id), 1)
            test.eq(pending_event(read_row(row.run_id)), false)
            test.not_nil(read_row(row.run_id).public_meta_refreshed_at)
            local again, again_err = maintenance.tick(1, row.run_id)
            test.is_nil(again_err)
            test.eq(again.failures, 0)
            test.eq(terminal_events(row.run_id), 1)
        end)

        test.it("create before run commit leaves a never-started orphan; retry starts one flow", function()
            local id, version = published()
            local orphan, orphan_payload = reserve(id, version, { count = 17 }, true)
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local created, create_err = cli:create_workflow(orphan_payload.commands, orphan_payload.options)
            test.is_nil(create_err)
            test.eq(created, orphan.dataflow_id)
            test.eq(select(1, cli:get_status(created)), "pending")
            -- The caller disappears before storing the id. No start is sent.
            local row, payload = reserve(id, version, { count = 17 })
            test.is_true(row.dataflow_id ~= created)
            local committed, retry_create_err = cli:create_workflow(payload.commands, payload.options)
            test.is_nil(retry_create_err)
            local result, execute_err = cli:execute(committed, {})
            test.is_nil(execute_err)
            test.eq(result.success, true)
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            test.eq(read_row(row.run_id).status, "completed")
            local output, output_err = cli:output(committed)
            test.is_nil(output_err)
            test.not_nil(output)
            test.eq(select(1, cli:get_status(created)), "pending")
            local db = store.open_db()
            local activations = db:query("SELECT dataflow_id FROM dataflow_activations WHERE dataflow_id IN ($1,$2)", { created, committed })
            local runs = db:query("SELECT run_id FROM workflow_runs WHERE workflow_id=$1", { id })
            local orphan_nodes = db:query("SELECT status FROM dataflow_nodes WHERE dataflow_id=$1", { created })
            db:release()
            test.eq(#activations, 1)
            test.eq(activations[1].dataflow_id, committed)
            test.eq(#runs, 1)
            test.eq(#orphan_nodes, 2)
            for _, node in ipairs(orphan_nodes) do test.eq(node.status, "pending") end
        end)

        test.it("published create is unique and repeated start/execute preserves one owner", function()
            local id, version = published()
            local row, payload = reserve(id, version, { count = 19 })
            local cli, client_err = client.new()
            test.is_nil(client_err)
            test.eq(select(1, cli:create_workflow(payload.commands, payload.options)), row.dataflow_id)
            local duplicate, duplicate_err = cli:create_workflow(payload.commands, payload.options)
            test.is_nil(duplicate)
            test.not_nil(duplicate_err)
            test.eq(select(1, cli:get_status(row.dataflow_id)), "pending")
            local first, first_err = cli:start(row.dataflow_id, {})
            test.is_nil(first_err)
            test.eq(first, row.dataflow_id)
            local status = select(1, cli:get_status(row.dataflow_id))
            if status ~= "completed" then
                local second, second_err = cli:start(row.dataflow_id, {})
                if second_err then test.eq(select(1, cli:get_status(row.dataflow_id)), "completed")
                else test.eq(second, row.dataflow_id) end
            end
            -- execute may see the registered owner and report pending. It must
            -- never produce another dataflow or repeat completed node work.
            local execution, execution_err = cli:execute(row.dataflow_id, {})
            if execution_err then test.eq(select(1, cli:get_status(row.dataflow_id)), "completed")
            else test.eq(execution.dataflow_id, row.dataflow_id) end
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            test.eq(wait_terminal(cli, row.dataflow_id), "completed")
            local db = store.open_db()
            local results, results_err = db:query("SELECT node_id,COUNT(*) AS n FROM dataflow_data"
                .. " WHERE dataflow_id=$1 AND type='node.result' GROUP BY node_id", { row.dataflow_id })
            local flows, flows_err = db:query("SELECT dataflow_id FROM dataflows WHERE dataflow_id=$1", { row.dataflow_id })
            db:release()
            test.is_nil(results_err)
            test.is_nil(flows_err)
            test.eq(#flows, 1)
            test.eq(#results, 2)
            for _, result in ipairs(results) do test.eq(tonumber(result.n), 1) end

        end)

        test.it("reconciles a real terminal flow with no completion hook and publishes once", function()
            local id, version = published()
            local row, payload = reserve(id, version, { count = 3 })
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
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            local finished = read_row(row.run_id)
            test.eq(finished.status, "completed")
            test.eq(finished.admission_state, "admitted")
            test.eq(terminal_events(row.run_id), 1)
            test.eq(pending_event(finished), false)
            local again, again_err = maintenance.tick(1, row.run_id)
            test.is_nil(again_err)
            test.eq(again.failures, 0)
            test.eq(terminal_events(row.run_id), 1)
            local purged, purge_err = workflow.purge(id)
            test.is_nil(purge_err)
            test.is_true(purged)
        end)

        test.it("recovers a real created flow after the launcher disappears", function()
            local id, version = published()
            local row, payload = reserve(id, version, { count = 5 })
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local _, create_err = cli:create_workflow(payload.commands, payload.options)
            test.is_nil(create_err)
            local before, before_err = cli:get_status(row.dataflow_id)
            test.is_nil(before_err)
            test.eq(before, "pending")
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            test.eq(read_row(row.run_id).admission_state, "admitted")
            local status = select(1, cli:get_status(row.dataflow_id))
            test.is_true(status == "pending" or status == "running" or status == "completed")
            test.eq(wait_terminal(cli, row.dataflow_id), "completed")
            -- Repeated recovery of terminal state cannot start it again.
            for _ = 1, 3 do
                force_due(row.run_id)
                local again, again_err = maintenance.tick(1, row.run_id)
                test.is_nil(again_err)
                test.eq(again.failures, 0, tostring(again.last_error))
            end
            local db = store.open_db()
            local activations = db:query("SELECT generation FROM dataflow_activations WHERE dataflow_id=$1", { row.dataflow_id })
            db:release()
            test.eq(tonumber(activations[1].generation), 1)

        end)

        test.it("creates an absent engine flow from the durable run payload", function()
            local id, version = published()
            local row, _payload = reserve(id, version, { count = 7 })
            local inserted = read_row(row.run_id)
            local persisted, decode_err = json.decode(inserted.creation_payload_json)
            test.is_nil(decode_err)
            test.eq(persisted.version, 1)
            test.eq(persisted.input.count, 7)
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            local recovered = read_row(row.run_id)
            test.eq(recovered.admission_state, "admitted")
            test.is_true(recovered.status == "running" or recovered.status == "completed")
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local status, status_err = cli:get_status(row.dataflow_id)
            test.is_nil(status_err)
            test.is_true(status == "pending" or status == "running" or status == "completed")
        end)

        test.it("the interactive callback uses the shared terminal event identity", function()
            local id, version = published()
            local row, payload = reserve(id, version, { count = 11 })
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
            local callback = runs.new({ client_new = function() return cli, nil end,
                update_public_meta = function() return true, nil end })
            local completed, completion_err = callback.run_completed({ run_id = row.run_id,
                status = "completed" })
            test.is_nil(completion_err)
            test.eq(completed.changed, true)
            local pending = read_row(row.run_id)
            test.eq(pending_event(pending), true)
            test.eq(terminal_events(row.run_id), 0)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            test.eq(terminal_events(row.run_id), 1)
            test.eq(pending_event(read_row(row.run_id)), false)
        end)

        test.it("reports missing published client methods as a typed deployment error", function()
            local id, version = published()
            local row = reserve(id, version, { count = 9 })
            force_due(row.run_id)
            local checker = maintenance.new({ client_new = function() return {}, nil end })
            local result, err = checker.tick(1)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(type(err), "userdata")
            test.contains(tostring(err), "create_workflow")
        end)

        test.it("the supervised worker reconciles under the run owner rather than its own actor", function()
            local id, version = published()
            local row, payload = reserve(id, version, { count = 13 })
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local _, create_err = cli:create_workflow(payload.commands, payload.options)
            test.is_nil(create_err)
            local result, execute_err = cli:execute(row.dataflow_id, {})
            test.is_nil(execute_err)
            test.eq(result.success, true)
            force_due(row.run_id)
            local tick, tick_err = funcs.call("kickside.workflows.runs:maintenance_tick_worker",
                { limit = 1, run_id = row.run_id })
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            test.eq(read_row(row.run_id).status, "completed")
            test.eq(terminal_events(row.run_id), 1)
        end)
    end)
end

local function define_admission_tests()
    test.describe("native admission recovery", function()
        for _, stage in ipairs({"insert", "create", "start", "terminal", "callback", "admission"}) do
            test.it("recovers native caller death after " .. stage .. " without another run", function()
                local id, version = published()
                local row, payload = reserve(id, version, {count = 17}, nil, nil, stage == "callback")
                local topic = "dc10.crash." .. uuid.v4()
                local signal = process.listen(topic, {message = true})
                local pid, spawn_err = process.spawn_monitored("app:dc10_crash_caller", "app:processes", {
                    stage = stage, payload = payload, dataflow_id = row.dataflow_id, row = row,
                    reply_pid = tostring(process.pid()), reply_topic = topic,
                })
                test.is_nil(spawn_err)
                test.not_nil(pid)
                local ready = channel.select({signal:case_receive(), time.after("15s"):case_receive()})
                local stopped, stop_err = process.cancel(pid, "5s")
                process.unlisten(signal)
                test.is_nil(stop_err)
                test.is_true(stopped)
                test.eq(ready.channel, signal, "native caller does not reach crash boundary")
                local boundary = ready.value:payload():data()
                test.is_true(boundary.ok, tostring(boundary.error))
                test.eq(read_row(row.run_id).admission_state,
                    (stage == "callback" or stage == "admission") and "admitted" or "unadmitted")
                local cli, client_err = client.new()
                test.is_nil(client_err)
                force_due(row.run_id)
                local first, first_err = maintenance.tick(1, row.run_id)
                test.is_nil(first_err)
                test.eq(first.failures, 0, tostring(first.last_error))
                test.eq(wait_terminal(cli, row.dataflow_id), "completed")
                for _ = 1, 3 do
                    force_due(row.run_id)
                    local recovered, recover_err = maintenance.tick(1, row.run_id)
                    test.is_nil(recover_err)
                    test.eq(recovered.failures, 0, tostring(recovered.last_error))
                end
                local finished = read_row(row.run_id)
                test.eq(finished.status, "completed")
                test.eq(finished.admission_state, "admitted")
                test.eq(terminal_events(row.run_id), 1)
                local db = store.open_db()
                local rows, err = db:query("SELECT COUNT(*) AS n FROM dataflows WHERE dataflow_id=$1", {row.dataflow_id})
                local activations, activation_err = db:query("SELECT generation FROM dataflow_activations WHERE dataflow_id=$1", {row.dataflow_id})
                local results, results_err = db:query("SELECT node_id,COUNT(*) AS n FROM dataflow_data"
                    .. " WHERE dataflow_id=$1 AND type='node.result' GROUP BY node_id", {row.dataflow_id})
                db:release()
                test.is_nil(results_err)
                test.eq(#results, 2)
                for _, result in ipairs(results) do test.eq(tonumber(result.n), 1) end
                test.is_nil(err)
                test.is_nil(activation_err)
                test.eq(tonumber(rows[1].n), 1)
                test.eq(tonumber(activations[1].generation), 1)
            end)
        end

        test.it("observes admitted pending status without requesting another native activation", function()
            local id, version = published()
            local row, payload = reserve(id, version, {count = 31})
            local cli, client_err = client.new()
            test.is_nil(client_err)
            test.eq(select(1, cli:create_workflow(payload.commands, payload.options)), row.dataflow_id)
            test.eq(select(1, cli:start(row.dataflow_id, payload.start_options)), row.dataflow_id)
            local admitted, admit_err = admission.merge(row, {status = "running"})
            test.is_nil(admit_err)
            test.is_true(admitted.admitted)
            local starts = 0
            local observer = {
                get_status = function() return "pending", nil end,
                start = function(_, flow_id, options)
                    starts = starts + 1
                    return cli:start(flow_id, options)
                end,
            }
            local current, err = engine_api.run(observer, read_row(row.run_id), payload)
            test.is_nil(err)
            test.eq(current.status, "running")
            test.eq(starts, 0)
            test.eq(wait_terminal(cli, row.dataflow_id), "completed")
            force_due(row.run_id)
            local tick, tick_err = maintenance.tick(1, row.run_id)
            test.is_nil(tick_err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            test.eq(terminal_events(row.run_id), 1)
        end)

        test.it("concurrent same-key retries retain one native run and one result per node", function()
            local id, version = published()
            local trigger = uuid.v4()
            local ready, start, done = channel.new(2), channel.new(2), channel.new(2)
            for _ = 1, 2 do
                coroutine.spawn(function()
                    ready:send(true)
                    start:receive()
                    local ok, result = pcall(function()
                        local row = reserve(id, version, {count = 37}, nil, trigger)
                        force_due(row.run_id)
                        local tick, err = maintenance.tick(1, row.run_id)
                        test.is_nil(err)
                        test.eq(tick.failures, 0, tostring(tick.last_error))
                        return row
                    end)
                    done:send({ok = ok, result = result})
                end)
            end
            local deadline = time.after("15s")
            for _ = 1, 2 do
                test.eq(channel.select({ready:case_receive(), deadline:case_receive()}).channel, ready)
            end
            start:send(true); start:send(true)
            local rows = {}
            for _ = 1, 2 do
                local selected = channel.select({done:case_receive(), deadline:case_receive()})
                test.eq(selected.channel, done)
                test.is_true(selected.value.ok, tostring(selected.value.result))
                rows[#rows + 1] = selected.value.result
            end
            test.eq(rows[1].run_id, rows[2].run_id)
            test.eq(rows[1].dataflow_id, rows[2].dataflow_id)
            local cli, client_err = client.new()
            test.is_nil(client_err)
            test.eq(wait_terminal(cli, rows[1].dataflow_id), "completed")
            force_due(rows[1].run_id)
            local tick, err = maintenance.tick(1, rows[1].run_id)
            test.is_nil(err)
            test.eq(tick.failures, 0, tostring(tick.last_error))
            test.eq(read_row(rows[1].run_id).status, "completed")
            test.eq(terminal_events(rows[1].run_id), 1)
            local db = assert(store.open_db())
            local results = assert(db:query("SELECT node_id,COUNT(*) AS n FROM dataflow_data"
                .. " WHERE dataflow_id=$1 AND type='node.result' GROUP BY node_id", {rows[1].dataflow_id}))
            local history = assert(db:query("SELECT run_id FROM workflow_runs WHERE workflow_id=$1", {id}))
            db:release()
            test.eq(#history, 1)
            test.eq(#results, 2)
            for _, result in ipairs(results) do test.eq(tonumber(result.n), 1) end
        end)

    end)
end

local function define_capacity_tests()
    test.describe("native capacity recovery", function()
        test.it("native terminal proof survives retention and 25 lost callbacks admit the 26th", function()
            local id, version = published()
            local trigger = uuid.v4()
            local cli, client_err = client.new()
            test.is_nil(client_err)
            local rows = {}
            for count = 1, 25 do
                local row, payload = reserve(id, version, {count = count}, nil, trigger)
                rows[#rows + 1] = row
                local _, create_err = cli:create_workflow(payload.commands, payload.options)
                test.is_nil(create_err)
                local result, execute_err = cli:execute(row.dataflow_id, {})
                test.is_nil(execute_err)
                test.is_true(result.success)
                test.eq(read_row(row.run_id).admission_state, "unadmitted")
            end
            local full = reserve(id, version, {count = 26}, nil, trigger)
            test.is_true(full.capacity)
            local db, open_err = store.open_db()
            test.is_nil(open_err)
            local _, age_err = db:execute("UPDATE dataflows SET updated_at='2000-01-01T00:00:00Z' WHERE CAST(dataflow_id AS TEXT) IN"
                .. " (SELECT dataflow_id FROM workflow_runs WHERE trigger_id=$1)", {trigger})
            test.is_nil(age_err)
            local _, data_age_err = db:execute("UPDATE dataflow_data SET created_at='2000-01-01T00:00:00Z' WHERE CAST(dataflow_id AS TEXT) IN"
                .. " (SELECT dataflow_id FROM workflow_runs WHERE trigger_id=$1)", {trigger})
            test.is_nil(data_age_err)
            local pruned, prune_err = retention.run(db, {days = 1, batch_size = 1000})
            db:release()
            test.is_nil(prune_err)
            test.is_true(pruned.enabled)
            test.is_true(pruned.data > 0, "retention guard prunes aged diagnostics")
            for _, row in ipairs(rows) do
                local output, output_err = cli:output(row.dataflow_id)
                test.is_nil(output_err)
                test.not_nil(output)
                force_due(row.run_id)
                local tick, tick_err = maintenance.tick(1, row.run_id)
                test.is_nil(tick_err)
                test.eq(tick.failures, 0, tostring(tick.last_error))
                test.eq(read_row(row.run_id).status, "completed")
                test.eq(terminal_events(row.run_id), 1)
            end
            local admitted, _ = reserve(id, version, {count = 26}, nil, trigger)
            test.not_nil(admitted.run_id)
            test.is_nil(admitted.capacity)
            local repeated, _ = reserve(id, version, {count = 26}, nil, trigger)
            test.eq(repeated.run_id, admitted.run_id)
        end)

    end)
end

local function define_publication_tests()
    test.describe("native publication recovery", function()
        test.it("retries a durable terminal append after publication acknowledgement loss", function()
            local id, version = published()
            local row, payload = reserve(id, version, {count = 23})
            local cli, client_err = client.new()
            test.is_nil(client_err)
            test.eq(select(1, cli:create_workflow(payload.commands, payload.options)), row.dataflow_id)
            local result, execute_err = cli:execute(row.dataflow_id, {})
            test.is_nil(execute_err)
            test.is_true(result.success)
            local topic = "dc10.publication." .. uuid.v4()
            local signal = process.listen(topic, {message = true})
            local listener, listen_err = process.spawn_monitored("app:maintenance_event_listener", "app:processes", {
                actor_id = security.actor():id(), workflow_id = id, continuous = true,
                reply_pid = tostring(process.pid()), reply_topic = topic,
            })
            test.is_nil(listen_err)
            test.not_nil(listener)
            local ready = channel.select({signal:case_receive(), time.after("15s"):case_receive()})
            test.eq(ready.channel, signal)
            test.is_true(ready.value:payload():data().ok)
            local run_state = require("run_state")
            local interrupted = maintenance.new({client_new = function() return cli, nil end,
                append_event = function(component_id, event)
                    local appended, append_err = run_state.append_event(component_id, event)
                    if append_err then return nil, append_err end
                    test.not_nil(appended)
                    return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
                        message = "publication caller disappears after durable append"})
                end})
            force_due(row.run_id)
            local first, first_err = interrupted.tick(1, row.run_id)
            test.is_nil(first_err)
            test.eq(first.failures, 1)
            test.eq(terminal_events(row.run_id), 1)
            test.is_true(pending_event(read_row(row.run_id)))
            local db = store.open_db()
            local _, due_err = db:execute("UPDATE workflow_runs SET terminal_event_check_at='2000-01-01T00:00:00Z'"
                .. " WHERE run_id=$1", {row.run_id})
            db:release()
            test.is_nil(due_err)
            local recovered, recover_err = maintenance.tick(1, row.run_id)
            test.is_nil(recover_err)
            test.eq(recovered.failures, 0, tostring(recovered.last_error))
            test.eq(terminal_events(row.run_id), 1)
            test.eq(pending_event(read_row(row.run_id)), false)
            process.send(listener, "probe", {})
            local notifications = 0
            local deadline = time.after("15s")
            while true do
                local received = channel.select({signal:case_receive(), deadline:case_receive()})
                test.eq(received.channel, signal)
                local notice = received.value:payload():data()
                if notice.kind == "count" then
                    test.eq(notice.count, 1)
                    break
                end
                test.eq(notice.kind, "thread_event")
                notifications = notifications + 1
            end
            local stopped, stop_err = process.cancel(listener, "5s")
            process.unlisten(signal)
            test.is_nil(stop_err)
            test.is_true(stopped)
            test.eq(notifications, 1)

        end)

    end)
end

local cases = test.run_cases(define_tests)
local admission_cases = test.run_cases(define_admission_tests)
local capacity_cases = test.run_cases(define_capacity_tests)
local publication_cases = test.run_cases(define_publication_tests)

local function suite_scope(): any
    local policy, policy_err = security.policy("app:workflows_suite_policy")
    if policy_err or not policy then error("suite policy: " .. tostring(policy_err)) end
    local scope, scope_err = security.new_scope({ policy })
    if scope_err or not scope then error("suite scope: " .. tostring(scope_err)) end
    return scope
end

local function run_actor(entry: string, options: any): any
    local actor_id = "live-reconcile-" .. uuid.v4()
    local db, db_err = store.open_db()
    if db_err or not db then error("live suite db: " .. tostring(db_err)) end
    local _, insert_err = db:execute("INSERT INTO app_users"
        .. " (user_id, email, full_name, password_hash, status)"
        .. " VALUES ($1, $2, $3, 'x', 'active')",
        { actor_id, actor_id .. "@example.test", actor_id })
    db:release()
    if insert_err then error("live suite user: " .. tostring(insert_err)) end
    local actor, actor_err = security.new_actor(actor_id, {})
    if actor_err or not actor then error("live suite actor: " .. tostring(actor_err)) end
    local result, err = funcs.new():with_actor(actor):with_scope(suite_scope())
        :call(entry, options or {})
    if err then error("live suite: " .. tostring(err)) end
    return result
end

return {
    run = function(options: any): any return run_actor("app:launch_reconciliation_live_actor_run", options) end,
    actor_run = function(options: any): any return cases(options) end,
    admission_run = function(options: any): any return run_actor("app:native_admission_recovery_actor_run", options) end,
    admission_actor_run = function(options: any): any return admission_cases(options) end,
    capacity_run = function(options: any): any return run_actor("app:native_capacity_recovery_actor_run", options) end,
    capacity_actor_run = function(options: any): any return capacity_cases(options) end,
    publication_run = function(options: any): any return run_actor("app:native_publication_recovery_actor_run", options) end,
    publication_actor_run = function(options: any): any return publication_cases(options) end,
}
