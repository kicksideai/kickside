-- jobs-owned entity shapes and invariant vocabulary. These are
-- component-private to the jobs slice. Shared engine entities (Thread, Event,
-- Projection) and access masks live in kickside.core:types and are referenced
-- through that import where a job touches them.

local M = {}

-- A durable unit of work in the leased queue. payload/idempotency columns are
-- stored as text/JSON; timestamps are dialect-formatted strings.
type Job = {
    id: string,
    thread_id: string?,
    job_type: string,
    worker_ref: string?,
    concurrency_key: string?,
    payload: string,
    status: string,
    priority: integer,
    attempts: integer,
    -- Attempt bound of a one-shot job; a slot is not bounded by it.
    max_attempts: integer,
    queue_tier: string,
    idempotency_key: string?,
    last_error: string?,
    lease_token: string?,
    lease_until: string?,
    heartbeat_at: string?,
    generation: integer,
    finished_at: string?,
    scheduled_at: string?,
    created_at: string,
    updated_at: string,
}

-- One execution attempt of a job, written to kickside_job_run as run history.
type JobRun = {
    id: string,
    job_id: string,
    thread_id: string?,
    job_type: string,
    attempt_no: integer,
    worker_pid: string?,
    lease_token: string?,
    status: string,
    started_at: string,
    finished_at: string?,
    duration_ms: integer?,
    error_text: string?,
    result_json: string,
    actions_json: string,
    created_at: string,
    updated_at: string,
}

M.Job = Job
M.JobRun = JobRun

-- Job lifecycle. pending -> running (claimed) -> done | dead | cancelled. A
-- failed one-shot job returns to pending for another attempt until its attempts
-- reach max_attempts, then dead; a deterministic failure is dead at once. A slot
-- (reusable job) lives as long as its owner and never dies by failure: a
-- deterministic failure parks it until a wake, and an infrastructure failure
-- retries it with backoff and no terminal limit, so max_attempts does not bound
-- a slot. The slot's owner records and surfaces its failure state.
M.JOB_STATE = {
    PENDING = "pending",
    RUNNING = "running",
    DONE = "done",
    DEAD = "dead",
    CANCELLED = "cancelled",
}

-- Error kinds a retry cannot change. A failure of one of these kinds is
-- deterministic. Other failures retain infrastructure retries independently
-- of invocation retry policy.
local DETERMINISTIC_KINDS: { [string]: boolean } = {
    [errors.INVALID] = true,
    [errors.PERMISSION_DENIED] = true,
    [errors.NOT_FOUND] = true,
    [errors.ALREADY_EXISTS] = true,
}

local NATIVE_ERROR_KINDS: { [string]: boolean } = {
    [errors.NOT_FOUND] = true,
    [errors.ALREADY_EXISTS] = true,
    [errors.INVALID] = true,
    [errors.PERMISSION_DENIED] = true,
    [errors.UNAVAILABLE] = true,
    [errors.INTERNAL] = true,
    [errors.CANCELED] = true,
    [errors.CONFLICT] = true,
    [errors.TIMEOUT] = true,
    [errors.RATE_LIMITED] = true,
    [errors.UNKNOWN] = true,
}
function M.is_deterministic_kind(kind: any): boolean
    return type(kind) == "string" and DETERMINISTIC_KINDS[kind] == true
end

-- Dispatch tiers share capacity through policy fairness.shares; unused capacity
-- serves the oldest due work. Single-row claims honor their preferred tier.
M.QUEUE_TIER = {
    LIVE = "live",
    BACKFILL = "backfill",
    MAINTENANCE = "maintenance",
}

-- A job type's class, declared on its worker entry as meta.job_class. Other
-- jobs wait on an awaited job, so the pool reserves worker slots that only
-- awaited jobs may claim (policy worker.awaited_slots).
M.JOB_CLASS_META = "meta.job_class"
M.JOB_CLASS = {
    AWAITED = "awaited",
}

-- Run-history vocabulary. run_status derives the terminal set from these values.
-- skipped remains a supported terminal value for existing history; current
-- dispatch records success, failed or lease_lost, and completion records
-- completed, failed or parked. Finished history exits through age retention.
M.RUN_STATE = {
    RUNNING = "running",
    SUCCESS = "success",
    FAILED = "failed",
    LEASE_LOST = "lease_lost",
    SKIPPED = "skipped",
    COMPLETED = "completed",
    PARKED = "parked",
}

-- Optional generic job worker URI. A job with worker_ref is executed by the
-- core job engine under the worker frame; the target resolves the execution
-- identity held by its own record.
M.WORKER_SCHEME = {
    FUNC = "func://",
    PROC = "proc://",
}

M.WORKER_RUNTIME = {
    FUNC = "func",
    PROC = "proc",
}

