-- Job dispatch, process binding and supervised child termination.

local sql = require("sql")
local funcs = require("funcs")
local registry = require("registry")
local logger = require("logger")
local time = require("time")
local process = require("process")
local security = require("security")

local job_types = require("job_types")
local cfg = require("config")
local execution_policy = require("execution_policy")
local error_envelope = require("error_envelope")
local lifecycle = require("lifecycle")
local wake = require("wake")
local proc_supervisor = require("proc_supervisor")

local worker = {}

-- The policy bounding a worker_ref target until it binds its owner's identity.
local UNATTRIBUTED_POLICY = "kickside.core.jobs.security:unattributed_execution"
local PROC_BLOCKED = {
    ["kickside.core.jobs.service:worker"] = "job worker is a daemon and cannot be used as a job worker_ref",
    ["kickside.core.jobs.service:loop"] = "job worker loop is a daemon and cannot be used as a job worker_ref",
    ["kickside.core.jobs.service:job_child"] = "job execution child cannot be used as a job worker_ref",
}

local function trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

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

local function runtime_for_kind(kind: string?): string?
    if kind == "function.lua" then
        return job_types.WORKER_RUNTIME.FUNC
    end
    if kind == "process.lua" then
        return job_types.WORKER_RUNTIME.PROC
    end
    return nil
end

local function parse_worker_ref(raw: any): (table?, error?)
    local parsed, parse_err = job_types.worker_reference(raw)
    if parse_err or not parsed then return nil, parse_err end
    local worker_ref, runtime, target_id = parsed.worker_ref, parsed.worker_runtime, parsed.target_id
    if PROC_BLOCKED[target_id] ~= nil then
        return nil, (errors.new({ message = PROC_BLOCKED[target_id], kind = errors.INVALID }) :: error)
    end

    local entry, reg_err = registry.get(target_id)
    if reg_err then return nil, errors.wrap(reg_err, "job worker_ref target lookup failed: " .. target_id) end
    if not entry then
        return nil, (errors.new({ message = "job worker_ref target not found: " .. target_id, kind = errors.INVALID }) :: error)
    end
    local kind = entry_kind(entry)
    local actual_runtime = runtime_for_kind(kind)
    if not actual_runtime then
        return nil, (errors.new({ message = "job worker_ref target kind is not executable: " .. tostring(kind), kind = errors.INVALID }) :: error)
    end
    if runtime ~= nil and actual_runtime ~= runtime then
        return nil, (errors.new({ message = "job worker_ref scheme does not match target kind: " .. worker_ref .. " kind=" .. tostring(kind), kind = errors.INVALID }) :: error)
    end
    return { worker_ref = worker_ref, worker_runtime = actual_runtime, target_id = target_id }, nil
end
worker.parse_worker_ref = parse_worker_ref

local function normalize_worker_output(value: any): table
    if type(value) == "table" then
        return value :: table
    end
    if value == nil then
        return {}
    end
    return { value = value }
end

-- Build the standard worker input (job descriptor + decoded payload) and the
-- execution context shared by both the func and proc dispatch paths.
local function build_worker_input(job: table): ({ [string]: any }?, { [string]: any }?, error?)
    local payload, decode_err = lifecycle.decode_payload(job.payload)
    if decode_err then return nil, nil, decode_err end
    local attempt_no = math.floor(tonumber(job.attempts) or 1)
    local max_attempts = math.max(1, math.floor(tonumber(job.max_attempts) or 1))
    -- A slot retries infrastructure failures without a terminal limit, so no
    -- slot attempt is final; a one-shot job's last attempt is its max_attempts.
    local slot = job.slot == true or tonumber(job.slot) == 1
    local input = {
        job = {
            id = tostring(job.id or ""),
            thread_id = tostring(job.thread_id or ""),
            job_type = tostring(job.job_type or ""),
            attempt_no = attempt_no,
            max_attempts = max_attempts,
            is_final_attempt = not slot and attempt_no >= max_attempts,
            lease_token = tostring(job.lease_token or ""),
            execution_seq = tonumber(job.execution_seq),
            lease_until = job.lease_until,
            -- The RFC3339 instant the execution ceiling (proc.max_execution) ends.
            deadline = job.execution_deadline,
        },
        payload = payload,
        trace_context = type(payload.trace_context) == "table" and payload.trace_context or nil,
    }
    local context = {
        job_id = input.job.id,
        thread_id = input.job.thread_id,
        job_type = input.job.job_type,
        execution_seq = input.job.execution_seq,
        lease_until = input.job.lease_until,
    }
    return input, context, nil
