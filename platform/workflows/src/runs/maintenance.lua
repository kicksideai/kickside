-- One supervised slot reconciles all due runs and pending lifecycle events.
-- Each claim commits before the engine read or thread append it authorizes.
local time = require("time")
local sql = require("sql")
local logger = require("logger")
local uuid = require("uuid")
local json = require("json")
local funcs = require("funcs")
local security = require("security")
local admission = require("admission")
local engine_api = require("engine_api")
local client = require("client")
local runs_read = require("runs_read")
local runs_state = require("runs_state")
local execution_identity = require("execution_identity")
local component = require("component")
local policy = require("policy")
local run_time = require("run_time")

local function construct(dependencies: any): any
local selected_admission = dependencies.admission or admission
local client_new = dependencies.client_new or client.new
local append_event = dependencies.append_event or runs_state.append_event
local M = {}
local log = logger:named("workflows.runs.maintenance")

-- Admission serializes on the gate row before inserting a run. Locking the
-- orphan candidate makes removal serialize with a concurrent reservation.
local function prune_orphan_gates(tx: any, dbtype: string, cap: number): (integer?, error?)
    local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE OF g SKIP LOCKED" or ""
    local rows, query_err = tx:query([[SELECT g.trigger_id FROM workflow_admission_gate g
        WHERE NOT EXISTS (SELECT 1 FROM workflow_runs r
            WHERE r.trigger_id=g.trigger_id AND r.superseded_by IS NULL)
        ORDER BY g.trigger_id LIMIT $1]] .. lock, { cap })
    if query_err then return nil, query_err end
    if type(rows) ~= "table" then
        return nil, errors.new({ message = "workflow admission gate query returned no rows result", kind = errors.INTERNAL })
    end
    local removed_total: integer = 0
    for _, row in ipairs(rows) do
        local deleted, delete_err = tx:execute([[DELETE FROM workflow_admission_gate
            WHERE trigger_id=$1 AND NOT EXISTS
                (SELECT 1 FROM workflow_runs WHERE trigger_id=$1 AND superseded_by IS NULL)]],
            { row.trigger_id })
        if delete_err then return nil, delete_err end
        local affected_number = deleted and tonumber(deleted.rows_affected)
        local affected = affected_number and math.tointeger(affected_number)
        if affected == nil then
            return nil, errors.new({ message = "workflow admission gate delete returned no affected-row result",
                kind = errors.INTERNAL, retryable = true })
        end
        removed_total = removed_total + affected
    end
    return removed_total, nil
end

-- One indexed, bounded batch from the existing maintenance service. A
-- terminal row is retained until its event has been published and acknowledged.
local function prune_terminal_batch(cap: integer, runtime_policy: any): (any?, any?)
    local days = (runtime_policy :: any).retention_runs_days :: integer
    local cutoff = time.now():utc():add(-days * 24 * time.HOUR):format(time.RFC3339)
    return selected_admission.transaction(function(tx: any, dbtype: string): (any?, any?)
        -- Gate cleanup runs before run locks to preserve the admission lock order.
        local gates_pruned, gate_err = prune_orphan_gates(tx, dbtype, cap)
        if gate_err then return nil, gate_err end
        local rows, query_err = tx:query([[SELECT run_id,workflow_id FROM workflow_runs
            WHERE status IN ('completed','failed','cancelled','terminated')
              AND NOT terminal_event_pending
              AND finished_at <= $1 ORDER BY finished_at,run_id LIMIT $2]], { cutoff, cap })
        if query_err then return nil, query_err end
        if type(rows) ~= "table" then
            return nil, errors.new({ message = "workflow retention query returned no rows result", kind = errors.INTERNAL })
        end
        table.sort(rows, function(a: any, b: any): boolean return tostring(a.run_id) < tostring(b.run_id) end)
        local count = 0
        for _, row in ipairs(rows) do
            local removed, remove_err = tx:query([[DELETE FROM workflow_runs
                WHERE run_id=$1 AND status IN ('completed','failed','cancelled','terminated')
                  AND NOT terminal_event_pending
                  AND finished_at <= $2 RETURNING workflow_id]], { row.run_id, cutoff })
            if remove_err or type(removed) ~= "table" or #removed > 1 then
                return nil, errors.new({ message = "workflow terminal delete returned no physical proof: "
                    .. tostring(remove_err or row.run_id), kind = errors.INTERNAL, retryable = true })
            end
            if removed[1] then count = count + 1 end
        end
        return { pruned = count, gates_pruned = gates_pruned :: integer }, nil
    end)
