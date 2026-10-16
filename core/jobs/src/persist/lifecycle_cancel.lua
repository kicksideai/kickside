-- Cancel a job and release its worker marker under the same job-row lock.
local sql = require("sql")
local clock = require("clock")
local job_types = require("job_types")
local cfg = require("config")
local row_bytes = require("row_bytes")
local row_mutations = require("row_mutations")
local worker_marker = require("worker_marker")
local sql_boundary = require("sql_boundary")

local cancel = {}
type CancelParams = {
    id: string, expected_lease_token: string?,
}
cancel.CancelParams = CancelParams

local function response_error(field: string): error
    return errors.new({message = "cancellation response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_cancellation_response", field = field}})
end

local function validate_params(params: CancelParams): error?
    if type(params) ~= "table" or type(params.id) ~= "string" or params.id == "" then
        return (errors.new({ message = "cancel requires a job id", kind = errors.INVALID }) :: error)
    end
    return nil
end

local function policy_or_error(): (table?, error?)
    local policy, policy_err = cfg.policy()
    if policy_err then return nil, policy_err end
    if not policy then
        return nil, (errors.new({ message = "cancel policy is unavailable", kind = errors.INTERNAL }) :: error)
    end
    return policy, nil
end

local function cancel_in_tx(tx: sql.Transaction, dbtype: string, params: CancelParams,
    policy: table, finished_at: string): (boolean, error?, table[]?)
    local query = sql.builder.select("id", "status", "lease_token", "execution_seq", "last_error")
        :from("kickside_job")
        :where(sql.builder.eq({ id = params.id }))
        :where("status IN ('pending','running')")
        :limit(1)
    if dbtype == sql.type.POSTGRES then query = query:suffix("FOR UPDATE") end
    local rows, select_err = query:run_with(tx):query()
    if select_err then return false, errors.wrap(select_err, "cancel lookup failed") end
    if type(rows) ~= "table" then return false, response_error("lookup.rows") end
    local revoked: table[] = {}
    local row = rows and rows[1]
    if not row then return false, nil, revoked end
    local quarantine = type(row.last_error) == "string"
        and string.find(row.last_error, job_types.TERMINATION_PENDING_PREFIX, 1, true) == 1
        and (row.lease_token == nil or row.lease_token == "")
    if quarantine then return false, nil, revoked end
    if params.expected_lease_token ~= nil and
        (row.status ~= job_types.JOB_STATE.RUNNING or row.lease_token ~= params.expected_lease_token) then
        return false, (errors.new({ message = "job lease changed before cancellation", kind = errors.CONFLICT }) :: error)
    end
    local running = row.status == job_types.JOB_STATE.RUNNING
        and type(row.lease_token) == "string" and row.lease_token ~= ""
    local marker = job_types.TERMINATION_PENDING_PREFIX .. tostring(row.lease_token or "")
    local size_err
    if running then
        size_err = row_bytes.check_update(tx, "kickside_job", tostring(row.id), {
            lease_until = row_bytes.NULL, heartbeat_at = row_bytes.NULL, last_error = marker,
        }, (policy :: any).max_row_bytes, "cancel_running_job")
    else
        size_err = row_mutations.cancel(tx, tostring(row.id), "", "",
                "cancelled", finished_at, (policy :: any).max_row_bytes)
    end
    if size_err then return false, size_err end
    local update = sql.builder.update("kickside_job")
    if running then
        update = update:set("lease_until", nil):set("heartbeat_at", nil):set("last_error", marker)
    else
        update = update:set("status", job_types.JOB_STATE.CANCELLED)
            :set("lease_token", nil):set("lease_until", nil):set("heartbeat_at", nil)
            :set("last_error", "cancelled")
            :set("finished_at", finished_at)
    end
    update = update:where(sql.builder.eq({ id = row.id }))
        :where("status IN ('pending','running')")
    if running then update = update:where(sql.builder.eq({ lease_token = row.lease_token })) end
    local result, update_err = update:run_with(tx):exec()
    local count, count_err = sql_boundary.single_row_count(result, update_err,
        "cancel update failed", "update.count", response_error)
    if count_err then return false, count_err end
    local canceled = count == 1
    if canceled and running then
        revoked[#revoked + 1] = { id = tostring(row.id), token = row.lease_token,
            execution_seq = tonumber(row.execution_seq), reason = "cancelled" }
    elseif canceled then
        local marker_err = worker_marker.clear(tx, row.id)
        if marker_err then return false, marker_err end
    end
    return canceled, nil, revoked
end

-- The typed transaction entry leaves commit and rollback to its caller.
function cancel.cancel_job_tx(tx: sql.Transaction, dbtype: string, params: CancelParams): (boolean, error?, table[]?)
    local params_err = validate_params(params)
    if params_err then return false, params_err end
    local policy, policy_err = policy_or_error()
    if policy_err or not policy then return false, policy_err end
    return cancel_in_tx(tx, dbtype, params, policy, clock.now(dbtype))
