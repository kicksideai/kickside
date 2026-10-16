local row_bytes = require("row_bytes")
local sql = require("sql")
local M = {}

local function flag(value: any): boolean
    return value == true or tonumber(value) == 1
end

function M.heartbeat(exec: any, id: string, now: string, until_at: string, cap: integer): error?
    return row_bytes.check_update(exec, "kickside_job", id,
        { heartbeat_at = now, lease_until = until_at }, cap, "heartbeat_job")
end

function M.complete(exec: any, id: string, opts: table?, now: string, cap: integer): error?
    return row_bytes.check_update(exec, "kickside_job", id, function(row)
        local rearm = type(opts and opts.next_run_at) == "string" and opts.next_run_at ~= ""
        local terminal = opts and opts.terminal == true
        local control = flag(row.wake_control_pending)
        local demand = row.wake_demand_at ~= nil
        local slot = flag(row.slot)
        local pending = rearm or (slot and (control or demand)) or (slot and not terminal)
        local scheduled = (slot and (control or demand)) and now
            or (rearm and opts.next_run_at or row_bytes.NULL)
        return { status = pending and "pending" or "done",
            lease_token = row_bytes.NULL, lease_until = row_bytes.NULL,
            heartbeat_at = row_bytes.NULL, finished_at = pending and row_bytes.NULL or now,
            attempts = pending and 0 or row.attempts,
            scheduled_at = scheduled, wake_enabled = control and true or row.wake_enabled,
            wake_demand_at = row_bytes.NULL, wake_control_pending = false }
    end, cap, "complete_job")
end

function M.fail(exec: any, id: string, text: string?, failure_class: string?, now: string,
    retry_at: string?, cap: integer): error?
    return row_bytes.check_update(exec, "kickside_job", id, function(row)
        local control = flag(row.wake_control_pending)
        local deterministic = failure_class == "deterministic"
        local terminal = not control and not flag(row.slot) and (deterministic
            or (tonumber(row.attempts) or 0) >= (tonumber(row.max_attempts) or 0))
        local scheduled = control and now or ((deterministic or terminal) and row_bytes.NULL or retry_at)
        local wake_enabled = row.wake_enabled
        if deterministic or terminal then wake_enabled = false end
        if control then wake_enabled = true end
        return { status = terminal and "dead" or "pending", finished_at = terminal and now or row_bytes.NULL,
            lease_token = row_bytes.NULL,
            lease_until = row_bytes.NULL, heartbeat_at = row_bytes.NULL,
            last_error = text or row_bytes.NULL, scheduled_at = scheduled,
            wake_enabled = wake_enabled, attempts = control and 0 or row.attempts,
            wake_demand_at = row_bytes.NULL, wake_control_pending = false }
    end, cap, "fail_job")
end

function M.cancel(exec: any, id: string, identity: string, job_type: string,
    reason: string, finished_at: string, cap: integer): error?
    local candidates = sql.builder.select("id"):from("kickside_job")
        :where("status IN ('pending','running')")
    if id ~= "" then
        candidates = candidates:where(sql.builder.eq({ id = id }))
    else
        candidates = candidates:where(sql.builder.eq({ job_identity = identity }))
        if job_type ~= "" then candidates = candidates:where(sql.builder.eq({ job_type = job_type })) end
    end
    local rows, err = candidates:run_with(exec):query()
    if err then return errors.wrap(err, "cancel candidates failed") end
    if type(rows) ~= "table" then
        return errors.new({message = "cancel candidates response is invalid", kind = errors.INTERNAL,
            retryable = false, details = {code = "job_row_mutation_response", field = "candidates.rows"}})
    end
    for _, row in ipairs(rows) do
        local size_err = row_bytes.check_update(exec, "kickside_job", row.id,
            { status = "cancelled", lease_token = row_bytes.NULL,
                lease_until = row_bytes.NULL, heartbeat_at = row_bytes.NULL,
                last_error = reason, finished_at = finished_at }, cap, "cancel_jobs")
        if size_err then return size_err end
    end
    return nil
end

return M