end

function M.prune_terminal(limit: number?): (integer?, error?, integer?)
    local runtime_policy, policy_err = policy.policy()
    if policy_err or not runtime_policy then return nil, policy_err end
    local batch = (runtime_policy :: any).completion_batch :: integer
    local cap_number = math.floor(math.max(1, math.min(batch, tonumber(limit) or batch)))
    local cap = math.tointeger(cap_number)
    if cap == nil then
        return nil, errors.new({ message = "workflow retention batch limit is invalid", kind = errors.INVALID }), nil
    end
    local counts, prune_err = prune_terminal_batch(cap, runtime_policy)
    if prune_err or not counts then return nil, prune_err end
    return (counts :: any).pruned, nil, (counts :: any).gates_pruned
end

-- claim_due claims due completion checks of runs holding an execution
-- identity (a run without one stays fail-closed) or due terminal publications.
local function claim_due(publication: boolean, limit: number, run_id: string?, runtime_policy: any): (any?, any?)
    local due_column = publication and "terminal_event_check_at" or "completion_check_at"
    local token_column = publication and "terminal_event_token" or "completion_check_token"
    local predicate = publication and "terminal_event_pending"
        or "status IN ('pending','running') AND execution_identity_json IS NOT NULL AND execution_identity_json <> ''"
    return selected_admission.transaction(function(tx: any, dbtype: string): (any?, any?)
        local claim_at = selected_admission.now()
        local lock = dbtype == sql.type.POSTGRES and " FOR UPDATE SKIP LOCKED" or ""
        local filter = run_id and " AND run_id=$2" or ""
        local params = run_id and { claim_at, run_id, limit } or { claim_at, limit }
        local rows, query_err = tx:query("SELECT * FROM workflow_runs WHERE " .. predicate .. " AND "
            .. due_column .. " IS NOT NULL AND " .. due_column .. " <= $1" .. filter
            .. " ORDER BY " .. due_column .. ",run_id LIMIT " .. (run_id and "$3" or "$2") .. lock, params)
        if query_err then return nil, query_err end
        if type(rows) ~= "table" then
            return nil, errors.new({ message = "workflow due-run query returned no rows result",
                kind = errors.INTERNAL, retryable = true })
        end
        local out: { any } = {}
        for _, row in ipairs(rows) do
            local token = uuid.v4()
            local timestamp = publication and row.finished_at or row.started_at
            local elapsed_ms = run_time.delta_ms(timestamp, claim_at) or 0
            local delay_ms = policy.next_completion_delay(runtime_policy, elapsed_ms)
            local next_check_at = selected_admission.now(delay_ms / 1000)
            local _, update_err = tx:execute("UPDATE workflow_runs SET " .. token_column .. "=$1,"
                .. due_column .. "=$2 WHERE run_id=$3", { token, next_check_at, row.run_id })
            if update_err then return nil, update_err end
            row[token_column] = token
            out[#out + 1] = row
        end
        return out, nil
    end)
end
M._claim_due = claim_due

local function acknowledge_event(row: any): (any?, any?)
    return selected_admission.transaction(function(tx: any): (any?, any?)
        local result, err = tx:execute("UPDATE workflow_runs SET terminal_event_pending=FALSE,"
            .. "terminal_event_check_at=NULL WHERE run_id=$1 AND terminal_event_token=$2"
            .. " AND terminal_event_pending", { row.run_id, row.terminal_event_token })
        if err then return nil, err end
        return { acknowledged = (tonumber(result and result.rows_affected) or 0) > 0 }, nil
    end)
end

local function emit_terminal_event(row: any): (any?, any?)
    local run = runs_read.row_to_run(row)
    local event_type = runs_read.terminal_event_type(row.status)
    if not event_type then return nil, "terminal row has no event type" end
    local ref = run.flow_ref or run.draft_ref or {}
    local body: any = {
        run_id = tostring(row.run_id), status = row.status, dataflow_id = row.dataflow_id,
        started_at = row.started_at, ended_at = row.finished_at,
        origin = { type = row.origin or "published", id = tostring(ref.id or "") },
        trace_context = { run_id = tostring(row.run_id), trace_id = "workflow:" .. tostring(row.run_id),
            correlation_key = row.dedup_key or row.trigger_id or row.run_id },
        trigger_id = row.trigger_id,
    }
    if run.flow_ref then body.flow_ref = run.flow_ref else body.draft_ref = run.draft_ref end
    if run.automation_ref then body.automation_ref = run.automation_ref end
    if row.status ~= "completed" then
        local message = type(row.error) == "string" and row.error ~= "" and row.error or row.status
        body.error = { code = row.status, message = message }
    end
    local duration = run_time.duration_ms(row.started_at, row.finished_at)
    if duration ~= nil then body.duration_ms = duration end
    local event = { type = event_type, role = "system", body = body,
        content = { content_type = "application/json", content_mode = "inline" },
        trace_context = body.trace_context,
        external = { external_source = "kickside.workflow_run", external_id = tostring(row.run_id),
            external_version = "1" }, }
    local _, append_err = append_event(tostring(row.workflow_id), event)
    if append_err then return nil, append_err end
    return true, nil
end

local function publish(row: any): (any?, any?)
    -- The durable external event identity makes an append retry idempotent.
    -- Only the workflow publication receipt remains to commit after the append.
    return acknowledge_event(row)
end

-- Only maintenance_publish calls this after validating the claimed publication
-- token. The completion callback never receives the Component runtime capability.
local function refresh_public_meta(row: any): (boolean?, error?)
    if row.public_meta_refreshed_at ~= nil then return true, nil end
    local total, count_err = selected_admission.transaction(function(tx: any): (any?, any?)
        local rows, err = tx:query([[SELECT COUNT(*) AS c FROM workflow_runs
            WHERE workflow_id=$1 AND status IN ('completed','failed','cancelled','terminated')]],
            { row.workflow_id })
        if err then return nil, err end
        return rows and rows[1] and tonumber(rows[1].c) or 0, nil
    end)
    if count_err then return nil, count_err end
    local updated, update_err = component.set_runtime_meta(tostring(row.workflow_id), {
        runs_total = total, last_run_at = selected_admission.now(),
        last_error = type(row.error) == "string" and row.error or "",
    })
    if update_err or not updated then return nil, update_err or errors.new({
        kind = errors.INTERNAL, message = "workflow public metadata write returned no result" }) end
    local receipt, receipt_err = selected_admission.transaction(function(tx: any): (any?, any?)
        return tx:execute([[UPDATE workflow_runs SET public_meta_refreshed_at=$1
            WHERE run_id=$2 AND terminal_event_token=$3]],
            { selected_admission.now(), row.run_id, row.terminal_event_token })
    end)
    if receipt_err then return nil, receipt_err end
    if not receipt or tonumber(receipt.rows_affected) ~= 1 then
        return nil, errors.new({ kind = errors.CONFLICT, message = "workflow metadata claim changed",
            retryable = true })
    end
    return true, nil
end

local function observe(client_instance: any, row: any): (any?, any?)
    local payload, payload_err = selected_admission.creation_payload(row)
    if payload_err or not payload then return nil, payload_err end
    local current, engine_err = engine_api.run(client_instance, row, payload)
    if engine_err or not current then return nil, engine_err end
    local merged, merge_err = selected_admission.merge(row, current, tostring(row.completion_check_token))
    if merge_err then return nil, merge_err end
    return merged, nil
end

-- The claimed token fences each row action across the publisher and run frames.
function M.row_action(args: any): (any?, any?)
    if type(args) ~= "table" or (args.phase ~= "observe" and args.phase ~= "publish"
        and args.phase ~= "publish_event")
        or type(args.run_id) ~= "string" or type(args.token) ~= "string" then
        return nil, errors.new({ kind = errors.INVALID, message = "invalid maintenance row action" })
    end
    local column = args.phase == "observe" and "completion_check_token" or "terminal_event_token"
    local row, read_err = selected_admission.transaction(function(tx: any): (any?, any?)
        local rows, err = tx:query("SELECT * FROM workflow_runs WHERE run_id=$1 AND " .. column .. "=$2",
            { args.run_id, args.token })
        if err then return nil, err end
        if type(rows) ~= "table" then
            return nil, errors.new({ message = "workflow maintenance row query returned no rows result",
                kind = errors.INTERNAL, retryable = true })
        end
        return rows[1] or { stale = true }, nil
    end)
    if read_err or not row then return nil, read_err end
    if row.stale then return row, nil end
    if args.phase == "publish_event" then
        local emitted, emit_err = emit_terminal_event(row)
        if emit_err or not emitted then return nil, emit_err end
        return refresh_public_meta(row)
    end
    if args.phase == "publish" then return publish(row) end
    local cli, client_err = client_new()
    if client_err or not cli then return nil, client_err or "dataflow client unavailable" end
    local supported, support_err = engine_api.require_methods(cli)
    if support_err or not supported then return nil, support_err end
    return observe(cli, row)
end

local function run_row_action(row: any, phase: string, local_client: any?): (any?, any?)
    if local_client then
        if phase == "observe" then return observe(local_client, row) end
        local _, append_err = emit_terminal_event(row)
        if append_err then return nil, append_err end
        return publish(row)
    end
    local args = { phase = phase, run_id = tostring(row.run_id),
        token = tostring(phase == "observe" and row.completion_check_token or row.terminal_event_token) }
    -- The framework service publishes an already-authorized terminal audit
    -- event. The run identity alone executes user behavior and engine reads.
    if phase == "publish" then
        local published, append_err = funcs.call("kickside.workflows.runs:maintenance_publish", {
            phase = "publish_event", run_id = args.run_id, token = args.token,
        })
        if append_err then return nil, append_err end
        if published ~= true then
            return nil, errors.new({ kind = errors.INTERNAL,
                message = "workflow terminal publisher returned no success result", retryable = true })
        end
        return publish(row)
    end
    local encoded, decode_err = json.decode(tostring(row.execution_identity_json or ""))
    if decode_err or type(encoded) ~= "table" or type(encoded.principal) ~= "table" then
        return nil, errors.new({ kind = errors.INVALID, message = "workflow run execution identity is invalid" })
    end
    local identity, identity_err = execution_identity.from_row(
        execution_identity.actor_key(encoded.principal), row.execution_identity_json)
    if identity_err or not identity then return nil, identity_err end
    local actor = security.actor()
    if actor and actor:id() == execution_identity.actor_key(identity.principal) then
        return M.row_action(args)
    end
    return execution_identity.run_as(identity, "kickside.workflows.runs:maintenance_row", args, {
        deferred_owner = "kickside.workflows.runs:maintenance_tick_worker",
        execution_root = identity.component_id,
    })
end

function M.tick(limit: number?, run_id: string?, recover: boolean?): (any?, any?)
    local runtime_policy, policy_err = policy.policy()
    if policy_err or not runtime_policy then return nil, policy_err end
    local batch = (runtime_policy :: any).completion_batch :: integer
    local cap_number = math.floor(math.max(1, math.min(batch, tonumber(limit) or batch)))
    local cap = math.tointeger(cap_number)
    if cap == nil then return nil, "workflow maintenance batch limit is invalid" end
    local stats = { checked = 0, published = 0, failures = 0, pruned = 0 }
    local local_client: any = nil
    if dependencies.client_new then
        local cli, client_err = client_new()
        if client_err or not cli then return nil, client_err or "dataflow client unavailable" end
        local supported, support_err = engine_api.require_methods(cli)
        if support_err or not supported then return nil, support_err end
        local_client = cli
    end
    local due, due_err = claim_due(false, cap, run_id, runtime_policy)
    if due_err then return nil, due_err end
    for _, row in ipairs(due or {}) do
        local _, observe_err = run_row_action(row, "observe", local_client)
        stats.checked = stats.checked + 1
        if observe_err then
            stats.failures = stats.failures + 1
            stats.last_error = observe_err
            log:warn("workflow status check failed", { run_id = row.run_id, error = tostring(observe_err) })
        end
    end
    local events, event_err = claim_due(true, cap, run_id, runtime_policy)
    if event_err then return nil, event_err end
    for _, row in ipairs(events or {}) do
        local _, publish_err = run_row_action(row, "publish", local_client)
        if publish_err then
            stats.failures = stats.failures + 1
            stats.last_error = publish_err
            log:warn("workflow terminal publication failed", { run_id = row.run_id, error = tostring(publish_err) })
        else stats.published = stats.published + 1 end
    end
    local pruned, prune_err, gates_pruned = M.prune_terminal(cap)
    if prune_err then return nil, prune_err end
    stats.pruned = pruned :: integer
    stats.continue_immediately = (stats.pruned > 0) or ((gates_pruned or 0) >= cap and cap > 0)
    return stats, nil
end

function M.worker(args: any): (any?, any?)
    return M.tick(type(args) == "table" and args.limit or nil,
        type(args) == "table" and args.run_id or nil,
        not (type(args) == "table" and args.recover == false))
end

M.new = construct
return M
end

return construct({})
