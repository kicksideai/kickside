local runs_read = require("runs_read")
local admission = require("admission")
local engine_api = require("engine_api")
local errors = require("errors")
local time = require("time")
local policy = require("policy")
local launch_budget = require("launch_budget")

local function attach(M: any, I: any): ()
type Map = { [string]: any }
local types, store, version_read, version_publish, compiler, client =
    I.types, I.store, I.version_read, I.version_publish, I.compiler, I.client
local log = I.log
local launch_error = I.launch_error :: (string, any, any?) -> Map
local err_message, new_id = I.err_message, I.new_id
local first_compile_error = I.first_compile_error
local validate_start_input = I.validate_start_input
local emit_lifecycle_event, RUN_EVENT = I.emit_lifecycle_event, I.RUN_EVENT
local safe_get, sample_of_schema = I.safe_get, I.sample_of_schema
local string_value = I.string_value
local RUN_DEDUP_MAX_LENGTH = I.RUN_DEDUP_MAX_LENGTH
local exact_automation_ref = I.exact_automation_ref
local execution_identity = I.execution_identity

-- ── launch ──────────────────────────────────────────────────────────────────
-- start_compiled reserves the run, materializes the engine dataflow, and admits it.
-- Callers own how commands are obtained (published version vs working-document compile).
local function start_compiled(workflow_id: string, opts: Map): (Map?, any?)
    local v = tonumber(opts.version) or 0
    local compiled_commands = opts.commands
    if type(compiled_commands) ~= "table" then
        return nil, launch_error("compiled_commands_invalid", "compiled commands required")
    end
    local input_err = validate_start_input(opts.input_schema, opts.input)
    if input_err then
        return nil, launch_error("start_input_invalid", input_err, { validation_error = input_err })
    end
    local trigger_kind = type(opts.trigger_kind) == "string" and opts.trigger_kind ~= "" and opts.trigger_kind or "manual"
    local trigger_id = type(opts.trigger_id) == "string" and opts.trigger_id or nil
    local dedup_key = type(opts.dedup_key) == "string" and opts.dedup_key ~= "" and opts.dedup_key or nil
    local origin = type(opts.origin) == "string" and opts.origin ~= "" and opts.origin or "published"
    local workflow_stack = { workflow_id }
    local depth = 0
    local automation_ref: Map? = nil
    if opts.automation_ref ~= nil then
        local exact, automation_err = exact_automation_ref.validate(opts.automation_ref)
        if automation_err or not exact then return nil, launch_error("automation_ref_invalid", automation_err) end
        automation_ref = exact :: Map
    end
    if trigger_kind == "binding" and not automation_ref then
        return nil, launch_error("automation_ref_invalid", "binding launches require an exact automation_ref")
    end
    if automation_ref and trigger_kind ~= "binding" then
        return nil, launch_error("automation_ref_invalid", "automation_ref is only valid for a binding launch")
    end
    local draft_ref: Map? = nil
    if v == 0 then
        local candidate = type(opts.draft_ref) == "table" and (opts.draft_ref :: Map) or {}
        local def_seq = candidate.def_seq
        if candidate.kind ~= "flow" or candidate.id ~= workflow_id
            or type(def_seq) ~= "number" or def_seq < 0 or def_seq ~= math.floor(def_seq) then
            return nil, launch_error("draft_ref_invalid", "simulation requires an exact draft_ref with kind, id, and def_seq")
        end
        draft_ref = { kind = "flow", id = workflow_id, def_seq = def_seq }
    end

    local identity, identity_err = execution_identity.capture()
    if identity_err or not identity then
        return nil, launch_error("execution_identity_invalid", identity_err or "run identity unavailable")
    end
    local identity_row, encode_err = execution_identity.to_row(identity)
    if encode_err or not identity_row then
        return nil, launch_error("execution_identity_invalid", encode_err or "run identity could not be encoded")
    end

    local function remint_for(run_id: string, dataflow_id: string): (any?, any?)
        local commands, _, route_err = compiler.remint(compiled_commands, new_id, opts.input, {
            run_id = run_id, dataflow_id = dataflow_id, version = v,
            workflow_stack = workflow_stack, depth = depth,
        })
        return commands, route_err
    end
    local candidate_id, candidate_dataflow_id = new_id(), new_id()
    local fresh, remint_err = remint_for(candidate_id, candidate_dataflow_id)
    if remint_err or not fresh then
        return nil, launch_error("workflow_input_route_failed", tostring(remint_err or "workflow input could not be routed"))
    end
    local create_options: Map = {
        dataflow_id = candidate_dataflow_id, type = "workflow",
        metadata = { run_id = candidate_id, origin = origin, simulated = origin == "simulation",
            resume_handler = "kickside.workflows.runs:resume" },
        on_complete = types.RUN_COMPLETED_FUNC,
    }
    if v > 0 then create_options.metadata.flow_ref = { kind = "flow", id = workflow_id, version = v }
    else create_options.metadata.draft_ref = draft_ref end
    if automation_ref then create_options.metadata.automation_ref = automation_ref end
    local start_options: Map = {}
    if type(opts.session_id) == "string" and opts.session_id ~= "" then
        start_options.init_func_id = "userspace.dataflow.session:artifact"
    end
    local creation_json, creation_err = I.json.encode({ version = v, input = opts.input or {},
        commands = fresh, options = create_options, start_options = start_options })
    if creation_err or not creation_json then
        return nil, launch_error("run_payload_invalid", creation_err or "run creation payload could not be encoded")
    end
    local runtime_policy, policy_err = policy.policy()
    if policy_err or not runtime_policy then
        return nil, policy_err or errors.new({ message = "workflow launch policy unavailable", kind = errors.INTERNAL })
    end
    local reservation, reserve_err = admission.reserve({
        run_id = candidate_id, dataflow_id = candidate_dataflow_id,
        workflow_id = workflow_id, version = v, draft_def_seq = draft_ref and draft_ref.def_seq or nil,
        trigger_kind = trigger_kind, trigger_id = trigger_id, dedup_key = dedup_key,
        origin = origin, invocation_id = string_value(opts.invocation_id),
        automation_revision = automation_ref and automation_ref.revision or nil,
        binding_id = automation_ref and automation_ref.id or nil,
        execution_identity_json = identity_row.actor_context,
        creation_payload_json = creation_json,
    })
    if reserve_err or not reservation then
        return nil, reserve_err or errors.new({ message = "run reservation unavailable", kind = errors.INTERNAL })
    end
    if reservation.capacity then return nil, launch_error("run_capacity", "workflow run capacity reached") end
    local reserved = reservation.row
    if reservation.existing and reserved.admission_state == "admitted" then
        return { run_id = reserved.run_id, dataflow_id = reserved.dataflow_id, deduped = true }, nil
    end
    local run_id, dataflow_id = tostring(reserved.run_id), tostring(reserved.dataflow_id)
    local admission_timeout_ms = (runtime_policy :: Map).admission_timeout_ms :: integer
    -- §8's request budget stops further admission calls once it expires. The
    -- reservation remains durable and §7.3 maintenance recovers ambiguous or
    -- unfinished admission instead of discarding or restarting its engine flow.
    local admission_deadline = launch_budget.deadline(time.now(), admission_timeout_ms)
    local function timed_out(): boolean
        return launch_budget.expired(time.now(), admission_deadline)
    end
    local function pending_after_timeout(): Map
        return launch_error("admission_pending", "workflow admission exceeded its configured time budget", {
            admission_timeout_ms = admission_timeout_ms,
        })
    end
    local function stop_if_timed_out(): Map?
        return timed_out() and pending_after_timeout() or nil
    end
    local function run_admission_step(operation: () -> (any?, any?)): (any?, any?, Map?)
        local value, operation_err, expired = launch_budget.invoke(time, admission_deadline, operation)
        if expired then return nil, nil, pending_after_timeout() end
        return value, operation_err, nil
    end
    local stored_payload, payload_err = admission.creation_payload(reserved)
    if payload_err or not stored_payload then
        return nil, launch_error("run_payload_invalid", payload_err or "run creation payload unavailable")
    end
    fresh, create_options, start_options = stored_payload.commands, stored_payload.options,
        stored_payload.start_options

    local run_record: Map = {
        run_id = run_id, dataflow_id = dataflow_id,
        trigger_kind = trigger_kind, trigger_id = trigger_id, dedup_key = dedup_key,
        origin = origin,
        status = types.RUN_STATUS.PENDING, started_at = reserved.started_at,
        invocation_id = string_value(opts.invocation_id),
        execution_identity_json = identity_row.actor_context,
    }
    if v > 0 then run_record.flow_ref = { kind = "flow", id = workflow_id, version = v }
    else run_record.draft_ref = draft_ref end
    if automation_ref then
        run_record.automation_ref = automation_ref
    end
    local function lifecycle_opts(extra: Map?): Map
        local out: Map = {
            trace_context = opts.trace_context,
            automation_ref = automation_ref,
            trigger_id = opts.trigger_id,
            invocation_id = opts.invocation_id,
            authority_identity = opts.authority_identity,
        }
        if type(extra) == "table" then
            for k, v_extra in pairs(extra :: Map) do out[k] = v_extra end
        end
        return out
    end
    local cli, cerr = I.client_new()
    if not cli then
        return nil, cerr or errors.new({ message = "dataflow client unavailable", kind = errors.UNAVAILABLE })
    end
    local supported, support_err = engine_api.require_methods(cli)
    if support_err or not supported then return nil, support_err end

    local current, engine_err, execution: any
    local timeout_err: any = nil
    local budgeted_client: any = {}
    for _, name in ipairs({ "get_status", "create_workflow", "start", "execute", "output" }) do
        budgeted_client[name] = function(_self: any, ...: any): (any?, any?)
            local args = { ... }
            local value, call_err, expired = run_admission_step(function(): (any?, any?)
                return cli[name](cli, table.unpack(args))
            end)
            if expired then timeout_err = expired; return nil, expired end
            return value, call_err
        end
    end
    current, engine_err, execution = engine_api.run(budgeted_client, reserved, {
        commands = fresh, options = create_options, start_options = start_options,
    }, opts.mode == "sync")
    if timeout_err then return nil, timeout_err end
    if engine_err or not current then
        return nil, engine_err or launch_error("admission_pending", "dataflow start pending")
    end
    timeout_err = stop_if_timed_out()
    if timeout_err then return nil, timeout_err end
    local merged, merge_err = admission.merge(reserved, current)
    if merge_err or not merged or not merged.admitted then
        return nil, merge_err or launch_error("admission_pending", "admission pending")
    end
    if merged.changed and not merged.terminal then
        emit_lifecycle_event(workflow_id, RUN_EVENT.STARTED, run_record, types.RUN_STATUS.RUNNING, lifecycle_opts())
    end

    local result: Map = { run_id = run_id, dataflow_id = dataflow_id }
    if reservation.existing then result.deduped = true end
    if opts.mode == "sync" then
        if type(execution) == "table" then
            result.success = (execution :: Map).success == true
            result.pending = (execution :: Map).pending == true
            result.passivated = (execution :: Map).passivated == true
            result.status = (result.pending or result.passivated) and types.RUN_STATUS.RUNNING
                or (result.success and types.RUN_STATUS.COMPLETED or types.RUN_STATUS.FAILED)
            result.data = (execution :: Map).data
            result.error = (execution :: Map).error
        else
            local terminal = admission.terminal_status(current.status)
            local outcome = current
            result.success = terminal == types.RUN_STATUS.COMPLETED
            result.pending = terminal == nil
            result.passivated = terminal == nil
            result.status = terminal or types.RUN_STATUS.RUNNING
            result.error = outcome.error
            result.data = current.output
        end
    end
    return result, nil