-- Reference syntax is shared by dispatch and declaration lookup. Target kind
-- validation remains with dispatch; callers retain the original stored URI.
function M.worker_reference(raw: any): (table?, error?)
    if type(raw) ~= "string" then return nil, nil end
    local reference = raw:gsub("^%s*(.-)%s*$", "%1")
    if reference == "" then return nil, nil end
    local runtime: string? = nil
    local target = reference
    if reference:sub(1, #M.WORKER_SCHEME.FUNC) == M.WORKER_SCHEME.FUNC then
        runtime = M.WORKER_RUNTIME.FUNC
        target = reference:sub(#M.WORKER_SCHEME.FUNC + 1):gsub("^%s*(.-)%s*$", "%1")
    elseif reference:sub(1, #M.WORKER_SCHEME.PROC) == M.WORKER_SCHEME.PROC then
        runtime = M.WORKER_RUNTIME.PROC
        target = reference:sub(#M.WORKER_SCHEME.PROC + 1):gsub("^%s*(.-)%s*$", "%1")
    end
    if target == "" then
        return nil, errors.new({message = "job worker_ref target is required", kind = errors.INVALID})
    end
    return {worker_ref = reference, worker_runtime = runtime, target_id = target}, nil
end

-- The published marker remains available; Jobs control flow uses ERROR_CODE.
M.LEASE_LOST_MARKER = "lease lost"

M.ERROR_CODE = {
    LEASE_LOST = "LEASE_LOST",
}

function M.lease_lost_error(message: string): error
    return (errors.new({
        message = message,
        kind = errors.CONFLICT,
        retryable = false,
        details = { code = M.ERROR_CODE.LEASE_LOST },
    }) :: error)
end

function M.native_error(value: any): error?
    if type(value) ~= "userdata" then return nil end
    for kind in pairs(NATIVE_ERROR_KINDS) do
        if errors.is(value, kind) then return value :: error end
    end
    return nil
end

function M.native_kind(value: any): string?
    if type(value) ~= "string" then return nil end
    for kind in pairs(NATIVE_ERROR_KINDS) do
        if string.lower(value) == string.lower(kind) then return kind end
    end
    return nil
end

function M.is_lease_lost_error(err: any): boolean
    if not M.native_error(err) or not errors.is(err, errors.CONFLICT) then
        return false
    end
    local details = (err :: error):details()
    return type(details) == "table" and details.code == M.ERROR_CODE.LEASE_LOST
end

-- Data-only process results preserve every native field in this envelope.
function M.error_to_data(err: error): table
    return {
        kind = err:kind(),
        message = err:message(),
        retryable = err:retryable(),
        details = err:details(),
    }
end

function M.error_with_retryable(err: error, retryable: boolean?): error
    return (errors.new({
        kind = err:kind(),
        message = err:message(),
        retryable = retryable,
        details = err:details(),
    }) :: error)
end

function M.error_from_data(data: any): (error?, error?)
    if data == nil then return nil, nil end
    if type(data) ~= "table" then
        return nil, (errors.new({ message = "process result error_native must be a table", kind = errors.INVALID }) :: error)
    end
    local value = data :: any
    if type(value.kind) ~= "string" or type(value.message) ~= "string"
        or (value.retryable ~= nil and type(value.retryable) ~= "boolean")
        or (value.details ~= nil and type(value.details) ~= "table") then
        return nil, (errors.new({ message = "process result error_native has invalid fields", kind = errors.INVALID }) :: error)
    end
    local kind = value.kind == "" and errors.UNKNOWN or value.kind
    if not NATIVE_ERROR_KINDS[kind] then
        return nil, (errors.new({ message = "process result error_native has an unknown kind", kind = errors.INVALID }) :: error)
    end
    return (errors.new({
        kind = kind,
        message = value.message,
        retryable = value.retryable,
        details = value.details,
    }) :: error), nil
end

M.TERMINATION_PENDING_PREFIX = "termination_pending:"

-- details.reason of a claim refusal the pool distinguishes: an occupied worker
-- marker contradicts the slot's idle notice.
M.CLAIM_REFUSAL = {
    WORKER_MARKER_OCCUPIED = "worker_marker_occupied",
}

-- Worker-pool sizing. The supervised worker process is the pool root: it keeps
-- one linked claim-loop child per slot (one on sqlite's single writer) and
-- respawns each exited slot.
M.MIN_WORKERS = 1
M.MAX_WORKERS = 256

-- Registry id of the claim-loop process the pool root spawns per slot.
M.LOOP_PROCESS_ID = "kickside.core.jobs.service:loop"

-- Grace period a loop child gets to finish its current job on pool cancel.
M.LOOP_CANCEL_GRACE = "5s"

-- Minimum lifetime of a loop child before its replacement starts at once; a
-- child that exits sooner is replaced after the rest of this delay.
M.LOOP_RESPAWN_DELAY_MS = 1000

return M
