local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local clock = require("clock")
local job_types = require("job_types")
local cfg = require("config")
local enqueue = require("lifecycle_enqueue")
local row_bytes = require("row_bytes")
local row_mutations = require("row_mutations")
local worker_marker = require("worker_marker")
local lifecycle_cancel = require("lifecycle_cancel")
local proc_supervisor = require("proc_supervisor")
local sql_boundary = require("sql_boundary")

local lifecycle = {}

local function response_error(field: string): error
    return errors.new({message = "job run response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_run_response", field = field}})
end
type Executor = sql.DB | sql.Transaction

-- Format a Time in the dialect's textual shape (microsecond, UTC) via the shared
-- clock so it stays comparable against datetime('now') defaults on either dialect.
local function format_time(dbtype: string, t: any): string
    return tostring(clock.format(t, dbtype))
end
lifecycle.format_time = format_time
local now_string = clock.now
lifecycle.now_string = now_string

local function future_string(dbtype: string, seconds: number): string
    return format_time(dbtype, time.now():add(math.max(0, seconds) * time.SECOND))
end
lifecycle.future_string = future_string

local function timestamp_param(dbtype: string): string
    return dbtype == sql.type.POSTGRES and "CAST(? AS TIMESTAMPTZ)" or "?"
end

local function rows_affected(result: any): integer
    local n = tonumber(result and result.rows_affected) or 0
    n = math.floor(n)
    if n < 0 then
        return 0
    end
    return n
end
lifecycle.rows_affected = rows_affected

local function retry_delay_seconds(attempt_no: number, base_seconds: integer, cap_seconds: integer): integer
    local n = math.max(1, math.floor(tonumber(attempt_no) or 1))
    local exp = math.min(n - 1, 30)
    local delay = math.max(1, math.floor(base_seconds * (2 ^ exp)))
    return math.floor(math.min(delay, math.max(1, cap_seconds)))
end
lifecycle.retry_delay_seconds = retry_delay_seconds

local decode_payload = enqueue.decode_payload
local encode_object = enqueue.encode_object
local encode_part = enqueue.encode_part
lifecycle.normalize_payload = enqueue.normalize_payload
lifecycle.decode_payload = decode_payload

-- Insert a run under its lifetime execution sequence. Retry attempt numbers
-- are diagnostic and may repeat after a slot parks and resumes.
local function start_job_run_tx(db_or_tx: Executor, dbtype: string, job: table, pid: string, attempt_no: integer): (table?, error?)
    local job_id = tostring(job.id or "")
    if job_id == "" then
        return nil, (errors.new({ message = "job.id is required for run history", kind = errors.INVALID }) :: error)
    end
    local now = time.now()
    local execution_seq = math.floor(tonumber(job.execution_seq) or 0)
    if execution_seq < 1 or type(attempt_no) ~= "number" or attempt_no < 1 then
        return nil, (errors.new({ message = "run requires execution_seq and attempt_no >= 1", kind = errors.INVALID }) :: error)
    end
    local owner = { kind = job.owner_kind, id = job.owner_id }
    if type(owner.kind) ~= "string" or owner.kind == ""
        or type(owner.id) ~= "string" or owner.id == "" then
        return nil, (errors.new({ message = "job run requires a durable owner locator",
            kind = errors.INVALID, retryable = false }) :: error)
    end
    local policy, policy_err = cfg.policy()
    if policy_err then return nil, policy_err end
    if type(policy) ~= "table" then return nil, response_error("policy") end
    local run_id = uuid.v7()
    local started_at = tostring(clock.format(now, dbtype))
    local run_row = { id = run_id, job_id = job_id, owner_kind = owner.kind, owner_id = owner.id,
        thread_id = job.thread_id, job_type = tostring(job.job_type or ""), attempt_no = attempt_no,
        execution_seq = execution_seq, worker_pid = pid, lease_token = job.lease_token,
        status = job_types.RUN_STATE.RUNNING, started_at = started_at,
        result_json = "{}", actions_json = "{}", created_at = started_at, updated_at = started_at }
    local size_err = row_bytes.check(run_row, (policy :: any).max_row_bytes,
        owner.kind .. ":" .. owner.id, "start_job_run")
    if size_err then return nil, size_err end
    local statement, params, build_err = sql.builder.insert("kickside_job_run")
        :set_map(run_row):suffix("ON CONFLICT DO NOTHING")
        :placeholder_format(sql.builder.dollar):to_sql()
    if build_err then return nil, errors.wrap(build_err, "job run insert build failed") end
    local inserted, insert_err = db_or_tx:execute(statement, params)
    local count, count_err = sql_boundary.single_row_count(inserted, insert_err, "failed to insert job run", "insert.rows_affected", response_error)
    if count_err then return nil, count_err end
    if count == 1 then
        return { id = run_id, started_at_unix = now:unix() }, nil
    end
    local existing, existing_err = db_or_tx:query("SELECT id,lease_token,status FROM kickside_job_run WHERE job_id=$1 AND execution_seq=$2", { job_id, execution_seq })
    existing, existing_err = sql_boundary.rows(existing, existing_err, "failed to resolve job run conflict", "read", response_error)
    if existing_err then return nil, existing_err end
    local lease_token = tostring(job.lease_token or "")
    local row = existing and existing[1]
    if row and tostring(row.lease_token or "") == lease_token
        and tostring(row.status or "") == job_types.RUN_STATE.RUNNING then
        if type(row.id) ~= "string" or row.id == "" then return nil, response_error("read.id") end
        return { id = row.id, started_at_unix = now:unix() }, nil
    end
    return nil, (errors.new({ message = "run execution sequence already belongs to another lease", kind = errors.CONFLICT }) :: error)