end

-- A standalone cancellation owns the transaction that updates the job and its marker.
function cancel.cancel_job(db: sql.DB, dbtype: string, params: CancelParams): (boolean, error?, table[]?)
    local params_err = validate_params(params)
    if params_err then return false, params_err end
    local policy, policy_err = policy_or_error()
    if policy_err or not policy then return false, policy_err end
    local tx, begin_err = sql_boundary.begin(db, "cancel begin failed", "transaction", response_error)
    if begin_err then return false, begin_err end
    if not tx then return false, response_error("transaction") end
    local canceled, cancel_err, revoked = cancel_in_tx(tx, dbtype, params, policy, clock.now(dbtype))
    if cancel_err then
        return false, sql_boundary.rollback(tx, cancel_err, "cancel rollback failed"), revoked
    end
    local _, commit_err = tx:commit()
    if commit_err then
        return false, errors.wrap(commit_err, "cancel commit failed")
    end
    return canceled, nil, revoked
end

-- The transaction entry leaves ownership with projection callers and handles
-- exact ids only.
function cancel.cancel_jobs_tx(tx: sql.Transaction, dbtype: string, params: any): (integer, error?, table[]?)
    if type(params) ~= "table" or type(params.id) ~= "string" or params.id == "" then
        return 0, (errors.new({ message = "cancel requires a job id", kind = errors.INVALID }) :: error)
    end
    local canceled, err, revoked = cancel.cancel_job_tx(tx, dbtype, {
        id = params.id, expected_lease_token = params.expected_lease_token,
    })
    if err then return 0, err, revoked end
    return canceled and 1 or 0, nil, revoked
end

-- The standalone entry owns the DB transaction and shares the same mutation path.
function cancel.cancel_jobs(db: sql.DB, dbtype: string, params: any): (integer, error?, table[]?)
    if type(params) ~= "table" or type(params.id) ~= "string" or params.id == "" then
        return 0, (errors.new({ message = "cancel requires a job id", kind = errors.INVALID }) :: error)
    end
    local cancel_params: CancelParams = {
        id = params.id,
        expected_lease_token = params.expected_lease_token,
    }
    local canceled, err, revoked = cancel.cancel_job(db, dbtype, cancel_params)
    if err then return 0, err, revoked end
    return canceled and 1 or 0, nil, revoked
end

-- Complete cancellation only after the registered supervisor confirms child
-- exit, or when no supervisor was registered at commit time.
function cancel.finish_cancellation(db: sql.DB, dbtype: string, execution: table): (boolean, error?)
    local id = tostring(execution.id or "")
    local token = tostring(execution.token or "")
    local sequence = tonumber(execution.execution_seq)
    if id == "" or token == "" or sequence == nil then
        return false, (errors.new({ message = "cancel completion requires a fenced execution", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return false, policy_err end
    local tx, begin_err = sql_boundary.begin(db, "cancel completion begin failed", "transaction", response_error)
    if begin_err then return false, begin_err end
    if not tx then return false, response_error("transaction") end
    local marker = job_types.TERMINATION_PENDING_PREFIX .. token
    local size_err = row_bytes.check_update(tx, "kickside_job", id, {
        status = job_types.JOB_STATE.CANCELLED,
        lease_token = row_bytes.NULL, lease_until = row_bytes.NULL, heartbeat_at = row_bytes.NULL,
        last_error = tostring(execution.reason or "cancelled"), finished_at = clock.now(dbtype),
    }, (policy :: any).max_row_bytes, "finish_cancellation")
    if size_err then return false, sql_boundary.rollback(tx, size_err, "cancel completion rollback failed") end
    local result, update_err = sql.builder.update("kickside_job")
        :set("status", job_types.JOB_STATE.CANCELLED)
        :set("lease_token", nil):set("lease_until", nil):set("heartbeat_at", nil)
        :set("last_error", tostring(execution.reason or "cancelled"))
        :set("finished_at", clock.now(dbtype))
        :where(sql.builder.eq({ id = id, status = job_types.JOB_STATE.RUNNING,
            lease_token = token, execution_seq = sequence, last_error = marker }))
        :run_with(tx):exec()
    local count, count_err = sql_boundary.single_row_count(result, update_err,
        "cancel completion update failed", "update.count", response_error)
    if count_err then return false, sql_boundary.rollback(tx, count_err, "cancel completion rollback failed") end
    local changed = count == 1
    if changed then
        local marker_err = worker_marker.clear(tx, id)
        if marker_err then return false, sql_boundary.rollback(tx, marker_err, "cancel completion rollback failed") end
    end
    local _, commit_err = tx:commit()
    if commit_err then return false, errors.wrap(commit_err, "cancel completion commit failed") end
    return changed, nil
end

return cancel
