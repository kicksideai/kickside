-- Durable job-row fences used when a supervised child cannot be confirmed.
local sql = require("sql")
local job_types = require("job_types")
local cfg = require("config")
local execution_policy = require("execution_policy")
local lifecycle = require("lifecycle")
local row_bytes = require("row_bytes")
local worker_marker = require("worker_marker")
local boundary = require("sql_boundary")
local reclaim = require("reclaim")

local worker_fence = {}
local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "termination fence response is invalid",
        details = {code = "job_termination_response", field = field}})
end
local function read_policy()
    local policy, err = cfg.policy()
    if err then return nil, err end
    if type(policy) ~= "table" then return nil, response_error("policy") end
    return policy, nil
end

local function termination_marker(job: table): string
    return job_types.TERMINATION_PENDING_PREFIX .. tostring(job.lease_token or "")
end

worker_fence.termination_marker = termination_marker

-- A child without a confirmed terminal signal loses its execution token. Its
-- lease_until becomes the next liveness recheck: the pool's terminated reclaim
-- settles the row once the child's registered name is gone.
-- The durable marker is written before a terminate request. Reclaim and lease
-- heartbeat exclude it, so a failed quarantine statement cannot expose the
-- expiring old lease to another worker.
function worker_fence.prepare_termination(db: sql.DB, job: table, cause: error?): error?
    local policy, policy_err = read_policy()
    if policy_err then return policy_err end
    local tx, begin_err = boundary.begin(db, "termination marker transaction failed", "transaction", response_error)
    if begin_err then return begin_err end
    local marker = termination_marker(job)
    local size_err = row_bytes.check_update(tx, "kickside_job", tostring(job.id),
        { last_error = marker }, (policy :: any).max_row_bytes, "prepare_termination")
    if size_err then return boundary.rollback(tx, size_err, "termination fence rollback failed") end
    local result, err = sql.builder.update("kickside_job")
        :set("last_error", marker)
        :where(sql.builder.eq({ id = job.id, status = job_types.JOB_STATE.RUNNING,
            lease_token = job.lease_token }))
        :run_with(tx):exec()
    local changed, update_err = boundary.single_row_count(result, err, "failed to fence termination", "update.rows_affected", response_error)
    if update_err then return boundary.rollback(tx, update_err, "termination fence rollback failed") end
    if changed == 1 and cause and job_types.is_lease_lost_error(cause) then
        local dbtype, type_err = boundary.database_type(db, "termination fence dialect failed", "database.type", response_error)
        if type_err then return boundary.rollback(tx, type_err, "termination fence rollback failed") end
        local rows, read_err = tx:query("SELECT heartbeat_at,execution_seq FROM kickside_job WHERE id=$1", {job.id})
        if read_err then return boundary.rollback(tx, errors.wrap(read_err, "termination intent read failed"), "termination fence rollback failed") end
        if type(rows) ~= "table" or not rows[1] then
            return boundary.rollback(tx, response_error("intent.rows"), "termination fence rollback failed")
        end
        -- Cancellation clears heartbeat_at under this same row lock. Commit
        -- expiry history with its fence so recovery cannot record a failure.
        if rows[1].heartbeat_at ~= nil then
            local history_err = reclaim.close_lost_run(tx, dbtype :: string, tostring(job.id),
                tonumber(rows[1].execution_seq) :: integer, tostring(job.lease_token), lifecycle.now_string(dbtype :: string))
            if history_err then return boundary.rollback(tx, history_err, "termination fence rollback failed") end
        end
    end
    local _, commit_err = tx:commit()
    if commit_err then
        return errors.wrap(commit_err, "failed to commit termination fence")
    end
    return nil
end

function worker_fence.hold_unconfirmed_execution(db: sql.DB, job: table): error?
    local policy, policy_err = read_policy()
    if policy_err then return policy_err end
    local tx, begin_err = boundary.begin(db, "unconfirmed execution transaction failed", "transaction", response_error)
    if begin_err then return begin_err end
    local raw_type, type_err = db:type()
    if type_err then return boundary.rollback(tx, errors.wrap(type_err, "unconfirmed execution dialect failed"), "termination fence rollback failed") end
    if type(raw_type) ~= "string" or (raw_type ~= sql.type.SQLITE and raw_type ~= sql.type.POSTGRES) then
        return boundary.rollback(tx, response_error("database.type"), "termination fence rollback failed")
    end
    local captured, capture_err = execution_policy.load_from(tx, job)
    if capture_err then return boundary.rollback(tx, capture_err, "termination fence rollback failed") end
    local recheck = lifecycle.future_string(raw_type, captured.lease_timeout_seconds)
    local size_err = row_bytes.check_update(tx, "kickside_job", tostring(job.id), {
        lease_until = recheck, lease_token = row_bytes.NULL,
    }, (policy :: any).max_row_bytes, "hold_unconfirmed_execution")
    if size_err then return boundary.rollback(tx, size_err, "termination fence rollback failed") end
    local result, err = sql.builder.update("kickside_job")
        :set("lease_until", recheck)
        :set("lease_token", nil)
        :where(sql.builder.eq({ id = job.id, status = job_types.JOB_STATE.RUNNING,
            lease_token = job.lease_token }))
        :where(sql.builder.eq({ last_error = termination_marker(job) }))
        :run_with(tx):exec()
    local count, update_err = boundary.single_row_count(result, err, "failed to hold unconfirmed execution", "update.rows_affected", response_error)
    if update_err then return boundary.rollback(tx, update_err, "termination fence rollback failed") end
    if count == 0 then
        return boundary.rollback(tx, errors.new({message = "unconfirmed execution lost its running fence", kind = errors.CONFLICT}), "termination fence rollback failed")
    end
    local marker_err = worker_marker.clear(tx, job.id)
    if marker_err then return boundary.rollback(tx, marker_err, "termination fence rollback failed") end
    local _, commit_err = tx:commit()
    if commit_err then
        return errors.wrap(commit_err, "failed to commit unconfirmed execution fence")
    end
    return nil
end

return worker_fence