end
worker.build_worker_input = build_worker_input

-- The scope a worker_ref target starts in: the worker frame's scope with the
-- unattributed-execution policy added. A target that binds its owner's
-- execution identity replaces it with the owner's scope.
local function unattributed_scope(): (any?, error?)
    local scope = security.scope()
    if not scope then
        return nil, (errors.new({ message = "job dispatch requires a security scope", kind = errors.INTERNAL }) :: error)
    end
    local policy, policy_err = security.policy(UNATTRIBUTED_POLICY)
    if policy_err then return nil, errors.wrap(policy_err, "job dispatch policy unavailable") end
    if not policy then
        return nil, (errors.new({ message = "job dispatch policy unavailable", kind = errors.INTERNAL, retryable = false }) :: error)
    end
    return (scope :: any):with(policy), nil
end
worker.unattributed_scope = unattributed_scope

-- Per-job hard execution ceiling in milliseconds: a payload override, else the
-- policy's proc.max_execution. Used to bound a supervised proc:// job's
-- wall-clock time.
local function resolve_max_execution_ms(job: table, policy: any): (integer?, error?)
    local payload, decode_err = lifecycle.decode_payload(job.payload)
    if decode_err then return nil, decode_err end
    local override = tonumber(payload.max_execution_ms)
    if override and override >= 1 then
        return math.floor(override) :: integer, nil
    end
    return policy.proc_max_execution_ms :: integer, nil
end
worker.resolve_max_execution_ms = resolve_max_execution_ms

-- Dispatch a func:// worker_ref. proc:// jobs do not reach here: they are spawned
-- non-blocking and supervised by run_supervised_proc so the engine holds a pid it
-- can terminate, which this synchronous funcs.call could never expose.
local function run_bound_worker(job: table, binding: table): (table?, error?)
    local target_id = trim(binding.target_id)
    if target_id == "" then
        return nil, (errors.new({ message = "job worker_ref target is required", kind = errors.INVALID }) :: error)
    end
    if binding.worker_runtime ~= job_types.WORKER_RUNTIME.FUNC then
        return nil, (errors.new({ message = "proc:// job worker must run through the supervised path", kind = errors.INTERNAL }) :: error)
    end

    local input, context, input_err = build_worker_input(job)
    if input_err then return nil, input_err end
    local scope, scope_err = unattributed_scope()
    if scope_err then return nil, scope_err end
    local executor, executor_err = funcs.new():with_context(context):with_scope(scope):with_options({
        retry = { max_attempts = 1 },
    })
    if executor_err then return nil, errors.wrap(executor_err, "job dispatch scope refused") end
    if not executor then return nil, (errors.new({ message = "job dispatch scope returns no executor", kind = errors.INTERNAL, retryable = false }) :: error) end
    local result, run_err = executor:call(target_id, input)
    if run_err then
        -- Jobs schedules durable retries; a function worker invocation runs once.
        local failure = error_envelope.wrap(run_err,
            "job worker_ref failed (" .. tostring(binding.worker_ref) .. ")", {})
        return nil, job_types.error_with_retryable(failure, false)
    end
    local output = normalize_worker_output(result)
    local job_error = trim(output.job_error)
    if job_error ~= "" then
        local kind = output.failure_class == "deterministic" and errors.INVALID or errors.INTERNAL
        return output, (errors.new({ message = job_error, kind = kind }) :: error)
    end
    return output, nil
