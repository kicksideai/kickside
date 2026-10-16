-- Worker-child start and unstarted-assignment fences.
local sql = require("sql")
local job_types = require("job_types")
local lifecycle = require("lifecycle")
local worker_marker = require("worker_marker")
local sql_boundary = require("sql_boundary")

local claim_execution = {}

local function response_error(field: string): error
    return errors.new({message = "job start fence response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_start_fence_response", field = field}})
end

-- The execution child changes the claim-created run's owner before it can do
-- work, and never starts an execution fenced for termination. The job row is locked first in both this path and release_unstarted,
-- so an exiting slot cannot requeue a child that has begun execution.
function claim_execution.mark_started(db: sql.DB, job: table, worker_id: string, run_id: string,
        child_id: string): (boolean, error?)
    local tx, begin_err = sql_boundary.begin(db, "start fence begin failed", "start.transaction", response_error)
    if begin_err or not tx then return false, begin_err or response_error("start.transaction") end
    local held, hold_err = sql.builder.update("kickside_job")
        :set("heartbeat_at", sql.builder.expr("heartbeat_at"))
        :where(sql.builder.eq({ id = job.id, status = job_types.JOB_STATE.RUNNING,
            lease_token = job.lease_token, execution_seq = job.execution_seq }))
        :where("(last_error IS NULL OR last_error <> ?)", job_types.TERMINATION_PENDING_PREFIX .. tostring(job.lease_token))
        :run_with(tx):exec()
    local held_count, lock_err = sql_boundary.single_row_count(held, hold_err, "start fence lock failed", "start.lock", response_error)
    if lock_err then return false, sql_boundary.rollback(tx, lock_err, "job start fence rollback failed") end
    if held_count == 0 then return false, sql_boundary.rollback(tx, nil, "job start fence rollback failed") end
    local started, start_err = sql.builder.update("kickside_job_run")
        :set("worker_pid", child_id)
        :where(sql.builder.eq({ id = run_id, job_id = job.id, lease_token = job.lease_token,
            execution_seq = job.execution_seq, worker_pid = worker_id,
            status = job_types.RUN_STATE.RUNNING }))
        :run_with(tx):exec()
    local started_count, update_err = sql_boundary.single_row_count(started, start_err, "start fence update failed", "start.update", response_error)
    if update_err then return false, sql_boundary.rollback(tx, update_err, "job start fence rollback failed") end
    if started_count == 0 then return false, sql_boundary.rollback(tx, nil, "job start fence rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return false, errors.wrap(commit_err, "start fence commit failed") end
    return true, nil
end

-- Undo only a batch assignment still owned by its original slot. A child that
-- crossed mark_started retains the lease for ordinary completion/recovery.
function claim_execution.release_unstarted(db: sql.DB, job: table, worker_id: string,
        run_id: string): (boolean, error?)
    local tx, begin_err = sql_boundary.begin(db, "unstarted release begin failed", "release.transaction", response_error)
    if begin_err or not tx then return false, begin_err or response_error("release.transaction") end
    local raw_type, type_err = db:type()
    if type_err then return false, sql_boundary.rollback(tx, errors.wrap(type_err, "unstarted release dialect failed"), "job start fence rollback failed") end
    if type(raw_type) ~= "string" or raw_type == "" then return false, sql_boundary.rollback(tx, response_error("database.type"), "job start fence rollback failed") end
    local dbtype = raw_type :: string
    local now = lifecycle.now_string(dbtype)
    local ts = dbtype == sql.type.POSTGRES and "CAST(? AS TIMESTAMPTZ)" or "?"
    local released, update_err = sql.builder.update("kickside_job")
        :set("status", job_types.JOB_STATE.PENDING)
        :set("lease_token", nil)
        :set("lease_until", nil)
        :set("heartbeat_at", nil)
        :set("scheduled_at", sql.builder.expr("CASE WHEN wake_control_pending THEN " .. ts .. " ELSE scheduled_at END", now))
        :set("wake_enabled", sql.builder.expr("CASE WHEN wake_control_pending THEN TRUE ELSE wake_enabled END"))
        :set("attempts", sql.builder.expr("CASE WHEN wake_control_pending THEN 0 ELSE attempts - 1 END"))
        :set("wake_control_pending", false)
        :where(sql.builder.eq({ id = job.id, status = job_types.JOB_STATE.RUNNING,
            lease_token = job.lease_token, execution_seq = job.execution_seq }))
        :where("EXISTS (SELECT 1 FROM kickside_job_run r WHERE r.id = ? AND r.job_id = kickside_job.id"
            .. " AND r.lease_token = ? AND r.execution_seq = ? AND r.worker_pid = ? AND r.status = 'running')",
            run_id, job.lease_token, job.execution_seq, worker_id)
        :run_with(tx):exec()
    local released_count, release_err = sql_boundary.single_row_count(released, update_err, "unstarted release update failed", "release.update", response_error)
    if release_err then return false, sql_boundary.rollback(tx, release_err, "job start fence rollback failed") end
    if released_count == 0 then return false, sql_boundary.rollback(tx, nil, "job start fence rollback failed") end
    local removed, delete_err = sql.builder.delete("kickside_job_run")
        :where(sql.builder.eq({ id = run_id, job_id = job.id, lease_token = job.lease_token,
            execution_seq = job.execution_seq, worker_pid = worker_id,
            status = job_types.RUN_STATE.RUNNING }))
        :run_with(tx):exec()
    local removed_count, removal_err = sql_boundary.single_row_count(removed, delete_err, "unstarted run removal failed", "release.delete", response_error)
    if removal_err then return false, sql_boundary.rollback(tx, removal_err, "job start fence rollback failed") end
    if removed_count ~= 1 then return false, sql_boundary.rollback(tx, response_error("release.delete"), "job start fence rollback failed") end
    local marker_err = worker_marker.clear(tx, job.id)
    if marker_err then return false, sql_boundary.rollback(tx, marker_err, "job start fence rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then return false, errors.wrap(commit_err, "unstarted release commit failed") end
    return true, nil
end

return claim_execution