end
local function start_job_run(db_or_tx: Executor, dbtype: string, job: table, pid: string, attempt_no: integer): (table?, error?)
    if type((db_or_tx :: any).db_type) == "function" then
        return start_job_run_tx(db_or_tx, dbtype, job, pid, attempt_no)
    end
    local tx, begin_err = sql_boundary.begin(db_or_tx :: sql.DB, "job run transaction failed", "transaction", response_error)
    if begin_err then return nil, begin_err end
    local result, err = start_job_run_tx(tx, dbtype, job, pid, attempt_no)
    if err then return nil, sql_boundary.rollback(tx, err, "job run rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return nil, errors.wrap(commit_err, "job run commit failed") end
    return result, nil
end
lifecycle.start_job_run = start_job_run

local function finalize_job_run(
    db_or_tx: Executor, dbtype: string, run_ctx: table?,
    status: string, result_payload: any, actions_payload: any, error_text: string?
): error?
    if type(run_ctx) ~= "table" or type(run_ctx.id) ~= "string" then
        return nil
    end
    local result_json, result_err = encode_object(result_payload)
    if result_err then
        return result_err
    end
    local actions_json, actions_err = encode_object(actions_payload)
    if actions_err then
        return actions_err
    end
    local policy, policy_err = cfg.policy()
    if policy_err then return policy_err end
    if type(policy) ~= "table" then return response_error("policy") end
    local started_unix = tonumber(run_ctx.started_at_unix) or time.now():unix()
    local duration_ms = math.max(0, math.floor((time.now():unix() - started_unix) * 1000))
    local finished_at = clock.now(dbtype)
    local size_err = row_bytes.check_update(db_or_tx, "kickside_job_run", run_ctx.id,
        { status = status, finished_at = finished_at, duration_ms = duration_ms,
            error_text = error_text or row_bytes.NULL, result_json = result_json, actions_json = actions_json },
        (policy :: any).max_row_bytes, "finalize_job_run")
    if size_err then return size_err end
    local result, update_err = sql.builder.update("kickside_job_run")
        :set("status", status)
        :set("finished_at", finished_at)
        :set("duration_ms", duration_ms)
        :set("error_text", error_text)
        :set("result_json", result_json)
        :set("actions_json", actions_json)
        :where(sql.builder.eq({ id = run_ctx.id }))
        :run_with(db_or_tx)
        :exec()
    local count, count_err = sql_boundary.single_row_count(result, update_err, "failed to finalize job run", "finalize.rows_affected", response_error)
    if count_err then return count_err end
    if count == 0 then
        return (errors.new({ message = "job run row not found during finalize", kind = errors.NOT_FOUND }) :: error)
    end
    return nil
end
lifecycle.finalize_job_run = finalize_job_run

-- Extend a running job's lease and refresh its heartbeat. Guarded by lease
-- ownership; a zero-row update means the lease was lost.
local function heartbeat_job(db_or_tx: Executor, job: table, dbtype: string): error?
    local lease_token = tostring(job.lease_token or "")
    if lease_token == "" then
        return (errors.new({ message = "missing lease_token for heartbeat", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = cfg.policy()
    if policy_err then return policy_err end
    if type(policy) ~= "table" then return response_error("policy") end
    local heartbeat_at = now_string(dbtype)
    local lease_until = future_string(dbtype, (policy :: any).lease_timeout_seconds)
    local size_err = row_mutations.heartbeat(db_or_tx, job.id, heartbeat_at,
        lease_until, (policy :: any).max_row_bytes)
    if size_err then return size_err end
    local result, err = sql.builder.update("kickside_job")
        :set("heartbeat_at", heartbeat_at)
        :set("lease_until", lease_until)
        :where(sql.builder.eq({ id = job.id, status = job_types.JOB_STATE.RUNNING, lease_token = lease_token }))
        :run_with(db_or_tx)
        :exec()
    local count, count_err = sql_boundary.single_row_count(result, err, "heartbeat update failed", "heartbeat.rows_affected", response_error)
    if count_err then return count_err end
    if count == 0 then
        return job_types.lease_lost_error("lease lost while heartbeating job")
    end
    return nil
end
lifecycle.heartbeat_job = heartbeat_job

-- Complete a fenced execution and atomically combine rearm with wake demand. A
-- reusable slot stays active unless terminal = true closes it: a quiet
-- completion parks it (pending with no schedule) so a later wake finds it
-- instead of stranding it done.
local function complete_in_tx(db_or_tx: Executor, job: table, dbtype: string, opts: table?): error?
    local lease_token = tostring(job.lease_token or "")
    if lease_token == "" then
        return (errors.new({ message = "missing lease_token for complete", kind = errors.INVALID }) :: error)
    end
    local now = now_string(dbtype)
    local policy, policy_err = cfg.policy()
    if policy_err then return policy_err end
    if type(policy) ~= "table" then return response_error("policy") end
    local size_err = row_mutations.complete(db_or_tx, job.id, opts, now,
        (policy :: any).max_row_bytes)
    if size_err then return size_err end
    local next_run_at = opts and opts.next_run_at or nil
    local rearm = type(next_run_at) == "string" and next_run_at ~= ""
    local terminal_flag = (type(opts) == "table" and opts.terminal == true) and 1 or 0
    local pending_when = "(? OR (slot AND (wake_control_pending OR wake_demand_at IS NOT NULL)) OR (slot AND (? = 0)))"
    local ts = timestamp_param(dbtype)
    local update = sql.builder.update("kickside_job")
        :set("status", sql.builder.expr("CASE WHEN " .. pending_when .. " THEN 'pending' ELSE 'done' END", rearm, terminal_flag))
        :set("lease_token", nil)
        :set("lease_until", nil)
        :set("heartbeat_at", nil)
        :set("finished_at", sql.builder.expr("CASE WHEN " .. pending_when .. " THEN NULL ELSE " .. ts .. " END", rearm, terminal_flag, now))
        :set("attempts", sql.builder.expr("CASE WHEN " .. pending_when .. " THEN 0 ELSE attempts END", rearm, terminal_flag))
        :set("scheduled_at", sql.builder.expr("CASE WHEN slot AND (wake_control_pending OR wake_demand_at IS NOT NULL) THEN " .. ts .. " WHEN ? THEN " .. ts .. " ELSE NULL END", now, rearm, next_run_at or now))
        :set("wake_enabled", sql.builder.expr("CASE WHEN wake_control_pending THEN TRUE ELSE wake_enabled END"))
        :set("wake_demand_at", nil)
        :set("wake_control_pending", false)
        :where(sql.builder.eq({ id = job.id, status = job_types.JOB_STATE.RUNNING, lease_token = lease_token }))
        :where("(last_error IS NULL OR last_error <> ?)", job_types.TERMINATION_PENDING_PREFIX .. lease_token)
    local result, err = update:run_with(db_or_tx):exec()
    local count, count_err = sql_boundary.single_row_count(result, err, "complete update failed", "complete.rows_affected", response_error)
    if count_err then return count_err end
    if count == 0 then
        return job_types.lease_lost_error("lease lost while completing job")
    end
    return worker_marker.clear(db_or_tx, job.id)
end

local function complete_job(db: sql.DB, job: table, dbtype: string, opts: table?): error?
    local tx, begin_err = sql_boundary.begin(db, "complete begin failed", "transaction", response_error)
    if begin_err then return begin_err end
    local err = complete_in_tx(tx, job, dbtype, opts)
    if err then return sql_boundary.rollback(tx, err, "complete rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return errors.wrap(commit_err, "complete commit failed") end
    return nil
end
lifecycle.complete_job = complete_job

lifecycle.complete_tx = complete_in_tx

-- Resolve a per-job max_backoff_seconds override from its payload, if present.
local function resolve_max_backoff(job: table): (number?, error?)
    local payload, decode_err = decode_payload(job.payload)
    if decode_err then return nil, decode_err end
    if payload.max_backoff_seconds ~= nil then
        return tonumber(payload.max_backoff_seconds), nil
    end
    return nil, nil
end

-- A failed one-shot job is terminal (dead) on a deterministic failure or once
-- its attempts reach max_attempts; an infrastructure failure below that bound
-- retries with backoff. A slot lives as long as its owner, so a slot never dies
-- here: a deterministic failure parks it and an infrastructure failure retries
-- it without a terminal limit, its last_error and run history showing the
-- failure. A control wake of this lease takes priority over every path.
local function fail_in_tx(db_or_tx: Executor, job: table, dbtype: string, error_text: string?, failure_class: string?): error?
    local lease_token = tostring(job.lease_token or "")
    if lease_token == "" then
        return (errors.new({ message = "missing lease_token for fail", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = cfg.policy()
    if policy_err then return policy_err end
    if type(policy) ~= "table" then return response_error("policy") end
    local attempts = math.floor(tonumber(job.attempts) or 0)
    local now = now_string(dbtype)
    local ts = timestamp_param(dbtype)
    local deterministic = failure_class == "deterministic"
    local retry_at: string? = nil
    if not deterministic then
        local override, decode_err = resolve_max_backoff(job)
        if decode_err then return decode_err end
        local cap = (override and override >= 1) and override or math.floor((policy :: any).retry_max_delay_ms / 1000)
        local base = math.max(1, math.ceil((policy :: any).retry_after_ms / 1000))
        local ceiling = retry_delay_seconds(attempts, base, math.floor(cap) :: integer)
        local delay = math.max(1, math.floor(math.random() * ceiling))
        retry_at = future_string(dbtype, delay)
    end
    local size_err = row_mutations.fail(db_or_tx, job.id, error_text,
        failure_class, now, retry_at, (policy :: any).max_row_bytes)
    if size_err then return size_err end

    -- One guarded update evaluates the row's own control, slot and attempt
    -- values, so a wake that races completion remains visible to it.
    local terminal = "(NOT wake_control_pending AND NOT slot AND "
        .. (deterministic and "1=1" or "attempts >= max_attempts") .. ")"
    local scheduled = deterministic
        and sql.builder.expr("CASE WHEN wake_control_pending THEN " .. ts .. " ELSE NULL END", now)
        or sql.builder.expr("CASE WHEN wake_control_pending THEN " .. ts .. " WHEN " .. terminal
            .. " THEN NULL ELSE " .. ts .. " END", now, retry_at)
    local wake_enabled = deterministic
        and sql.builder.expr("CASE WHEN wake_control_pending THEN TRUE ELSE FALSE END")
        or sql.builder.expr("CASE WHEN wake_control_pending THEN TRUE WHEN " .. terminal
            .. " THEN FALSE ELSE wake_enabled END")
    local result, err = sql.builder.update("kickside_job")
        :set("status", sql.builder.expr("CASE WHEN " .. terminal .. " THEN ? ELSE ? END",
            job_types.JOB_STATE.DEAD, job_types.JOB_STATE.PENDING))
        :set("finished_at", sql.builder.expr("CASE WHEN " .. terminal .. " THEN " .. ts .. " ELSE NULL END", now))
        :set("lease_token", nil)
        :set("lease_until", nil)
        :set("heartbeat_at", nil)
        :set("last_error", error_text)
        :set("scheduled_at", scheduled)
        :set("wake_enabled", wake_enabled)
        :set("attempts", sql.builder.expr("CASE WHEN wake_control_pending THEN 0 ELSE attempts END"))
        :set("wake_demand_at", nil)
        :set("wake_control_pending", false)
        :where(sql.builder.eq({ id = job.id, status = job_types.JOB_STATE.RUNNING, lease_token = lease_token }))
        :run_with(db_or_tx)
        :exec()
    local count, count_err = sql_boundary.single_row_count(result, err, "fail update failed", "fail.rows_affected", response_error)
    if count_err then return count_err end
    if count == 0 then
        return job_types.lease_lost_error("lease lost while failing job")
    end
    return worker_marker.clear(db_or_tx, job.id)
end

local function fail_job(db: sql.DB, job: table, dbtype: string, error_text: string?, failure_class: string?): error?
    local tx, begin_err = sql_boundary.begin(db, "fail begin failed", "transaction", response_error)
    if begin_err then return begin_err end
    local err = fail_in_tx(tx, job, dbtype, error_text, failure_class)
    if err then return sql_boundary.rollback(tx, err, "fail rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return errors.wrap(commit_err, "fail commit failed") end
    return nil
end
lifecycle.fail_job = fail_job

-- Transaction-scoped failure: the owner holds the transaction and Jobs applies
-- the lease-fenced failure inside it.
lifecycle.fail_tx = fail_in_tx

-- Deliver committed execution revocations to their token-qualified owners.
-- When no supervisor is registered, its register-before-read fence guarantees
-- that a late execution will fail validation, so the caller can settle now.
function lifecycle.notify_cancellations(db: sql.DB, dbtype: string, executions: table[]): error?
    for _, execution in ipairs(executions) do
        local sequence = tonumber(execution.execution_seq)
        if sequence then
            local sent, send_err = proc_supervisor.notify(tostring(execution.id),
                tostring(execution.token), sequence, "revoked", nil)
            if send_err then return send_err end
            if not sent then
                local _, finish_err = lifecycle_cancel.finish_cancellation(db, dbtype, execution)
                if finish_err then return finish_err end
            end
        end
    end
    return nil
end
type EnqueueParams = enqueue.EnqueueParams
type IdentityParams = enqueue.IdentityParams
lifecycle.EnqueueParams = EnqueueParams
lifecycle.IdentityParams = IdentityParams
lifecycle.identity_parts = enqueue.identity_parts
lifecycle.enqueue_job = enqueue.enqueue_job
lifecycle.carried_identity_error = enqueue.carried_identity_error
lifecycle.list_jobs = enqueue.list_jobs
lifecycle.get_job = enqueue.get_job
lifecycle.list_job_runs = enqueue.list_job_runs

return lifecycle