end

-- Error text a supervised proc surfaces when its hard wall-clock ceiling elapses.
-- It is a plain failure (not a lost lease): fail_job runs normally and the job
-- retries through the usual backoff -> dead path.
local PROC_TIMEOUT_MARKER = "job exceeded max_execution_ms"
worker.PROC_TIMEOUT_MARKER = PROC_TIMEOUT_MARKER

-- A proc:// worker uses the native error transport in its status envelope. The
-- runtime can also report a native failure directly in the monitored EXIT.
local function interpret_proc_result(result: any): (table?, error?)
    local direct_err = job_types.native_error(result)
    if direct_err then return nil, errors.wrap(direct_err, "proc worker failed") end
    local payload = result
    if type(result) == "table" then
        local exit_err = (result :: any).error
        if exit_err ~= nil then
            local native = job_types.native_error(exit_err)
            if native then return nil, errors.wrap(native, "proc worker failed") end
            return nil, (errors.new({ message = "proc worker EXIT error is not native", kind = errors.INVALID }) :: error)
        end
        payload = (result :: any).value or result
    end
    local payload_err = job_types.native_error(payload)
    if payload_err then return nil, errors.wrap(payload_err, "proc worker failed") end
    if type(payload) ~= "table" then
        return nil, (errors.new({ message = "proc worker returned an invalid status envelope", kind = errors.INVALID }) :: error)
    end
    local status = payload :: any
    if status.ok == false then
        local native, decode_err = job_types.error_from_data(status.error_native)
        if decode_err then return nil, decode_err end
        if native then return nil, errors.wrap(native, "proc worker failed") end
        return nil, (errors.new({ message = "proc worker failed without native error transport", kind = errors.INVALID }) :: error)
    end
    if status.ok == true then return normalize_worker_output(status.output) end
    return nil, (errors.new({ message = "proc worker returned an invalid status envelope", kind = errors.INVALID }) :: error)
end
worker.interpret_proc_result = interpret_proc_result

-- The proc:// binding for a claimed job, or nil when the job is a wake
-- continuation or a func:// worker_ref. A parse error yields nil so execute_job surfaces it on the
-- ordinary path.
local function proc_binding_for(job: table): table?
    local binding = parse_worker_ref(job.worker_ref)
    if binding and binding.worker_runtime == job_types.WORKER_RUNTIME.PROC then
        return binding
    end
    return nil
end

-- The job-specific outcome wiring the shared supervisor drives: interpret a
-- proc EXIT into (output, err) and map each abnormal end to a job error marker.
local function job_supervise_opts(): table
    return {
        interpret_exit = interpret_proc_result,
        crash_message = "proc worker crashed: ",
        timeout_message = PROC_TIMEOUT_MARKER,
        cancel_message = "job worker shutting down",
        lease_lost_message = "job no longer running under this worker",
        lease_lost_error = job_types.lease_lost_error("job no longer running under this worker"),
    }
end

-- Supervise a spawned proc:// worker until it finishes or must be reaped, through
-- the shared proc_supervisor loop. Drives the injected wait/terminate hooks;
-- build_proc_hooks supplies the live wiring. Returns (output?, err?, control?)
-- where control == "shutdown" asks the worker loop to stop after this attempt.
local function supervise_proc_loop(hooks: table, child_pid: string): (table?, error?, string?)
    return proc_supervisor.supervise_loop(hooks, child_pid, job_supervise_opts())
end
worker.supervise_proc_loop = supervise_proc_loop

