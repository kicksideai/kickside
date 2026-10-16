-- Own the supervised execution child, its token-qualified owner registration,
-- and the durable quarantine used when termination cannot be confirmed.

local sql = require("sql")
local logger = require("logger")
local time = require("time")
local process = require("process")

local job_types = require("job_types")
local cfg = require("config")
local lease_status = require("lease_status")
local lifecycle_cancel = require("lifecycle_cancel")
local worker_fence = require("worker_fence")
local proc_supervisor = require("proc_supervisor")
local worker_dispatch = require("worker_dispatch")
local boundary = require("sql_boundary")

local worker = {}
local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "worker child response is invalid",
        details = {code = "job_child_response", field = field}})
end
local PROC_TIMEOUT_MARKER = worker_dispatch.PROC_TIMEOUT_MARKER
worker.PROC_TIMEOUT_MARKER = PROC_TIMEOUT_MARKER

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

-- Returns (err, control, retire): retire reports that the supervising loop's
-- code became outdated while the execution ran to its own end.
local function supervise_job_child(job: table, run_id: string?, heartbeat_pid: string?, lifecycle_events: any?): (error?, string?, boolean)
    local policy, policy_err = cfg.policy()
    if policy_err or not policy then return policy_err, nil, false end
    local max_execution_ms, duration_err = worker_dispatch.resolve_max_execution_ms(job, policy)
    if duration_err then return duration_err, nil, false end
    local host = trim(cfg.process_host())
    if host == "" then
        return (errors.new({ message = "job child requires a process host", kind = errors.INTERNAL }) :: error), nil, false
    end
    local child_pid = ""
    local events_ch = lifecycle_events or process.events()
    local control_ch = process.listen(proc_supervisor.CONTROL_TOPIC)
    local supervisor_name = proc_supervisor.execution_name(tostring(job.id), tostring(job.lease_token))
    local registered, register_err = process.registry.register(supervisor_name, nil, process.registry.CONSISTENT)
    if not registered then
        process.unlisten(control_ch)
        return register_err and errors.wrap(register_err, "job supervisor registration failed") or response_error("registration"), nil, false
    end
    local deadline: any = nil
    local lease_deadline: any = nil
    local function read_lease(): (boolean, error?, string?)
        local db, err = sql.get(cfg.db_id())
        if err then return false, errors.wrap(err, "job liveness db unavailable"), nil end
        if not db then return false, response_error("database"), nil end
        local raw_type, type_err = db:type()
        if type_err then return false, boundary.release(db, errors.wrap(type_err, "job liveness db type failed"), "job liveness db release failed"), nil end
        local active, check_err, lease_until = lease_status.job_still_running(db, job, tostring(raw_type), run_id)
        return active == true, boundary.release(db, check_err, "job liveness db release failed"), lease_until
    end
    -- Register and listen before the authoritative read. A committed cancel
    -- either reaches this owner or makes validation fail before the child starts.
    local initially_active, initial_err, initial_until = read_lease()
    if initial_err or not initially_active then
        local settle_db, settle_err = sql.get(cfg.db_id())
        if settle_err or not settle_db then
            process.registry.unregister(supervisor_name, process.registry.CONSISTENT)
            process.unlisten(control_ch)
            return settle_err or (errors.new({ message = "job cancellation settle db unavailable", kind = errors.UNAVAILABLE, retryable = true }) :: error), nil, false
        end
        local settle_type, settle_type_err = settle_db:type()
        local settled, finish_err = false, nil
        if not settle_type_err then
            settled, finish_err = lifecycle_cancel.finish_cancellation(settle_db, tostring(settle_type), {
                id = job.id, token = job.lease_token, execution_seq = job.execution_seq,
            })
        end
        local settle_cause = settle_type_err and errors.wrap(settle_type_err, "job cancellation settle dialect unavailable") or finish_err
        local release_err = boundary.release(settle_db, settle_cause, "job cancellation settle db release failed")
        process.registry.unregister(supervisor_name, process.registry.CONSISTENT)
        process.unlisten(control_ch)
        if release_err then return release_err, nil, false end
        if initial_err then return initial_err, nil, false end
        if settled then return nil, "revoked", false end
        return job_types.lease_lost_error("lease ended before execution"), nil, false
    end
    lease_deadline, initial_err = proc_supervisor.parse_deadline(initial_until)
    if initial_err or not lease_deadline then
        process.registry.unregister(supervisor_name, process.registry.CONSISTENT)
        process.unlisten(control_ch)
        return initial_err or (errors.new({ message = "job lease deadline missing", kind = errors.INTERNAL }) :: error), nil, false
    end
    local hooks = {
        spawn = function(): (string?, error?)
            -- The child learns the instant its execution ceiling ends, so its
            -- work can finish with its own outcome before the ceiling.
            local ceiling = time.now():add((max_execution_ms :: integer) * time.MILLISECOND)
            job.execution_deadline = ceiling:utc():format(time.RFC3339)
            local pid, err = process.spawn_linked_monitored("kickside.core.jobs.service:job_child", host, { job = job, run_id = run_id })
            if err then return nil, errors.wrap(err, "job child spawn failed") end
            if not pid then return nil, response_error("process.id") end
            child_pid = tostring(pid)
            deadline = ceiling
            return child_pid, nil
        end,
        terminate = function(pid: string): () process.terminate(pid) end,
        prepare_termination = function(): error?
            local fence_db, err = sql.get(cfg.db_id())
            if err or not fence_db then
                return err and errors.wrap(err, "job termination fence db unavailable") or response_error("fence.database")
            end
            local fence_err = worker_fence.prepare_termination(fence_db, job)
            return boundary.release(fence_db, fence_err, "job termination fence db release failed")
        end,
        check_lease = function(): (boolean, string?, error?)
            local active, check_err, until_at = read_lease()
            return active, until_at, check_err
        end,
        set_lease_deadline = function(value: any): () lease_deadline = value end,
        wait = function(): table
            local signal = proc_supervisor.wait_once(events_ch, deadline, child_pid,
                heartbeat_pid, control_ch, lease_deadline)
            if signal.kind ~= "control" or type(signal.message) ~= "table" then return signal end
            local message = signal.message :: any
            if tostring(message.lease_token or "") ~= tostring(job.lease_token or "")
                or tonumber(message.execution_seq) ~= tonumber(job.execution_seq) then
                return { kind = "other" }
            end
            if message.kind == "revoked" then return { kind = "revoked" } end
            if message.kind == "lease_renewed" then
                local renewed, parse_err = proc_supervisor.parse_deadline(message.lease_until)
                if parse_err or not renewed then return { kind = "lease_expired" } end
                lease_deadline = renewed
                return { kind = "lease_renewed" }
            end
            return { kind = "other" }
        end,
        wait_termination = function(grace_deadline: any): table
            return proc_supervisor.wait_once(events_ch, nil, child_pid, heartbeat_pid,
                nil, nil, grace_deadline)
        end,
    }
    local pid, spawn_err = hooks.spawn()
    if spawn_err or not pid then
        process.registry.unregister(supervisor_name, process.registry.CONSISTENT)
        process.unlisten(control_ch)
        return spawn_err, nil, false
    end
    local output, err, control, retire = proc_supervisor.supervise_loop(hooks, pid, {
        interpret_exit = function(value: any): (table?, error?)
            local direct_err = job_types.native_error(value)
            if direct_err then return nil, errors.wrap(direct_err, "job child failed") end
            local payload = value
            if type(value) == "table" then
                local exit_err = (value :: any).error
                if exit_err ~= nil then
                    local native = job_types.native_error(exit_err)
                    if native then return nil, errors.wrap(native, "job child failed") end
                    return nil, (errors.new({ message = "job child EXIT error is not native", kind = errors.INVALID }) :: error)
                end
                payload = (value :: any).value or value
            end
            local payload_err = job_types.native_error(payload)
            if payload_err then return nil, errors.wrap(payload_err, "job child failed") end
            if type(payload) ~= "table" then
                return nil, (errors.new({ message = "job child returned invalid status envelope", kind = errors.INVALID }) :: error)
            end
            local status = payload :: any
            if status.ok == false then
                local native, decode_err = job_types.error_from_data(status.error_native)
                if decode_err then return nil, decode_err end
                if native then return nil, errors.wrap(native, "job child failed") end
                return nil, (errors.new({ message = "job child failed without native error transport", kind = errors.INVALID }) :: error)
            end
            if status.ok == true then return status, nil end
            return nil, (errors.new({ message = "job child returned invalid status envelope", kind = errors.INVALID }) :: error)
        end,
        crash_message = "job child crashed: ",
        timeout_message = PROC_TIMEOUT_MARKER,
        cancel_message = "job worker shutting down",
        lease_lost_message = "job no longer running",
        lease_lost_error = job_types.lease_lost_error("job no longer running"),
        terminate_grace_ms = proc_supervisor.TERMINATE_GRACE_MS,
        on_fence_retry = function(fence_err: error, attempt: integer)
            logger:warn("job termination fence retry " .. tostring(attempt) .. ": " .. tostring(fence_err))
        end,
        on_fence_failure = function(fence_err: error)
            logger:error("job termination fence recovery exhausted: " .. tostring(fence_err))
        end,
    })
    process.registry.unregister(supervisor_name, process.registry.CONSISTENT)
    process.unlisten(control_ch)
    return err, control or (output and output.control), retire
end
worker.supervise_job_child = supervise_job_child

return worker
