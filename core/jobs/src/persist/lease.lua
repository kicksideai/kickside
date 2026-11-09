-- Lease heartbeat process. A worker that has claimed a long-running job spawns
-- one of these linked to itself; it ticks on an interval and extends the job's
-- lease_until so a reclaim sweep does not hand the job to another worker mid-run.
-- When the lease can no longer be extended (the job left running, e.g. it was
-- reclaimed or completed) the process exits on its own. The worker cancels it
-- when execution finishes.

local sql = require("sql")
local logger = require("logger")
local time = require("time")
local channel = require("channel")
local process = require("process")

local job_types = require("job_types")
local cfg = require("config")
local execution_policy = require("execution_policy")
local lifecycle = require("lifecycle")
local row_bytes = require("row_bytes")
local proc_supervisor = require("proc_supervisor")
local sql_boundary = require("sql_boundary")

local lease = {}

local function response_error(field: string): error
    return errors.new({message = "lease response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_lease_response", field = field}})
end

local HEARTBEAT_PROCESS_ID = "kickside.core.jobs.persist:lease_heartbeat"

-- Extend a job's lease. Returns true while the worker still owns the lease,
-- false once a guarded update affects no rows (lease lost / job no longer
-- running).
local function extend_lease(db: sql.DB, dbtype: string, job_id: string, lease_token: string,
        execution_seq: integer, timeout_seconds: number?): (boolean, error?, string?)
    if type(execution_seq) ~= "number" or execution_seq < 1 or execution_seq ~= math.floor(execution_seq) then
        return false, (errors.new({ message = "lease execution_seq is required", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = cfg.policy()
    if policy_err then return false, policy_err end
    if type(policy) ~= "table" then return false, response_error("policy") end
    local now = lifecycle.now_string(dbtype)
    if not timeout_seconds then
        local captured, err = execution_policy.load_from(db, {id = job_id, execution_seq = execution_seq})
        if err then return false, err end
        timeout_seconds = captured.lease_timeout_seconds
    end
    local lease_until = lifecycle.future_string(dbtype, timeout_seconds :: number)
    local tx, begin_err = sql_boundary.begin(db, "lease begin failed", "transaction", response_error)
    if begin_err then return false, begin_err end
    local size_err = row_bytes.check_update(tx, "kickside_job", job_id,
        { heartbeat_at = now, lease_until = lease_until },
        (policy :: any).max_row_bytes, "heartbeat_job")
    if size_err then return false, sql_boundary.rollback(tx, size_err, "lease rollback failed") end
    local ts = dbtype == sql.type.POSTGRES and "CAST(? AS TIMESTAMPTZ)" or "?"
    local result, err = sql.builder.update("kickside_job")
        :set("heartbeat_at", now)
        :set("lease_until", lease_until)
        :where(sql.builder.eq({ id = job_id, status = job_types.JOB_STATE.RUNNING,
            lease_token = lease_token, execution_seq = execution_seq }))
        :where("lease_until > " .. ts, now)
        :where("(last_error IS NULL OR lease_token IS NULL OR last_error <> (? || lease_token))",
            job_types.TERMINATION_PENDING_PREFIX)
        :run_with(tx)
        :exec()
    local count, count_err = sql_boundary.single_row_count(result, err, "lease extend failed", "rows_affected", response_error)
    if count_err then return false, sql_boundary.rollback(tx, count_err, "lease rollback failed") end
    if count == 0 then return false, sql_boundary.rollback(tx, nil, "lease rollback failed"), nil end
    local _, commit_err = tx:commit()
    if commit_err then return false, errors.wrap(commit_err, "lease commit failed") end
    return true, nil, lease_until
end
lease.extend_lease = extend_lease

-- A fresh claim already has a durable lease. Validate it without a write;
-- renew only when less than two heartbeat periods remain before dispatch.
function lease.validate_for_dispatch(db: sql.DB, dbtype: string, job: table): (boolean, error?, string?)
    local token = type(job) == "table" and job.lease_token or nil
    local seq = type(job) == "table" and tonumber(job.execution_seq) or nil
    if type(token) ~= "string" or token == "" or type(seq) ~= "number"
        or seq < 1 or seq ~= math.floor(seq) then
        return false, (errors.new({ message = "dispatch requires a fenced lease", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = execution_policy.read(job)
    if policy_err then return false, policy_err end
    if type(policy) ~= "table" then return false, response_error("policy") end
    local ts = dbtype == sql.type.POSTGRES and "CAST($5 AS TIMESTAMPTZ)" or "$5"
    local threshold = dbtype == sql.type.POSTGRES and "CAST($1 AS TIMESTAMPTZ)" or "$1"
    local now = lifecycle.now_string(dbtype)
    local soon = lifecycle.future_string(dbtype, 2 * (policy :: any).lease_heartbeat_ms / 1000)
    local rows, read_err = db:query("SELECT lease_until, CASE WHEN lease_until <= " .. threshold
        .. " THEN 1 ELSE 0 END AS needs_renewal FROM kickside_job"
        .. " WHERE id=$2 AND lease_token=$3 AND execution_seq=$4 AND status='running'"
        .. " AND lease_until > " .. ts
        .. " AND (last_error IS NULL OR last_error <> ($6 || lease_token))",
        { soon, job.id, token, seq, now, job_types.TERMINATION_PENDING_PREFIX })
    rows, read_err = sql_boundary.rows(rows, read_err, "dispatch lease validation failed", "read", response_error)
    if read_err then return false, read_err end
    if not rows or #rows > 1 then return false, response_error("read") end
    local row = rows[1]
    if not row then
        return false, job_types.lease_lost_error("dispatch lease lost")
    end
    if type(row) ~= "table" then return false, response_error("read") end
    local renewal, renewal_err = sql_boundary.number_value(row.needs_renewal, "read.needs_renewal", 0, true, false, response_error)
    if renewal_err then return false, renewal_err end
    if renewal ~= 0 and renewal ~= 1 then return false, response_error("read.needs_renewal") end
    local deadline = row.lease_until
    if type(deadline) ~= "string" or deadline == "" then return false, response_error("read.lease_until") end
    if renewal == 1 then
        local renewed, renew_err, renewed_until = extend_lease(db, dbtype, tostring(job.id), token, seq :: integer, policy.lease_timeout_seconds)
        if renew_err then return false, renew_err end
        if not renewed then
            return false, job_types.lease_lost_error("dispatch lease lost during renewal")
        end
        return true, nil, renewed_until
    end
    return true, nil, deadline
end

-- Spawn a linked heartbeat process that extends the given job's lease until
-- cancelled. Returns the heartbeat pid.
function lease.start(job: table, deadline: string?): (string?, error?)
    local job_id = tostring(job.id or "")
    local lease_token = tostring(job.lease_token or "")
    local execution_seq = tonumber(job.execution_seq)
    if job_id == "" or lease_token == "" or execution_seq == nil then
        return nil, (errors.new({ message = "job id, lease_token and execution_seq required for heartbeat", kind = errors.INVALID }) :: error)
    end
    local policy, policy_err = execution_policy.read(job)
    if policy_err then return nil, policy_err end
    if type(policy) ~= "table" then return nil, response_error("policy") end
    local pid, spawn_err = process.spawn_linked_monitored(HEARTBEAT_PROCESS_ID, cfg.process_host(), {
        job_id = job_id,
        lease_token = lease_token,
        execution_seq = execution_seq,
        interval_ms = policy.lease_heartbeat_ms,
        lease_timeout_seconds = policy.lease_timeout_seconds,
        lease_until = deadline or job.lease_until,
    })
    if spawn_err then return nil, errors.wrap(spawn_err, "failed to spawn lease heartbeat") end
    if type(pid) ~= "string" or pid == "" then return nil, response_error("process.id") end
    return pid, nil
end

-- The cancellation primitive stop routes through. Injectable because the process
-- global is an immutable table a test cannot spy on; a test swaps this to assert
-- the nil-guard without cancelling a real process.
lease._cancel = function(pid: string, grace: string): (boolean, error?)
    return process.cancel(pid, grace)
end

-- Cancel a running heartbeat process. Safe to call with nil.
function lease.stop(pid: string?): error?
    if not pid then return nil end
    local accepted, err = lease._cancel(pid, "1s")
    if err then return errors.wrap(err, "lease heartbeat cancellation failed") end
    if accepted ~= true then return response_error("process.cancel") end
    return nil
end

local function finish_heartbeat(db: sql.DB, primary: error?): ()
    local err = sql_boundary.release(db, primary, "lease heartbeat db release failed")
    if err then error(err) end
end

-- Heartbeat process entry point.
local function main(args: table): ()
    args = type(args) == "table" and args or {}
    local job_id = tostring(args.job_id or "")
    local lease_token = tostring(args.lease_token or "")
    local execution_seq = tonumber(args.execution_seq)
    if job_id == "" or lease_token == "" or execution_seq == nil then
        error(errors.new({kind = errors.INVALID, retryable = false, message = "lease heartbeat identity is required",
            details = {code = "job_lease_identity"}}))
    end

    local db, db_err = sql.get(cfg.db_id())
    if db_err then error(errors.wrap(db_err, "lease heartbeat db connect failed")) end
    if type(db) ~= "table" and type(db) ~= "userdata" then error(response_error("database")) end
    local dbtype_raw, dbtype_err = db:type()
    if dbtype_err then finish_heartbeat(db, errors.wrap(dbtype_err, "lease heartbeat db type failed")); return end
    if type(dbtype_raw) ~= "string" or (dbtype_raw ~= sql.type.SQLITE and dbtype_raw ~= sql.type.POSTGRES) then
        finish_heartbeat(db, response_error("database.type")); return
    end
    local dbtype = dbtype_raw

    local interval_ms = tonumber(args.interval_ms)
    local timeout_seconds = tonumber(args.lease_timeout_seconds)
    if not interval_ms or not timeout_seconds then
        local policy, policy_err = execution_policy.load_from(db, {id = job_id, execution_seq = execution_seq})
        if policy_err then finish_heartbeat(db, policy_err); return end
        if type(policy) ~= "table" then finish_heartbeat(db, response_error("policy")); return end
        interval_ms = (policy :: any).lease_heartbeat_ms
        timeout_seconds = (policy :: any).lease_timeout_seconds
    end
    local lease_deadline, parse_err = proc_supervisor.parse_deadline(args.lease_until)
    if parse_err then finish_heartbeat(db, parse_err); return end
    if type(lease_deadline) ~= "table" and type(lease_deadline) ~= "userdata" then
        finish_heartbeat(db, response_error("deadline")); return
    end
    local function renewal_at(deadline: any): any
        return deadline:add(((interval_ms :: number) - (timeout_seconds :: number) * 1000) * time.MILLISECOND)
    end
    local next_renewal = renewal_at(lease_deadline)
    local events_ch = process.events()
    local failures = 0
    while true do
        local remaining_ns = tonumber(next_renewal:sub(time.now()):nanoseconds()) or 0
        if remaining_ns <= 0 then remaining_ns = 1000000 end
        local tick = time.after(tostring(math.max(1, math.ceil(remaining_ns / 1000000))) .. "ms")
        local result = channel.select({ events_ch:case_receive(), tick:case_receive() })
        if result.channel == events_ch then
            local event = result.value
            if type(event) == "table" and event.kind == process.event.CANCEL then
                finish_heartbeat(db, nil)
                return
            end
        elseif result.channel == tick then
            local alive, extend_err, lease_until = extend_lease(db, dbtype, job_id, lease_token, execution_seq :: integer, timeout_seconds)
            if extend_err then
                logger:warn("lease_heartbeat extend failed job=" .. job_id .. ": " .. tostring(extend_err))
                failures = failures + 1
                if failures >= 3 then finish_heartbeat(db, errors.wrap(extend_err, "lease heartbeat renewal attempts exhausted")); return end
                next_renewal = time.now():add(math.min(1000 * failures, interval_ms :: number) * time.MILLISECOND)
            elseif not alive then
                local _, notify_err = proc_supervisor.notify(job_id, lease_token,
                    execution_seq :: integer, "revoked", nil)
                finish_heartbeat(db, notify_err)
                return
            else
                local _, notify_err = proc_supervisor.notify(job_id, lease_token,
                    execution_seq :: integer, "lease_renewed", lease_until)
                if notify_err then
                    finish_heartbeat(db, notify_err)
                    return
                end
                local parsed, deadline_err = proc_supervisor.parse_deadline(lease_until)
                if deadline_err then finish_heartbeat(db, deadline_err); return end
                if type(parsed) ~= "table" and type(parsed) ~= "userdata" then
                    finish_heartbeat(db, response_error("committed_deadline")); return
                end
                lease_deadline = parsed
                next_renewal = renewal_at(lease_deadline)
                failures = 0
            end
        end
    end
end

lease.main = main

return lease
