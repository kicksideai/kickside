-- Job completion and failure transitions for workers.

local sql = require("sql")

local job_types = require("job_types")
local lifecycle = require("lifecycle")
local completion = require("completion")
local lease_release = require("lease_release")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")

local worker_completion = {}

local function completion_opts(output: any): (table?, error?)
    if type(output) ~= "table" then return {}, nil end
    local value = output :: any
    if value.next_run_at ~= nil then
        return nil, (errors.new({ message = "worker output uses rearm, not next_run_at", kind = errors.INVALID }) :: error)
    end
    if value.rearm ~= nil and (type(value.rearm) ~= "string" or value.rearm == "") then
        return nil, (errors.new({ message = "worker rearm must be a timestamp", kind = errors.INVALID }) :: error)
    end
    if value.tier ~= nil and value.tier ~= "live" and value.tier ~= "backfill"
        and value.tier ~= "maintenance" then
        return nil, (errors.new({ message = "worker tier is invalid", kind = errors.INVALID }) :: error)
    end
    if value.record ~= nil and (type(value.record) ~= "table" or
        (value.record.status ~= "completed" and value.record.status ~= "failed"
            and value.record.status ~= "parked")) then
        return nil, (errors.new({ message = "worker record status is invalid", kind = errors.INVALID }) :: error)
    end
    return { rearm = value.rearm, tier = value.tier, record = value.record }, nil
end
worker_completion.completion_opts = completion_opts

local function failure_class_for(err: error): string
    local retryable = err:retryable()
    local details = err:details()
    local cause = details and details.cause
    -- Dispatch disables invocation retries while retaining the worker's policy.
    if type(cause) == "table" and cause.kind == err:kind() then
        retryable = cause.retryable
    end
    if job_types.is_deterministic_kind(err:kind())
        or (err:kind() == errors.INTERNAL and retryable == false) then
        return "deterministic"
    end
    return "infrastructure"
end
worker_completion.failure_class_for = failure_class_for

local function response_error(field: string): error
    return errors.new({message = "worker completion response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_worker_completion_response", field = field}})
end

local function complete_job(db: sql.DB, dbtype: string, job: table, output: any, run_ctx: table?): error?
    local opts, opts_err = completion_opts(output)
    if opts_err then
        local park_err = lifecycle.fail_job(db, job, dbtype, tostring(opts_err), "deterministic")
        if park_err then return error_envelope.wrap_secondary(park_err, opts_err, "invalid worker output parking failed") end
        return opts_err
    end
    local lease = { token = job.lease_token, execution_seq = tonumber(job.execution_seq) }
    local tx, begin_err = sql_boundary.begin(db, "completion begin failed", "transaction", response_error)
    if begin_err or not tx then return begin_err or response_error("transaction") end
    local done, done_err = completion.complete_worker_tx(tx, tostring(job.id), lease, opts :: table)
    if done_err then
        return sql_boundary.rollback(tx, done_err, "completion rollback failed")
    end
    if type(done) ~= "table" then
        return sql_boundary.rollback(tx, response_error("completion"), "completion rollback failed")
    end
    if done.already_completed == true then
        return sql_boundary.rollback(tx, nil, "completion rollback failed")
    end
    if (opts :: table).record ~= nil then
        local record = (opts :: table).record
        local history_err = lifecycle.finalize_job_run(tx, dbtype, run_ctx,
            record.status, output, output, record.error)
        if history_err then return sql_boundary.rollback(tx, history_err, "completion rollback failed") end
    end
    local _, commit_err = tx:commit()
    if commit_err then
        return errors.wrap(commit_err, "completion commit failed")
    end
    return lease_release.notify(tostring(job.id), tonumber(job.execution_seq),
        { kind = job.owner_kind, id = job.owner_id })
end
worker_completion.complete_job = complete_job

local function fail_job(db: sql.DB, dbtype: string, job: table, output: any,
    error_text: string, failure_class: string?, run_ctx: table?, retry_floor: table?): (error?, boolean)
    local tx, begin_err = sql_boundary.begin(db, "failure begin failed", "transaction", response_error)
    if begin_err or not tx then return begin_err or response_error("transaction"), false end
    local settled, settled_err = completion.worker_settled_tx(tx, tostring(job.id),
        { token = job.lease_token, execution_seq = tonumber(job.execution_seq) })
    if settled_err then return sql_boundary.rollback(tx, settled_err, "failure rollback failed"), false end
    if settled then
        local rollback_err = sql_boundary.rollback(tx, nil, "failure rollback failed")
        return rollback_err, rollback_err == nil
    end
    local fail_err = lifecycle.fail_tx(tx, job, dbtype, error_text, failure_class, retry_floor)
    if fail_err then
        return sql_boundary.rollback(tx, fail_err, "failure rollback failed"), false
    end
    local history_err = lifecycle.finalize_job_run(tx, dbtype, run_ctx,
        job_types.RUN_STATE.FAILED, output, output, error_text)
    if history_err then
        return sql_boundary.rollback(tx, history_err, "failure rollback failed"), false
    end
    local _, commit_err = tx:commit()
    if commit_err then
        return errors.wrap(commit_err, "failure commit failed"), false
    end
    return lease_release.notify(tostring(job.id), tonumber(job.execution_seq),
        { kind = job.owner_kind, id = job.owner_id }), true
end
worker_completion.fail_job = fail_job

return worker_completion
