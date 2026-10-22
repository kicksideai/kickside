-- Lease and termination-fence recovery of running jobs. reclaim_expired
-- returns running jobs whose lease elapsed (a crashed worker) back to pending;
-- reclaim_terminated settles termination fences whose execution child has
-- ended; settle_confirmed settles one fence whose supervisor observed the exit.

local sql = require("sql")

local job_types = require("job_types")
local cfg = require("config")
local lifecycle = require("lifecycle")
local row_bytes = require("row_bytes")
local worker_marker = require("worker_marker")
local proc_supervisor = require("proc_supervisor")
local lease_release = require("lease_release")
local sql_boundary = require("sql_boundary")

local M = {}
local function response_error(field: string): error
    return errors.new({message = "job recovery response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_reclaim_response", field = field}})
end

-- Recovery scopes. EXPIRED selects crashed executions: the lease elapsed and no
-- termination fence holds the row. TERMINATED selects termination-fenced rows
-- whose recheck time (lease_until) passed and settles each one whose execution
-- child no longer exists; the runtime drops a process's registered names when
-- it completes, so an absent name proves the child ended. A child still alive
-- keeps its fence and moves its recheck one lease window ahead. CONFIRMED
-- settles one execution whose supervisor observed the child's exit.
local EXPIRED = "expired"
local TERMINATED = "terminated"
local CONFIRMED = "confirmed"
-- A settled fence replaces its marker, which would otherwise read as a held
-- execution and refuse cancellation of the pending row.
local TERMINATION_SETTLED = "termination settled: execution ended"

