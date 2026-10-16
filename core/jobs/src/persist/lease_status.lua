-- Lease ownership evidence and lost-lease classification.
local sql = require("sql")
local clock = require("clock")
local job_types = require("job_types")
local lease_status = {}
type Executor = sql.DB | sql.Transaction
local function response_error(field: string): error
    return errors.new({message = "lease status response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_lease_status_response", field = field}})
end

-- True only while this attempt still owns the job: its lease row is running
-- under its token, or its own child already finalized its run row while the
-- monitored EXIT is still in flight. Judging by status alone misreads a
-- correctly completing child as a lost lease. A lease another attempt or a
-- cancel took leaves this attempt's run row running, and a reclaim closes it
-- as lease_lost; both read as lost. run_id is the claimed attempt's run row; without it
-- only the lease row is consulted.
local function job_still_running(db_or_tx: Executor, job: table, dbtype: string?, run_id: string?): (boolean, error?, string?)
    local id = tostring(job.id or "")
    local lease_token = tostring(job.lease_token or "")
    local execution_seq = tonumber(job.execution_seq)
    if id == "" or lease_token == "" or execution_seq == nil then
        return false, (errors.new({ message = "job id, lease token, and execution sequence required", kind = errors.INVALID }) :: error)
    end
    local now = clock.now(dbtype or sql.type.SQLITE)
    local rows, err = sql.builder.select("id", "lease_until")
        :from("kickside_job")
        :where(sql.builder.eq({ id = id, status = job_types.JOB_STATE.RUNNING,
            lease_token = lease_token, execution_seq = execution_seq }))
        :where("lease_until IS NOT NULL AND lease_until > ?", now)
        :limit(1)
        :run_with(db_or_tx)
        :query()
    if err then
        return false, errors.wrap(err, "job active check failed")
    end
    if type(rows) ~= "table" then return false, response_error("active.rows") end
    if #rows > 0 then
        if type(rows[1]) ~= "table" or (rows[1] :: any).lease_until == nil then
            return false, response_error("active.lease_until")
        end
        return true, nil, tostring((rows[1] :: any).lease_until)
    end
    if type(run_id) ~= "string" or run_id == "" then
        return false, nil
    end
    local runs, run_err = sql.builder.select("status")
        :from("kickside_job_run")
        :where(sql.builder.eq({ id = run_id }))
        :limit(1)
        :run_with(db_or_tx)
        :query()
    if run_err then
        return false, errors.wrap(run_err, "job run check failed"), nil
    end
    if type(runs) ~= "table" then return false, response_error("run.rows") end
    local status: string? = nil
    if runs[1] ~= nil then
        if type(runs[1]) ~= "table" or type((runs[1] :: any).status) ~= "string" or (runs[1] :: any).status == "" then
            return false, response_error("run.status")
        end
        status = (runs[1] :: any).status
    end
    if status and status ~= job_types.RUN_STATE.RUNNING and status ~= job_types.RUN_STATE.LEASE_LOST then
        return true, nil, nil
    end
    return false, nil, nil
end
lease_status.job_still_running = job_still_running

return lease_status
