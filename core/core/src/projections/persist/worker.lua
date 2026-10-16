-- The generic projection-worker boundary. A projection names its worker by a
-- worker_ref URI (func://<id> or proc://<id>); this module parses and validates
-- that ref against the registry, fetches the event batch a prefetch worker
-- needs, and invokes the bound worker — synchronously for func://, via
-- process.exec for proc://. It carries no agent-specific shape: it hands the
-- worker an input envelope and returns the worker's table output verbatim. All
-- errors are returned as values; nothing is raised.

local sql = require("sql")
local json = require("json")
local persisted_json = require("persisted_json")
local funcs = require("funcs")
local registry = require("registry")
local security = require("security")
local time = require("time")
local types = require("types")
local execution_identity = require("execution_identity")
local trace_context = require("trace_context")
local proc_supervisor = require("proc_supervisor")
local projection_policy = require("projection_policy")
local error_envelope = require("error_envelope")
local job_types = require("job_types")

local worker = {}

-- Error detail reason of a failure the bound worker itself returned, as opposed
-- to a binding, identity or supervision failure around it.
worker.WORKER_FAILED = "worker_failed"

-- Error text a supervised proc worker surfaces when its hard wall-clock ceiling
-- elapses. It is an infrastructure failure (not a lost lease): Jobs retries the
-- slot, and the cursor records it as its last_error.
local PROC_TIMEOUT_MARKER = "projection worker exceeded max_execution_ms"
worker.PROC_TIMEOUT_MARKER = PROC_TIMEOUT_MARKER

-- A parsed, optionally validated worker reference.
type Binding = {
    worker_ref: string,
    worker_runtime: string,
    target_id: string,
}

-- A pooled connection or open transaction the event prefetch reads through.
type Executor = sql.DB | sql.Transaction

-- Daemon process ids that must never be invoked as a projection worker: doing so
-- would re-enter or starve a supervised loop. Blocking them is a correctness
-- guard, not a tuning choice.
local PROC_BLOCKED = {
    ["kickside.core.jobs.service:worker"] = "job worker is a daemon and cannot be used as a projection worker",
}

local function trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- The registry entry kind, supporting both top-level and data-nested shapes.
local function entry_kind(entry: any): string?
    if type(entry) ~= "table" then
        return nil
    end
    local direct = trim(entry.kind)
    if direct ~= "" then
        return direct
    end
    local data = type(entry.data) == "table" and entry.data or {}
    local nested = trim(data.kind)
    if nested ~= "" then
        return nested
    end
    return nil
end

local function entry_field(entry: any, field: string): any
    if type(entry) ~= "table" then return nil end
    if entry[field] ~= nil then return entry[field] end
    local data = type(entry.data) == "table" and entry.data or {}
    return data[field]
end

-- The runtime a registry entry kind maps to, or nil when the kind is not a
-- valid worker target.
local function runtime_for_kind(kind: string?): string?
    if kind == "function.lua" then
        return types.WORKER_RUNTIME.FUNC
    end
    if kind == "process.lua" then
        return types.WORKER_RUNTIME.PROC
    end
    return nil
end

local function scheme_for(runtime: string): string
    if runtime == types.WORKER_RUNTIME.PROC then
        return types.WORKER_SCHEME.PROC
    end
    return types.WORKER_SCHEME.FUNC
end

-- parse splits a worker_ref into its runtime + target id. When required is false
-- and the ref is empty, returns (nil, nil) so an optional ref is not an error.
function worker.parse(raw: string?, required: boolean?): (Binding?, error?)
    local input = trim(raw)
    if input == "" then
        if required then
            return nil, (errors.new({ message = "worker_ref is required (use func://<id> or proc://<id>)", kind = errors.INVALID }) :: error)
        end
        return nil, nil
    end

    local runtime = types.WORKER_RUNTIME.FUNC
    local target_id = input
    if string.sub(input, 1, 7) == types.WORKER_SCHEME.FUNC then
        runtime = types.WORKER_RUNTIME.FUNC
        target_id = trim(string.sub(input, 8))
    elseif string.sub(input, 1, 7) == types.WORKER_SCHEME.PROC then
        runtime = types.WORKER_RUNTIME.PROC
        target_id = trim(string.sub(input, 8))
    elseif string.find(input, "://", 1, true) then
        return nil, (errors.new({ message = "worker_ref scheme must be func:// or proc://", kind = errors.INVALID }) :: error)
    else
        return nil, (errors.new({ message = "worker_ref must use func:// or proc:// scheme", kind = errors.INVALID }) :: error)
    end

    if target_id == "" then
        return nil, (errors.new({ message = "worker_ref is missing target id", kind = errors.INVALID }) :: error)
    end
    if #target_id > types.WORKER_ID_MAX_LEN then
        return nil, (errors.new({ message = "worker id is too long (max " .. tostring(types.WORKER_ID_MAX_LEN) .. ")", kind = errors.INVALID }) :: error)
    end
    local canonical = scheme_for(runtime) .. target_id
    if #canonical > types.WORKER_REF_MAX_LEN then
        return nil, (errors.new({ message = "worker_ref is too long (max " .. tostring(types.WORKER_REF_MAX_LEN) .. ")", kind = errors.INVALID }) :: error)
    end

    return { worker_ref = canonical, worker_runtime = runtime, target_id = target_id }, nil
end

-- A projection may invoke only an explicitly declared worker without a private
-- or configured security frame. Recheck on dispatch as registry declarations
-- can change after a cursor was registered.
function worker.validate(binding: table, system_identity: boolean?): (Binding?, error?)
    local target_id = tostring(binding.target_id)
    local declared_runtime = tostring(binding.worker_runtime)
    local entry, entry_err = registry.get(target_id)
    if entry_err then return nil, entry_err end
    if not entry then
        return nil, (errors.new({ message = "worker_ref target not found: " .. target_id, kind = errors.NOT_FOUND }) :: error)
    end

    local kind = entry_kind(entry)
    local expected = runtime_for_kind(kind)
    if not expected then
        return nil, (errors.new({ message = "worker_ref target kind is unsupported: " .. tostring(kind or "unknown"), kind = errors.INVALID }) :: error)
    end
    if expected ~= declared_runtime then
        return nil, (errors.new({
            message = "worker_ref runtime mismatch for '" .. target_id .. "': entry kind '" .. tostring(kind) .. "' requires " .. scheme_for(expected),
            kind = errors.INVALID,
        }) :: error)
    end
    local meta = entry_field(entry, "meta")
    if type(meta) ~= "table" or meta.type ~= "projection.worker" then
        return nil, (errors.new({ message = "worker_ref target is not a declared projection worker: " .. target_id,
            kind = errors.INVALID }) :: error)
    end
    local configured_security = entry_field(entry, "security")
    if (meta.private == true and system_identity ~= true)
        or (type(configured_security) == "table" and next(configured_security) ~= nil) then
        return nil, (errors.new({ message = "private or scoped projection worker is not allowed: " .. target_id,
            kind = errors.PERMISSION_DENIED }) :: error)
    end
    if expected == types.WORKER_RUNTIME.PROC and PROC_BLOCKED[target_id] then
        return nil, (errors.new({ message = PROC_BLOCKED[target_id], kind = errors.INVALID }) :: error)
    end

    return { worker_ref = scheme_for(expected) .. target_id, worker_runtime = expected, target_id = target_id }, nil
end

-- Optional notification worker is declared on the fold worker, never supplied
-- by cursor config or returned data. It uses the same admission and owner frame.
function worker.post_commit_binding(binding: table): (table?, error?)
    local entry, entry_err = registry.get(tostring(binding.target_id))
    if entry_err then return nil, entry_err end
    if not entry then
        return nil, (errors.new({ message = "projection worker declaration unavailable", kind = errors.NOT_FOUND }) :: error)
    end
    local meta = entry_field(entry, "meta")
    local ref = type(meta) == "table" and meta.post_commit_ref or nil
    if ref == nil then return nil, nil end
    if type(ref) ~= "string" or trim(ref) == "" then
        return nil, (errors.new({ message = "post_commit_ref must be a func:// worker ref", kind = errors.INVALID }) :: error)
    end
    local parsed, parse_err = worker.parse(ref, true)
    if parse_err or not parsed then return nil, parse_err end
    if parsed.worker_runtime ~= types.WORKER_RUNTIME.FUNC then
        return nil, (errors.new({ message = "post_commit_ref must use func://", kind = errors.INVALID }) :: error)
    end
    local admitted, admit_err = worker.validate(parsed, binding.system_identity == true)
    if admit_err or not admitted then return nil, admit_err end
    admitted.actor_id = binding.actor_id
    admitted.actor_context = binding.actor_context
    admitted.system_identity = binding.system_identity
    return admitted, nil
end

-- is_blocked_daemon reports whether a proc target is a banned daemon. Catch-up
-- uses this to distinguish a permanent config error (invalidate the projection)
-- from a transient validation failure (retry).
function worker.is_blocked_daemon(target_id: string): boolean
    return PROC_BLOCKED[target_id] ~= nil
end

-- query_event_rows fetches the contiguous [from_seq, to_seq] slice of a thread's
-- events, capped at limit, for a prefetch worker. The external_* envelope fields
-- ride along so a worker can route an event to the right per-source handler. body
-- is stored as a JSON string; it is decoded to a table here so a worker folds the
-- structured event without re-decoding the storage encoding.
function worker.query_event_rows(db_or_tx: Executor, thread_id: string, from_seq: number, to_seq: number, limit: number, event_types: { string }?): (table[]?, error?)
    local query = sql.builder.select(
        "id", "seq", "type", "role", "body", "created_at",
        "external_source", "external_id", "external_version",
        "trace_id", "run_id", "caused_by_event_id", "correlation_key"
    )
        :from("kickside_event")
        :where(sql.builder.expr("thread_id = ?", thread_id))
        :where(sql.builder.expr("seq >= ?", from_seq))
        :where(sql.builder.expr("seq <= ?", to_seq))
    if type(event_types) == "table" and #event_types > 0 then
        local marks: { string } = table.create(#event_types, 0)
        for i = 1, #event_types do marks[i] = "?" end
        query = query:where("type IN (" .. table.concat(marks, ",") .. ")", unpack(event_types))
    end
    local rows, err = query
        :order_by("seq ASC")
        :limit(limit)
        :run_with(db_or_tx)
        :query()
    if err then
        return nil, errors.wrap(err, "failed to fetch events for catchup")
    end
    for _, row in ipairs(rows or {} :: table[]) do
        local decoded, decode_err = persisted_json.decode_table(row.body, "kickside_event.body")
        if decode_err then return nil, decode_err end
        row.body = decoded
        trace_context.attach_to_event(row :: table)
    end
    return rows or {}, nil
end

-- normalize_result coerces a worker's return into a table. A worker may return a
-- table directly or a JSON object string; anything else is an error.
local function normalize_result(result: any): (table?, error?)
    if result == nil then
        return {}, nil
    end
    if type(result) == "table" then
        return result, nil
    end
    if type(result) == "string" then
        local decoded, decode_err = json.decode(result)
        if decode_err then
            return nil, errors.wrap(decode_err, "projection worker returned invalid JSON")
        end
        if type(decoded) ~= "table" then
            return nil, (errors.new({ message = "projection worker JSON output must be an object", kind = errors.INTERNAL }) :: error)
        end
        return decoded, nil
    end
    return nil, (errors.new({ message = "projection worker returned unsupported type: " .. type(result), kind = errors.INTERNAL }) :: error)
end

-- The trusted owner entry that resolves a projection's stored identity at each tick.
worker.TICK_OWNER = "kickside.core.projections:tick"

-- Resolve the projection's stored v2 identity live for this tick (IDENTITY-1 §2:
-- every projection invocation resolves), so the worker runs as the principal
-- that registered it under that principal's current authority. A stored row
-- that is not valid v2 or no longer resolves returns its typed error unchanged;
-- nothing falls back to the runner. A binding with no stored identity is a
-- system projection and runs in the runner's own framework context. Returns
-- (actor?, scope?, err?).
local function resolve_binding_identity(binding: table): (any, any, error?)
    if type(binding.actor_id) ~= "string" or (binding.actor_id :: string) == "" then
        return nil, nil, nil
    end
    local identity, row_err = execution_identity.from_row(binding.actor_id, binding.actor_context)
    if row_err or not identity then return nil, nil, row_err end
    local resolved, resolve_err = execution_identity.resolve(identity, {
        deferred_owner = worker.TICK_OWNER,
        execution_root = (identity :: any).component_id,
    })
    if resolve_err or not resolved then return nil, nil, resolve_err end
    return (resolved :: any).actor, (resolved :: any).scope, nil
end
worker.resolve_binding_identity = resolve_binding_identity

local function executor_response(field: string, value: any, cause: error?): (any, error?)
    if cause then return nil, errors.wrap(cause, "projection worker executor " .. field .. " refused") end
    if not value then
        return nil, errors.new({kind = errors.INTERNAL, message = "projection worker executor returns no result: " .. field,
            retryable = false, details = {code = "projection_worker_executor_response", field = field}})
    end
    return value, nil
end

-- run is the inline tick path: it invokes a func:// worker synchronously under the
-- projection's resolved owner identity and returns the worker's normalized
-- table output. The projection job invokes proc:// workers through
-- run_proc_supervised so their execution is bounded and terminable. A proc binding
-- reaching this path is a wiring fault, surfaced as a hard error rather than run
-- unsupervised.
function worker.run(binding: table, worker_input: table): (table?, error?)
    local target_id = tostring(binding.target_id)
    local runtime = tostring(binding.worker_runtime)
    local worker_ref = tostring(binding.worker_ref)

    if runtime ~= types.WORKER_RUNTIME.FUNC then
        if runtime == types.WORKER_RUNTIME.PROC then
            return nil, (errors.new({ message = "proc:// projection worker must run through run_proc_supervised, not the inline worker.run (" .. worker_ref .. ")", kind = errors.INVALID }) :: error)
        end
        return nil, (errors.new({ message = "unsupported worker runtime: " .. runtime, kind = errors.INVALID }) :: error)
    end

    local validated, validate_err = worker.validate(binding, binding.system_identity == true)
    if validate_err or not validated then return nil, validate_err end

    local actor, scope, ident_err = resolve_binding_identity(binding)
    if ident_err then
        return nil, ident_err
    end

    local executor: any = funcs.new()
    local executor_err: error? = nil
    if actor then
        executor, executor_err = executor_response("actor", executor:with_actor(actor))
        if executor_err then return nil, executor_err end
        executor, executor_err = executor_response("scope", executor:with_scope(scope))
        if executor_err then return nil, executor_err end
    end
    executor, executor_err = executor_response("options", executor:with_options({retry = {max_attempts = 1}}))
    if executor_err then return nil, executor_err end
    local result, run_err = executor:call(target_id, worker_input)

    if run_err then
        return nil, error_envelope.wrap(run_err, "projection worker failed (" .. worker_ref .. ")",
            {reason = worker.WORKER_FAILED})
    end
    return normalize_result(result)
end

local function interpret_proc_exit(result: any): (table?, error?)
    local direct_err = job_types.native_error(result)
    if direct_err then
        return nil, error_envelope.wrap(direct_err, "projection proc worker failed",
            {reason = worker.WORKER_FAILED})
    end
    local payload = result
    if type(result) == "table" then
        local exit_err = (result :: any).error
        if exit_err ~= nil then
            return nil, error_envelope.wrap(exit_err, "projection proc worker failed",
                {reason = worker.WORKER_FAILED})
        end
        payload = (result :: any).value
    end
    if type(payload) == "table" and payload.ok == false then
        local native, decode_err = job_types.error_from_data(payload.error_native)
        if decode_err then return nil, decode_err end
        if not native then
            return nil, errors.new({kind = errors.INVALID, retryable = false,
                message = "projection proc worker failure requires error_native",
                details = {code = "projection_proc_error_missing"}})
        end
        return nil, error_envelope.wrap(native, "projection proc worker failed",
            {reason = worker.WORKER_FAILED})
    end
    return normalize_result(payload)
end

local function admit_process(actor: any, target_id: string, host: string): error?
    local capabilities = {
        {"process.context", "context"},
        {"process.spawn", target_id},
        {"process.spawn.monitored", target_id},
        {"process.spawn.linked", target_id},
        {"process.host", host},
    }
    if actor then capabilities[#capabilities + 1] = {"process.security", "security"} end
    local attributes = {pid = tostring(process.pid())}
    for _, capability in ipairs(capabilities) do
        if not security.can(capability[1], capability[2], attributes) then
            return errors.new({kind = errors.PERMISSION_DENIED, retryable = false,
                message = "projection process authority is denied",
                details = {code = "projection_process_authority", action = capability[1], resource = capability[2]}})
        end
    end
    return nil
end

-- Options run_proc_supervised accepts. The containing jobs execution owns
-- committed revocation and lease expiry; this child owns its hard deadline.
type SupervisedOpts = {
    proc_host: string?,
}

-- run_proc_supervised runs a proc:// projection worker as a MONITORED child under
-- the projection's bounded owner identity, supervised by the shared proc loop. A
-- worker that exceeds max_execution_ms or whose owning job process is cancelled
-- is terminated — process.terminate cancels the child's context, aborting its
-- in-flight embed/LLM call — and dispatch records the failure for retry.
-- max_execution_ms bounds the entire execution, including a progressing worker. On
-- a clean exit the child's return value is normalized to the worker's table output.
function worker.run_proc_supervised(binding: table, worker_input: table, opts: SupervisedOpts?): (table?, error?)
    local options = type(opts) == "table" and (opts :: SupervisedOpts) or ({} :: SupervisedOpts)
    local worker_ref = tostring(binding.worker_ref)
    if tostring(binding.worker_runtime) ~= types.WORKER_RUNTIME.PROC then
        return nil, (errors.new({ message = "run_proc_supervised requires a proc:// binding (" .. worker_ref .. ")", kind = errors.INVALID }) :: error)
    end
    local validated, validate_err = worker.validate(binding, binding.system_identity == true)
    if validate_err or not validated then return nil, validate_err end
    local target_id = tostring(binding.target_id)
    local host = trim(options.proc_host)
    if host == "" then
        return nil, (errors.new({ message = "proc:// projection worker requires a process host", kind = errors.INVALID }) :: error)
    end
    local actor, scope, ident_err = resolve_binding_identity(binding)
    if ident_err then
        return nil, ident_err
    end

    local pol, pol_err = projection_policy.policy()
    if pol_err or not pol then return nil, pol_err end
    local max_execution_ms = pol.proc_max_execution_ms
    local child_pid = ""
    local events_ch: any = nil
    local deadline: any = nil
    local hooks = {
        spawn = function(): (string?, error?)
            local admission_err = admit_process(actor, target_id, host)
            if admission_err then return nil, admission_err end
            local builder = process.with_context({})
            if actor then
                builder = builder:with_actor(actor):with_scope(scope)
            end
            local pid, spawn_err = builder:spawn_linked_monitored(target_id, host, worker_input)
            if spawn_err then
                return nil, errors.wrap(spawn_err, "projection proc spawn failed (" .. worker_ref .. ")")
            end
            if not pid then
                return nil, (errors.new({ message = "projection proc spawn failed (" .. worker_ref .. "): " .. tostring(spawn_err), kind = errors.INTERNAL }) :: error)
            end
            child_pid = tostring(pid)
            events_ch = process.events()
            deadline = time.now():add(max_execution_ms * time.MILLISECOND)
            return child_pid, nil
        end,
        terminate = function(pid: string): ()
            process.terminate(pid)
        end,
        wait = function(): table
            return proc_supervisor.wait_once(events_ch, deadline, child_pid)
        end,
        wait_termination = function(grace_deadline: any): table
            return proc_supervisor.wait_once(events_ch, nil, child_pid, nil, nil, nil, grace_deadline)
        end,
    }

    local output, run_err = proc_supervisor.run(hooks, {
        interpret_exit = interpret_proc_exit,
        crash_message = "projection proc worker crashed: ",
        timeout_message = PROC_TIMEOUT_MARKER,
        cancel_message = "projection runner shutting down",
        lease_lost_message = "lease lost: projection proc worker no longer holds the fence",
    })
    if run_err then
        return nil, run_err
    end
    return output, nil
end

return worker