local PREFIX = job_types.TERMINATION_PENDING_PREFIX
local FENCED_SQL = "substr(last_error, 1, " .. tostring(#PREFIX) .. ") = ?"
local UNFENCED_SQL = "(last_error IS NULL OR substr(last_error, 1, " .. tostring(#PREFIX) .. ") <> ?)"

local function scope_rows(query: any, scope: string, now: string, execution: table?, dbtype: string): any
    if scope == TERMINATED then
        local ts = dbtype == sql.type.POSTGRES and "CAST(? AS TIMESTAMPTZ)" or "?"
        return query:where(FENCED_SQL, PREFIX)
            :where("(lease_until IS NULL OR lease_until <= " .. ts .. ")", now)
    end
    if scope == CONFIRMED then
        local e = execution :: table
        return query:where(sql.builder.eq({ id = e.id, lease_token = e.token,
            execution_seq = e.execution_seq, last_error = PREFIX .. tostring(e.token) }))
    end
    return query:where(sql.builder.lte({ lease_until = now })):where(UNFENCED_SQL, PREFIX)
end

local function fenced_token(last_error: any): string
    if type(last_error) ~= "string" or string.find(last_error, PREFIX, 1, true) ~= 1 then return "" end
    return string.sub(last_error, #PREFIX + 1)
end

local function finalize_fenced_run(tx: sql.Transaction, dbtype: string, row: table): error?
    local epoch = dbtype == sql.type.POSTGRES and "EXTRACT(EPOCH FROM started_at)"
        or "CAST(strftime('%s',started_at) AS INTEGER)"
    local runs, read_err = tx:query("SELECT id,lease_token,status," .. epoch .. " AS started_at_unix"
        .. " FROM kickside_job_run WHERE job_id=$1 AND execution_seq=$2",
        { row.id, row.execution_seq })
    if read_err then return errors.wrap(read_err, "termination history read failed") end
    if type(runs) ~= "table" then return response_error("termination_history.rows") end
    local run = runs[1]
    if not run or run.status ~= job_types.RUN_STATE.RUNNING then return nil end
    if tostring(run.lease_token or "") ~= fenced_token(row.last_error) then
        return (errors.new({ message = "termination history belongs to another lease", kind = errors.CONFLICT }) :: error)
    end
    return lifecycle.finalize_job_run(tx, dbtype,
        { id = run.id, started_at_unix = tonumber(run.started_at_unix) },
        job_types.RUN_STATE.FAILED, {}, {}, TERMINATION_SETTLED)
end

local LEASE_ENDED = "lease ended: execution lease reclaimed"

-- Close the run history of one execution whose lease no longer holds its job.
-- The update is fenced on the run still reading running, so an owner that
-- settled the run first keeps its outcome.
function M.close_lost_run(tx: sql.Transaction, dbtype: string, job_id: string, execution_seq: integer,
        lease_token: string, now: string): error?
    local policy, policy_err = cfg.policy()
    if policy_err then return policy_err end
    if type(policy) ~= "table" then return response_error("policy") end
    local runs, read_err = tx:query("SELECT id FROM kickside_job_run WHERE job_id=$1 AND execution_seq=$2"
        .. " AND lease_token=$3 AND status=$4", { job_id, execution_seq, lease_token, job_types.RUN_STATE.RUNNING })
    if read_err then return errors.wrap(read_err, "lost run lookup failed") end
    if type(runs) ~= "table" then return response_error("lost_history.rows") end
    for _, run in ipairs(runs) do
        local run_id = tostring(run.id)
        local size_err = row_bytes.check_update(tx, "kickside_job_run", run_id,
            { status = job_types.RUN_STATE.LEASE_LOST, finished_at = now, error_text = LEASE_ENDED },
            (policy :: any).max_row_bytes, "close_lost_run")
        if size_err then return size_err end
        local updated, update_err = sql.builder.update("kickside_job_run")
            :set("status", job_types.RUN_STATE.LEASE_LOST)
            :set("finished_at", now)
            :set("error_text", LEASE_ENDED)
            :set("updated_at", now)
            :where(sql.builder.eq({ id = run_id, status = job_types.RUN_STATE.RUNNING }))
            :run_with(tx):exec()
        local _, proof_err = sql_boundary.bounded_row_count(updated, update_err,
            "lost run close failed", "lost_history.update", 1, response_error)
        if proof_err then return proof_err end
    end
    return nil
end

-- Close one page of run history whose lease no longer holds its job: the job
-- moved to another execution or left running. A job lease
-- token is never reissued, so such a run can never settle through its owner.
-- Returns the number of runs closed; a page shorter than limit ends the pass.
function M.close_lost_runs(db: sql.DB, dbtype: string, requested_limit: integer?): (integer, error?)
    local policy, policy_err = cfg.policy()
    if policy_err then return 0, policy_err end
    if type(policy) ~= "table" then return 0, response_error("policy") end
    local limit = requested_limit or (policy :: any).worker_claim_batch
    if type(limit) ~= "number" or limit < 1 or limit > (policy :: any).worker_claim_batch
        or limit ~= math.floor(limit) then
        return 0, (errors.new({ message = "lost run limit exceeds worker.claim_batch policy",
            kind = errors.INVALID }) :: error)
    end
    local now = lifecycle.now_string(dbtype)
    local tx, begin_err = sql_boundary.begin(db, "lost run begin failed", "transaction", response_error)
    if begin_err then return 0, begin_err end
    if not tx then return 0, response_error("transaction") end
    local suffix = dbtype == sql.type.POSTGRES and " FOR UPDATE OF r SKIP LOCKED" or ""
    local rows, select_err = tx:query([[SELECT r.id, r.job_id, r.execution_seq, r.lease_token
        FROM kickside_job_run r WHERE r.status=$1 AND NOT EXISTS (SELECT 1 FROM kickside_job j
            WHERE j.id=r.job_id AND j.status=$2 AND j.lease_token=r.lease_token
            AND j.execution_seq=r.execution_seq)
        ORDER BY r.id ASC LIMIT $3]] .. suffix,
        { job_types.RUN_STATE.RUNNING, job_types.JOB_STATE.RUNNING, limit })
    if select_err then return 0, sql_boundary.rollback(tx,
        errors.wrap(select_err, "lost run select failed"), "lost run rollback failed") end
    if type(rows) ~= "table" then return 0, sql_boundary.rollback(tx,
        response_error("lost_history.rows"), "lost run rollback failed") end
    for _, row in ipairs(rows) do
        local close_err = M.close_lost_run(tx, dbtype, tostring(row.job_id),
            tonumber(row.execution_seq) :: integer, tostring(row.lease_token or ""), now)
        if close_err then return 0, sql_boundary.rollback(tx, close_err, "lost run rollback failed") end
    end
    local _, commit_err = tx:commit()
    if commit_err then return 0, errors.wrap(commit_err, "lost run commit failed") end
    return #rows, nil
end

type ReclaimPlan = { scope: string, execution: table?, alive: ((string, string) -> (boolean, error?))? }

local function reclaim(db: sql.DB, dbtype: string, requested_limit: integer?, plan: ReclaimPlan): (integer, error?)
    local scope = plan.scope
    local policy, policy_err = cfg.policy()
    if policy_err then return 0, policy_err end
    if type(policy) ~= "table" then return 0, response_error("policy") end
    local reclaim_limit = requested_limit or (policy :: any).worker_claim_batch
    if type(reclaim_limit) ~= "number" or reclaim_limit < 1
        or reclaim_limit > (policy :: any).worker_claim_batch or reclaim_limit ~= math.floor(reclaim_limit) then
        return 0, (errors.new({ message = "reclaim limit exceeds worker.claim_batch policy",
            kind = errors.INVALID }) :: error)
    end
    local now = lifecycle.now_string(dbtype)
    local query = scope_rows(sql.builder.select("id", "lease_token", "execution_seq", "last_error", "owner_kind", "owner_id")
        :from("kickside_job")
        :where(sql.builder.eq({ status = job_types.JOB_STATE.RUNNING })), scope, now, plan.execution, dbtype)
        :order_by("id ASC")
        :limit(reclaim_limit)
    local observations: { [string]: table } = {}
    if scope == TERMINATED then
        local statement, args, build_err = query:placeholder_format(sql.builder.dollar):to_sql()
        if build_err then return 0, errors.wrap(build_err, "reclaim select build failed") end
        local candidates, read_err = db:query(statement, args)
        if read_err then return 0, errors.wrap(read_err, "reclaim select failed") end
        if type(candidates) ~= "table" then return 0, response_error("reclaim.rows") end
        if #candidates == 0 then return 0, nil end
        local ids: string[] = {}
        local marks: string[] = {}
        for _, row in ipairs(candidates) do
            local live, live_err = (plan.alive :: (string, string) -> (boolean, error?))(
                tostring(row.id), fenced_token(row.last_error))
            if live_err then return 0, live_err end
            if type(live) ~= "boolean" then return 0, response_error("termination.alive") end
            observations[tostring(row.id)] = { lease_token = row.lease_token, execution_seq = row.execution_seq,
                last_error = row.last_error, alive = live }
            ids[#ids + 1] = tostring(row.id)
            marks[#marks + 1] = "?"
        end
        query = query:where("id IN (" .. table.concat(marks, ",") .. ")", table.unpack(ids))
    end
    local tx, begin_err = sql_boundary.begin(db, "reclaim begin failed", "transaction", response_error)
    if begin_err then return 0, begin_err end
    if not tx then return 0, response_error("transaction") end
    -- Unlike competing claimers, the recovery owner must not skip an expired
    -- row locked by renewal. PostgreSQL waits, then rechecks lease_until against
    -- the committed value; a renewed lease is therefore omitted authoritatively.
    -- A child cannot cross its start fence while the termination marker holds.
    -- Recheck the observed execution under this lock before using its liveness.
    if dbtype == sql.type.POSTGRES then query = query:suffix("FOR UPDATE") end
    local rows, select_err = query:run_with(tx):query()
    if select_err then return 0, sql_boundary.rollback(tx,
        errors.wrap(select_err, "reclaim select failed"), "reclaim rollback failed") end
    if type(rows) ~= "table" then return 0, sql_boundary.rollback(tx,
        response_error("reclaim.rows"), "reclaim rollback failed") end
    if scope == TERMINATED then
        local retained: table[] = {}
        for _, row in ipairs(rows) do
            local observed = observations[tostring(row.id)]
            if observed and observed.lease_token == row.lease_token
                and tonumber(observed.execution_seq) == tonumber(row.execution_seq)
                and observed.last_error == row.last_error then
                retained[#retained + 1] = row
            end
        end
        rows = retained
    end
    local n = 0
    local revoked: table[] = {}
    local released: table[] = {}
    local ts = dbtype == sql.type.POSTGRES and "CAST(? AS TIMESTAMPTZ)" or "?"
    local settles_fence = scope ~= EXPIRED
    for _, row in ipairs(rows) do
        local alive = false
        if scope == TERMINATED then
            alive = observations[tostring(row.id)].alive
        end
        if alive then
            local recheck = lifecycle.future_string(dbtype, (policy :: any).lease_timeout_seconds)
            local size_err = row_bytes.check_update(tx, "kickside_job", row.id, { lease_until = recheck },
                (policy :: any).max_row_bytes, "recheck_termination")
            if size_err then return 0, sql_boundary.rollback(tx, size_err, "reclaim rollback failed") end
            local rechecked, recheck_err = sql.builder.update("kickside_job"):set("lease_until", recheck)
                :where(sql.builder.eq({ id = row.id, status = job_types.JOB_STATE.RUNNING, last_error = row.last_error }))
                :run_with(tx):exec()
            local _, proof_err = sql_boundary.bounded_row_count(rechecked, recheck_err,
                "termination recheck failed", "termination.update", 1, response_error)
            if proof_err then return 0, sql_boundary.rollback(tx, proof_err, "reclaim rollback failed") end
        else
            local size_err = row_bytes.check_update(tx, "kickside_job", row.id, function(current)
                local control = current.wake_control_pending == true
                    or tonumber(current.wake_control_pending) == 1
                return { status = job_types.JOB_STATE.PENDING,
                    lease_token = row_bytes.NULL, lease_until = row_bytes.NULL,
                    heartbeat_at = row_bytes.NULL,
                    scheduled_at = control and now or (current.scheduled_at or row_bytes.NULL),
                    wake_enabled = control and true or current.wake_enabled,
                    attempts = control and 0 or current.attempts,
                    wake_control_pending = false,
                    last_error = settles_fence and TERMINATION_SETTLED or current.last_error }
            end, (policy :: any).max_row_bytes, "reclaim_job")
            if size_err then return 0, sql_boundary.rollback(tx, size_err, "reclaim rollback failed") end
            local update = sql.builder.update("kickside_job")
                :set("status", job_types.JOB_STATE.PENDING)
                :set("lease_token", nil)
                :set("lease_until", nil)
                :set("heartbeat_at", nil)
                :set("scheduled_at", sql.builder.expr("CASE WHEN wake_control_pending THEN " .. ts .. " ELSE scheduled_at END", now))
                :set("wake_enabled", sql.builder.expr("CASE WHEN wake_control_pending THEN TRUE ELSE wake_enabled END"))
                :set("attempts", sql.builder.expr("CASE WHEN wake_control_pending THEN 0 ELSE attempts END"))
                :set("wake_control_pending", false)
            if settles_fence then update = update:set("last_error", TERMINATION_SETTLED) end
            local result, err = scope_rows(update:where(sql.builder.eq({ id = row.id, status = job_types.JOB_STATE.RUNNING })),
                scope, now, plan.execution, dbtype):run_with(tx):exec()
            local changed, proof_err = sql_boundary.bounded_row_count(result, err,
                "reclaim update failed", "reclaim.update", 1, response_error)
            if proof_err then return 0, sql_boundary.rollback(tx, proof_err, "reclaim rollback failed") end
            if changed == 1 then
                local marker_err = worker_marker.clear(tx, row.id)
                if marker_err then return 0, sql_boundary.rollback(tx, marker_err, "reclaim rollback failed") end
                if settles_fence then
                    local history_err = finalize_fenced_run(tx, dbtype, row)
                    if history_err then return 0, sql_boundary.rollback(tx, history_err, "reclaim rollback failed") end
                    released[#released + 1] = row
                end
                n = n + 1
                if scope == EXPIRED then
                    local history_err = M.close_lost_run(tx, dbtype, tostring(row.id),
                        tonumber(row.execution_seq) :: integer, tostring(row.lease_token or ""), now)
                    if history_err then return 0, sql_boundary.rollback(tx, history_err, "reclaim rollback failed") end
                    revoked[#revoked + 1] = { id = tostring(row.id), token = tostring(row.lease_token or ""),
                        execution_seq = tonumber(row.execution_seq) }
                end
            end
        end
    end
    local _, commit_err = tx:commit()
    if commit_err then return 0, errors.wrap(commit_err, "reclaim commit failed") end
    for _, row in ipairs(released) do
        local notify_err = lease_release.notify(tostring(row.id), tonumber(row.execution_seq),
            { kind = row.owner_kind, id = row.owner_id })
        if notify_err then return n, notify_err end
    end
    for _, old in ipairs(revoked) do
        if old.token ~= "" and type(old.execution_seq) == "number" then
            local _, notify_err = proc_supervisor.notify(old.id, old.token, old.execution_seq, "revoked", nil)
            if notify_err then return n, notify_err end
        end
    end
    return n, nil
end

-- Return running jobs whose lease has elapsed to pending so they can be
-- reclaimed. Used to recover work owned by a crashed worker. Returns the count
-- of jobs reclaimed.
function M.reclaim_expired(db: sql.DB, dbtype: string, requested_limit: integer?): (integer, error?)
    return reclaim(db, dbtype, requested_limit, { scope = EXPIRED })
end

-- Settle termination-fenced executions whose child has ended, wherever the
-- fence came from: a supervisor that stopped before recording the exit, a held
-- child that exited later, or a runtime process that is gone. alive(job_id,
-- token) defaults to the runtime's registration of the execution child.
function M.reclaim_terminated(db: sql.DB, dbtype: string, requested_limit: integer?,
        alive: ((string, string) -> (boolean, error?))?): (integer, error?)
    return reclaim(db, dbtype, requested_limit, { scope = TERMINATED, alive = alive or proc_supervisor.child_alive })
end

-- Settle one fenced execution after its supervisor observed the child's exit.
-- Returns whether the row still carried that execution's fence.
function M.settle_confirmed(db: sql.DB, dbtype: string, execution: table): (boolean, error?)
    local token = tostring(execution.token or "")
    local sequence = tonumber(execution.execution_seq)
    if tostring(execution.id or "") == "" or token == "" or sequence == nil then
        return false, (errors.new({ message = "confirmed settlement requires a fenced execution", kind = errors.INVALID }) :: error)
    end
    local n, err = reclaim(db, dbtype, 1, { scope = CONFIRMED,
        execution = { id = execution.id, token = token, execution_seq = sequence } })
    return n == 1, err
end

return M