end

local function validate_dedup_field(name: string, value: any): Map?
    if type(value) ~= "string" then
        return launch_error("run_dedup_invalid", name .. " must be a string")
    end
    if #value < 1 or #value > RUN_DEDUP_MAX_LENGTH then
        return launch_error("run_dedup_invalid", name .. " must be between 1 and " .. tostring(RUN_DEDUP_MAX_LENGTH) .. " characters")
    end
    if not value:match("^[%w%._:@/%+%-]+$") then
        return launch_error("run_dedup_invalid", name .. " contains unsupported characters")
    end
    return nil
end

local function validate_launch_dedup(opts: Map): Map?
    local has_trigger_id = opts.trigger_id ~= nil
    local has_dedup_key = opts.dedup_key ~= nil
    if has_dedup_key and not has_trigger_id then
        return launch_error("run_dedup_invalid", "dedup_key requires trigger_id")
    end
    if has_trigger_id then
        local trigger_err = validate_dedup_field("trigger_id", opts.trigger_id)
        if trigger_err then return trigger_err end
    end
    if has_dedup_key then
        return validate_dedup_field("dedup_key", opts.dedup_key)
    end
    return nil
end

-- opts: { version, input?, trigger_kind?, trigger_id?, dedup_key? }.
-- Published execution always names one immutable positive version. The editor's
-- explicit simulate() path is the only place a working document is compiled and run
-- as version 0.
function M.launch(workflow_id: any, opts: any): (Map?, any?)
    if type(workflow_id) ~= "string" or workflow_id == "" then
        return nil, launch_error("workflow_id_invalid", "workflow id required")
    end
    opts = type(opts) == "table" and opts or {}
    local o = opts :: Map
    local allowed: Map = {
        version = true, input = true, input_schema = true, mode = true,
        dedup_key = true, trace_context = true, authority_identity = true,
        trigger_kind = true, trigger_id = true, origin = true,
        automation_ref = true, invocation_id = true, session_id = true,
    }
    for key, _ in pairs(o) do
        if allowed[key] ~= true then
            return nil, launch_error("flow_launch_invalid", "unsupported Flow launch option: " .. tostring(key))
        end
    end
    local dedup_err = validate_launch_dedup(o)
    if dedup_err then return nil, dedup_err end
    if o.mode ~= nil and type(o.mode) ~= "string" then
        return nil, launch_error("flow_launch_invalid", "Flow launch mode must be async or sync")
    end
    local mode = type(o.mode) == "string" and o.mode or "async"
    if mode ~= "async" and mode ~= "sync" then
        return nil, launch_error("flow_launch_invalid", "unsupported Flow launch mode: " .. tostring(o.mode))
    end

    local v = o.version
    if type(v) ~= "number" or v < 1 or v ~= math.floor(v) then
        return nil, launch_error("flow_ref_invalid", "published Flow execution requires an explicit positive integer version")
    end
    local input_schema: any = o.input_schema
    local vr, verr = version_read.get(workflow_id, v)
    if verr then return nil, verr end
    if not vr then
        return nil, launch_error("version_not_found", "version not found: " .. tostring(v), { version = v })
    end
    -- Repeat the pure Block-config check immediately before remint/create so a
    -- corrupted frozen artifact cannot reach the engine.
    local requirement_errors, requirement_err = version_publish.validate_published_config_requirements((vr :: Map).document)
    if requirement_err then
        return nil, requirement_err
    end
    if type(requirement_errors) == "table" and #(requirement_errors :: { any }) > 0 then
        local first = (requirement_errors :: { any })[1]
        local message = type(first) == "table" and tostring((first :: Map).message or "workflow config is unbound")
            or "workflow config is unbound"
        return nil, launch_error("config_requirements_unbound", message, { errors = requirement_errors })
    end
    local compiled_commands = (vr :: Map).compiled_commands
    input_schema = (vr :: Map).input_schema

    local origin = type(o.origin) == "string" and o.origin ~= "" and o.origin or "published"
    return start_compiled(workflow_id, {
        version = v,
        commands = compiled_commands,
        input = o.input,
        input_schema = input_schema,
        trigger_kind = o.trigger_kind,
        trigger_id = o.trigger_id,
        dedup_key = o.dedup_key,
        origin = origin,
        trace_context = o.trace_context,
        authority_identity = o.authority_identity,
        automation_ref = o.automation_ref,
        invocation_id = o.invocation_id,
        session_id = o.session_id,
        mode = mode,
    })
