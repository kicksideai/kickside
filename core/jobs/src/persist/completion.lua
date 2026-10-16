-- Public fenced completion on the jobs/core executor. The caller-provided
-- transaction variant never commits; both paths use this one implementation.
local sql = require("sql")
local uuid = require("uuid")
local clock = require("clock")
local time = require("time")
local cfg = require("config")
local row_bytes = require("row_bytes")
local job_types = require("job_types")
local worker_marker = require("worker_marker")

local completion = {}

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID }) :: error)
end

local function response_error(field: string): error
    return errors.new({message = "job completion response is invalid", kind = errors.INTERNAL,
        retryable = false, details = {code = "job_completion_response", field = field}})
end

local function rows_error(rows: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(rows) ~= "table" then return response_error(field) end
    return nil
end

local function write_error(result: any, err: error?, operation: string, field: string): error?
    if err then return errors.wrap(err, operation) end
    if type(result) ~= "table" or type(result.rows_affected) ~= "number" then return response_error(field) end
    return nil
end

local function flag(value: any): boolean
    return value == true or tonumber(value) == 1
end

local function validate(id: any, lease: any, options: any): error?
    if type(id) ~= "string" or id == "" then return invalid("completion requires a job id") end
    if type(lease) ~= "table" or type(lease.token) ~= "string" or lease.token == ""
        or type(lease.execution_seq) ~= "number" or lease.execution_seq < 1
        or lease.execution_seq ~= math.floor(lease.execution_seq) then
        return invalid("completion requires a lease token and positive execution_seq")
    end
    if type(options) ~= "table" then return invalid("completion options must be an object") end
    if options.rearm ~= nil and (type(options.rearm) ~= "string" or options.rearm == "") then
        return invalid("rearm must be a timestamp or null")
    end
    if options.demand_satisfied ~= nil and options.demand_satisfied ~= true then
        return invalid("demand_satisfied must be true or absent")
    end
    if options.defer_demand ~= nil and options.defer_demand ~= true then
        return invalid("defer_demand must be true or absent")
    end
    if options.defer_demand and options.rearm == nil then
        return invalid("defer_demand requires rearm")
    end
    if options.tier ~= nil and options.tier ~= "live" and options.tier ~= "backfill"
        and options.tier ~= "maintenance" then
        return invalid("tier must be live, backfill or maintenance")
    end
    if options.record ~= nil then
        if type(options.record) ~= "table" or (options.record.status ~= "completed"
            and options.record.status ~= "failed" and options.record.status ~= "parked") then
            return invalid("record.status must be completed, failed or parked")
        end
        if options.record.error ~= nil and type(options.record.error) ~= "string" then
            return invalid("record.error must be a string")
        end
    end
    return nil
end

local function settled_run(tx: sql.Transaction, id: string, lease: table): (boolean, error?)
    local rows, err = tx:query([[SELECT lease_token,status FROM kickside_job_run
        WHERE job_id=$1 AND execution_seq=$2]], { id, lease.execution_seq })
    local read_err = rows_error(rows, err, "completion settled-run lookup failed", "settled_run.rows")
    if read_err then return false, read_err end
    local run = rows[1]
    local status = tostring(run and run.status or "")
    return tostring(run and run.lease_token or "") == lease.token
        and (status == "completed" or status == "failed" or status == "parked"), nil
end

-- Failure finalization also observes owner settlement after a post-commit error.
-- This is read-only: an active, cancelled or later lease is never settled here.
function completion.worker_settled_tx(tx: sql.Transaction, id: string, lease: table): (boolean, error?)
    local bad = validate(id, lease, {})
    if bad then return false, bad end
    local rows, err = tx:query([[SELECT status,lease_token,execution_seq FROM kickside_job WHERE id=$1]], { id })
    local read_err = rows_error(rows, err, "completion settled-job lookup failed", "settled_job.rows")
    if read_err then return false, read_err end
    local row = rows[1]
    if not row or (row.status ~= "done" and row.status ~= "pending" and row.status ~= "dead")
        or tostring(row.lease_token or "") ~= "" or tonumber(row.execution_seq) ~= lease.execution_seq then
        return false, nil
    end
    return settled_run(tx, id, lease)
end

local function complete_tx_impl(tx: sql.Transaction, id: string, lease: table, options: table,
        allow_settled_lease: boolean): (table?, error?)
    local bad = validate(id, lease, options)
    if bad then return nil, bad end
    local policy, policy_err = cfg.policy()
    if policy_err then return nil, policy_err end
    if type(policy) ~= "table" then return nil, response_error("policy") end
    local raw_type, type_err = tx:db_type()
    if type_err then return nil, errors.wrap(type_err, "completion dialect unavailable") end
    if type(raw_type) ~= "string" or raw_type == "" then return nil, response_error("database.type") end
    local dbtype = raw_type :: string
    local rearm: string? = nil
    if options.rearm ~= nil then
        local parsed, parse_err = time.parse(time.RFC3339, options.rearm)
        if parse_err and errors.is(parse_err, errors.INVALID) then
            -- SQLite's canonical clock text has no zone marker; it denotes UTC,
            -- not the process's local timezone.
            parsed, parse_err = time.parse("2006-01-02 15:04:05.000000Z07:00", options.rearm .. "Z")
        end
        if parse_err then return nil, errors.wrap(parse_err, "rearm must be a UTC timestamp") end
        if type(parsed) ~= "userdata" then return nil, response_error("rearm") end
        rearm = clock.format(parsed, dbtype)
    end
    local history_columns = { "id", "worker_pid", "started_at", "duration_ms", "result_json", "actions_json",
        "created_at", "updated_at", "lease_token", "status" }
    local history_select: { string } = {}
    for _, column in ipairs(history_columns) do history_select[#history_select + 1] = "r." .. column .. " AS run_" .. column end
    local job_query = "SELECT * FROM kickside_job WHERE id=$1"
    local run_query = "SELECT * FROM kickside_job_run WHERE job_id=$1 AND execution_seq=$2"
    local statement: string
    if dbtype == sql.type.POSTGRES then
        -- The job lock precedes its history lock. A concurrent history update
        -- is refreshed by the locked lateral read before row-size validation.
        statement = "WITH held AS MATERIALIZED (" .. job_query .. " FOR UPDATE) SELECT held.*,"
            .. table.concat(history_select, ",") .. " FROM held LEFT JOIN LATERAL ("
            .. run_query .. " FOR UPDATE) r ON TRUE"
    else
        statement = "WITH held AS (" .. job_query .. ") SELECT held.*,"
            .. table.concat(history_select, ",")
            .. " FROM held LEFT JOIN kickside_job_run r ON r.job_id=held.id AND r.execution_seq=$2"
    end
    local rows, select_err = tx:query(statement, { id, lease.execution_seq })
    local read_err = rows_error(rows, select_err, "completion lookup failed", "job.rows")
    if read_err then return nil, read_err end
    local row = rows[1]
    if not row then
        return nil, (errors.new({ message = "job not found", kind = errors.NOT_FOUND }) :: error)
    end
    local owner = { kind = row.owner_kind, id = row.owner_id }
    local prior_history: table? = nil
    if row.run_id ~= nil then prior_history = {} end
    for _, column in ipairs(history_columns) do
        if prior_history then prior_history[column] = row["run_" .. column] end
        row["run_" .. column] = nil
    end
    if row.status ~= "running" or tostring(row.lease_token or "") ~= lease.token
        or tonumber(row.execution_seq) ~= lease.execution_seq then
        -- An owner may settle this lease inside its transaction before returning
        -- to the generic worker. The worker's ordinary completion call is then
        -- an idempotent no-op only when the exact execution sequence and lease
        -- token already have terminal run history. A later lease, cancellation,
        -- or an unsettled run remains fenced as lease loss.
        local row_status = tostring(row.status or "")
        local row_token = tostring(row.lease_token or "")
        if allow_settled_lease and (row_status == "done" or row_status == "pending" or row_status == "dead")
            and row_token == "" and tonumber(row.execution_seq) == lease.execution_seq then
            local status = tostring(prior_history and prior_history.status or "")
            if prior_history and tostring(prior_history.lease_token or "") == lease.token
                and (status == "completed" or status == "failed" or status == "parked") then
                return { status = "already_completed", job_id = id,
                    execution_seq = lease.execution_seq, run_history_settled = true,
                    already_completed = true }, nil
            end
        end
        return nil, job_types.lease_lost_error("lease lost while completing job")
    end
    if row.last_error == job_types.TERMINATION_PENDING_PREFIX .. lease.token then
        return nil, (errors.new({ message = "lease is fenced for child termination", kind = errors.CONFLICT }) :: error)
    end

    local now = clock.now(dbtype)
    local history_id = prior_history and tostring(prior_history.id) or uuid.v7()
    local record = options.record or { status = "completed" }
    local history_row = {
        id = history_id, job_id = id, owner_kind = owner.kind, owner_id = owner.id,
        thread_id = row.thread_id, job_type = row.job_type,
        attempt_no = math.max(1, math.floor(tonumber(row.attempts) or 0)),
        worker_pid = prior_history and prior_history.worker_pid or "",
        execution_seq = lease.execution_seq, status = record.status,
        lease_token = lease.token,
        started_at = prior_history and tostring(prior_history.started_at) or now,
        finished_at = now, duration_ms = prior_history and prior_history.duration_ms or 0,
        error_text = record.error or "", result_json = prior_history and prior_history.result_json or "{}",
        actions_json = prior_history and prior_history.actions_json or "{}",
        created_at = prior_history and tostring(prior_history.created_at) or now,
        updated_at = prior_history and tostring(prior_history.updated_at) or now,
    }
    local size_err = row_bytes.check(history_row, (policy :: any).max_row_bytes,
        owner.kind .. ":" .. owner.id, "complete_job")
    if size_err then return nil, size_err end
    local slot = flag(row.slot)
    local control = flag(row.wake_control_pending)
    local parked_record = options.record ~= nil and options.record.status == "parked"
    local scheduled: string? = nil
    if control then
        scheduled = now
    elseif not parked_record then
        if slot and row.wake_demand_at ~= nil and not options.defer_demand and not options.demand_satisfied then
            scheduled = now
        elseif rearm ~= nil then
            scheduled = rearm
        end
    end
    local pending = slot or scheduled ~= nil
    local status = pending and "pending" or "done"
    local outcome = scheduled ~= nil and "rearmed" or (pending and "parked" or "completed")
    local wake_enabled = control or (not parked_record and flag(row.wake_enabled))
    local job_size_err = row_bytes.check_update(tx, "kickside_job", id, {
        status = status, queue_tier = options.tier or row.queue_tier,
        scheduled_at = scheduled or row_bytes.NULL,
        finished_at = pending and row_bytes.NULL or now,
        last_error = options.record and options.record.error or row_bytes.NULL,
        attempts = 0, lease_token = row_bytes.NULL, lease_until = row_bytes.NULL,
        heartbeat_at = row_bytes.NULL, wake_enabled = wake_enabled,
        wake_demand_at = row_bytes.NULL, wake_control_pending = false,
        dispatch_requested_at = scheduled ~= nil and row.dispatch_requested_at or row_bytes.NULL,
    }, (policy :: any).max_row_bytes, "complete_job", row)
    if job_size_err then return nil, job_size_err end
    local args: { any } = { options.tier or row.queue_tier }
    local schedule_sql = "NULL"
    if scheduled ~= nil then
        args[#args + 1] = scheduled
        schedule_sql = "$" .. tostring(#args)
    end
    local error_sql = "NULL"
    if options.record ~= nil and options.record.error ~= nil then
        args[#args + 1] = options.record.error
        error_sql = "$" .. tostring(#args)
    end
    local finished_sql = "NULL"
    if not pending then
        args[#args + 1] = now
        finished_sql = "$" .. tostring(#args)
    end
    args[#args + 1] = id
    local id_sql = "$" .. tostring(#args)
    args[#args + 1] = lease.token
    local token_sql = "$" .. tostring(#args)
    args[#args + 1] = lease.execution_seq
    local seq_sql = "$" .. tostring(#args)
    local update_sql = [[UPDATE kickside_job SET status = ']] .. status .. [[',
        queue_tier = $1, scheduled_at = ]] .. schedule_sql .. [[,
        finished_at = ]] .. finished_sql .. [[,
        last_error = ]] .. error_sql .. [[,
        attempts = 0, lease_token = NULL, lease_until = NULL, heartbeat_at = NULL,
        wake_enabled = ]] .. (wake_enabled and "TRUE" or "FALSE") .. [[,
        wake_demand_at = NULL, wake_control_pending = FALSE,
        dispatch_requested_at = ]] .. (scheduled ~= nil and "dispatch_requested_at" or "NULL") .. [[
        WHERE id = ]] .. id_sql .. [[ AND status = 'running' AND lease_token = ]] .. token_sql
        .. [[ AND execution_seq = ]] .. seq_sql
    -- Every claim has lifetime history, including a self-completing idle slot.
    -- The same upsert handles a claim record already started by the worker and
    -- a directly completed leased slot; it preserves the original started_at.
    local history_args: { any } = { history_id, id, owner.kind, owner.id }
    local thread_sql = "NULL"
    if row.thread_id ~= nil then
        history_args[#history_args + 1] = row.thread_id
        thread_sql = "$" .. tostring(#history_args)
    end
    history_args[#history_args + 1] = row.job_type
    local type_sql = "$" .. tostring(#history_args)
    history_args[#history_args + 1] = math.max(1, math.floor(tonumber(row.attempts) or 0))
    local attempt_sql = "$" .. tostring(#history_args)
    history_args[#history_args + 1] = lease.execution_seq
    local history_seq_sql = "$" .. tostring(#history_args)
    history_args[#history_args + 1] = record.status
    local status_sql = "$" .. tostring(#history_args)
    history_args[#history_args + 1] = lease.token
    local history_token_sql = "$" .. tostring(#history_args)
    history_args[#history_args + 1] = now
    local now_sql = "$" .. tostring(#history_args)
    local record_error_sql = "NULL"
    if record.error ~= nil then
        history_args[#history_args + 1] = record.error
        record_error_sql = "$" .. tostring(#history_args)
    end
    local history_values = { "$1", "$2", "$3", "$4", thread_sql, type_sql, attempt_sql,
        history_seq_sql, status_sql, history_token_sql, now_sql, now_sql, record_error_sql }
    local history_prefix = [[INSERT INTO kickside_job_run
        (id,job_id,owner_kind,owner_id,thread_id,job_type,attempt_no,execution_seq,status,lease_token,started_at,finished_at,error_text) ]]
    local history_suffix = [[ ON CONFLICT (job_id,execution_seq) DO UPDATE SET
        status=excluded.status,finished_at=excluded.finished_at,error_text=excluded.error_text]]
    if dbtype == sql.type.POSTGRES then
        local offset = #args
        local kinds = { "uuid", "uuid", "text", "text", "uuid", "text", "integer", "bigint", "text", "text", "timestamptz", "timestamptz", "text" }
        for index, value in ipairs(history_values) do
            local shifted = "NULL"
            if value ~= "NULL" then
                local index = tonumber(value:sub(2))
                if index == nil then return nil, response_error("history.placeholder") end
                shifted = "$" .. tostring(index + offset)
            end
            history_values[index] = "CAST(" .. shifted .. " AS " .. kinds[index] .. ")"
        end
        local history_sql = history_prefix .. "SELECT " .. table.concat(history_values, ",")
            .. " FROM eligible WHERE (SELECT COUNT(*) FROM cleared)>=0" .. history_suffix
        local combined = "WITH eligible AS MATERIALIZED (SELECT id FROM kickside_job WHERE id=" .. id_sql
            .. " AND status='running' AND lease_token=" .. token_sql .. " AND execution_seq=" .. seq_sql
            .. "), cleared AS (UPDATE kickside_job_worker SET current_job_id=NULL WHERE current_job_id IN (SELECT id FROM eligible) RETURNING id), history AS ("
            .. history_sql .. " RETURNING id) " .. update_sql .. " AND (SELECT COUNT(*) FROM history)=1"
        for _, value in ipairs(history_args) do args[#args + 1] = value end
        local updated, update_err = tx:execute(combined, args)
        local transition_err = write_error(updated, update_err, "completion transition failed", "transition")
        if transition_err then return nil, transition_err end
        if updated.rows_affected ~= 1 then
            return nil, job_types.lease_lost_error("lease lost while completing job")
        end
    else
        local updated, update_err = tx:execute(update_sql, args)
        local transition_err = write_error(updated, update_err, "completion update failed", "job.update")
        if transition_err then return nil, transition_err end
        if updated.rows_affected ~= 1 then
            return nil, job_types.lease_lost_error("lease lost while completing job")
        end
        local marker_err = worker_marker.clear(tx, id)
        if marker_err then return nil, marker_err end

        local history_sql = history_prefix .. "VALUES (" .. table.concat(history_values, ",") .. ")" .. history_suffix
        local history_result, history_err = tx:execute(history_sql, history_args)
        local history_write_err = write_error(history_result, history_err, "completion history failed", "history.write")
        if history_write_err then return nil, history_write_err end
        if history_result.rows_affected ~= 1 then return nil, response_error("history.write") end
    end
    return { status = outcome, job_id = id, execution_seq = lease.execution_seq,
        scheduled_at = scheduled, run_history_settled = true, owner_locator = owner }, nil
end

function completion.complete_tx(tx: sql.Transaction, id: string, lease: table, options: table): (table?, error?)
    return complete_tx_impl(tx, id, lease, options, false)
end

-- Generic worker finalization observes an owner transaction that settled this
-- exact lease while executing. Other callers retain the strict lease conflict.
function completion.complete_worker_tx(tx: sql.Transaction, id: string, lease: table,
        options: table): (table?, error?)
    return complete_tx_impl(tx, id, lease, options, true)
end

return completion