-- Live supervision wiring: spawn the worker non-blocking under the worker
-- frame, then wait over process events and its hard max_execution deadline.
-- The outer job supervisor owns committed revocations and the lease deadline.
local function build_proc_hooks(db: sql.DB, dbtype: string, job: table, binding: table, run_id: string?, policy: any): (table?, error?)
    local input, context, input_err = build_worker_input(job)
    if input_err then return nil, input_err end
    local max_execution_ms, duration_err = resolve_max_execution_ms(job, policy)
    if duration_err then return nil, duration_err end
    local scope, scope_err = unattributed_scope()
    if scope_err then return nil, scope_err end
    local target_id = tostring(binding.target_id)
    local host = trim(cfg.process_host())
    local child_pid = ""
    local events_ch: any = nil
    local deadline: any = nil

    return {
        spawn = function(): (string?, error?)
            if host == "" then
                return nil, (errors.new({ message = "proc:// job worker requires a process host", kind = errors.INVALID }) :: error)
            end
            local builder = process.with_context(context or {}):with_scope(scope)
            -- Link and monitor the proc target atomically: a separate link after
            -- spawn_monitored races a fast-exiting child (Topology.Link rejects
            -- dead pids), and the link error would discard the monitored EXIT
            -- carrying the proc's typed failure kind. Either spawn fails and no
            -- child exists, or link and monitor both hold before the child runs,
            -- so the terminal classification always comes from its EXIT result.
            -- The supervising job child owns the target, so terminating the
            -- child reaps the target and a crashed loop cannot orphan it into
            -- a concurrent retry.
            local pid, err = builder:spawn_linked_monitored(target_id, host, input)
            if err then return nil, errors.wrap(err, "proc spawn failed (" .. tostring(binding.worker_ref) .. ")") end
            if not pid then return nil, (errors.new({ message = "proc spawn returns no pid", kind = errors.INTERNAL, retryable = false }) :: error) end
            child_pid = tostring(pid)
            events_ch = process.events()
            deadline = time.now():add((max_execution_ms :: integer) * time.MILLISECOND)
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
    }, nil
end

-- Run a proc:// job under supervision: spawn the child and
-- drive the supervise loop. hooks is injectable for tests; nil builds the live
-- wiring. Returns (output?, err?, control?).
local function run_supervised_proc(db: sql.DB?, dbtype: string, job: table, binding: table, hooks: table?, run_id: string?): (table?, error?, string?)
    if not hooks then
        if not db then
            return nil, (errors.new({ message = "db is required for live proc supervision", kind = errors.INTERNAL }) :: error), nil
        end
        local policy, policy_err = execution_policy.read(job)
        if policy_err then return nil, policy_err, nil end
        local built, build_err = build_proc_hooks(db, dbtype, job, binding, run_id, policy)
        if build_err then return nil, build_err, nil end
        hooks = built
    end
    local spawn = hooks.spawn
    if type(spawn) ~= "function" then
        return nil, (errors.new({ message = "proc supervisor requires a spawn hook", kind = errors.INTERNAL }) :: error), nil
    end
    local child_pid, spawn_err = spawn()
    if spawn_err or not child_pid then
        return nil, spawn_err or (errors.new({ message = "proc spawn returned no pid", kind = errors.INTERNAL }) :: error), nil
    end
    return supervise_proc_loop(hooks, tostring(child_pid))
end
worker.run_supervised_proc = run_supervised_proc

-- Dispatch a claimed job: a wake continuation runs in jobs, a worker_ref job
-- runs its target under the worker frame bounded by the unattributed-execution
-- policy (the target loads the execution identity from its own record). An unknown type is skipped, not failed.
local function execute_job(db: sql.DB, dbtype: string, job: table): (table?, error?)
    local job_type = tostring(job.job_type or "")

    if job_type == wake.CONTINUATION_TYPE then
        return wake.continue_job(db, dbtype, job)
    end

    local binding, bind_err = parse_worker_ref(job.worker_ref)
    if bind_err then
        return nil, bind_err
    end
    if binding then
        return run_bound_worker(job, binding)
    end

    logger:warn("job_worker unknown job_type=" .. job_type .. " job=" .. tostring(job.id))
    return { skipped = true, reason = "unknown_job_type", job_type = job_type,
        record = { status = "parked", error = "unknown job type" } }, nil
end
worker.execute_job = execute_job
worker.proc_binding_for = proc_binding_for


return worker