end

-- simulate compiles the current unpublished document and launches it as a transient
-- engine run. Compiler validation failures are returned as data, not hidden behind a
-- generic launch error.
function M.simulate(workflow_id: any, opts: any): (Map?, any?)
    if type(workflow_id) ~= "string" or workflow_id == "" then return nil, launch_error("workflow_id_invalid", "workflow id required") end
    opts = type(opts) == "table" and opts or {}
    local o = opts :: Map
    for key, _ in pairs(o) do
        if key ~= "input" and key ~= "trace_context" then
            return nil, launch_error("draft_launch_invalid", "unsupported Flow draft launch option: " .. tostring(key))
        end
    end

    local draft, derr = version_publish.compile_working(workflow_id)
    if derr then return nil, derr end
    local compiled = type(draft) == "table" and safe_get(draft, "compiled") or nil
    if type(compiled) ~= "table" or safe_get(compiled, "ok") ~= true then
        return nil, launch_error("compile_failed", first_compile_error(compiled), { errors = safe_get(compiled, "errors") or {} })
    end

    local explicit_input = safe_get(o, "input")
    local input = type(explicit_input) == "table" and explicit_input or sample_of_schema(safe_get(compiled, "input_schema"))
    if type(input) ~= "table" then input = {} end
    local input_err = validate_start_input(safe_get(compiled, "input_schema"), input)
    if input_err then return nil, launch_error("start_input_invalid", input_err, { errors = { { code = "start_input_invalid", message = input_err } } }) end
    local launched, lerr = start_compiled(workflow_id, {
        version = 0,
        draft_ref = { kind = "flow", id = workflow_id, def_seq = tonumber(safe_get(draft, "def_seq")) or 0 },
        commands = safe_get(compiled, "commands"),
        input = input,
        input_schema = safe_get(compiled, "input_schema"),
        trigger_kind = "simulation",
        origin = "simulation",
        trace_context = o.trace_context,
    })
    if lerr then return nil, lerr end
    return { ok = true, run_id = safe_get(launched, "run_id"), dataflow_id = safe_get(launched, "dataflow_id") }, nil
end

local NODE_TERMINAL: { [string]: boolean } = {
    completed = true,
    failed = true,
    cancelled = true,
    terminated = true,
    skipped = true,
}

end

local default, private = runs_read.new()
attach(default, private)
return { launch = default.launch, simulate = default.simulate, attach = attach }
