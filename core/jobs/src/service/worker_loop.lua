-- Durable job execution: one assigned slot and its supervised job children.

local sql = require("sql")
local registry = require("registry")
local logger = require("logger")
local time = require("time")
local channel = require("channel")
local process = require("process")
local events = require("events")

local job_types = require("job_types")
local registry_version = require("registry_version")
local cfg = require("config")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local claim_execution = require("claim_execution")
local reclaim = require("reclaim")
local proc_supervisor = require("proc_supervisor")
local lease = require("lease")
local worker_heartbeat = require("worker_heartbeat")
local dispatch = require("worker_dispatch")
local worker_child = require("worker_child")
local worker_fence = require("worker_fence")
local worker_completion = require("worker_completion")
local lease_release = require("lease_release")
local sql_boundary = require("sql_boundary")
local error_envelope = require("error_envelope")

local worker = {}

local function registry_version_id(): (string?, error?)
    return registry_version.id(registry)
end
worker.registry_version_id = registry_version_id

local completion_opts = worker_completion.completion_opts
local failure_class_for = worker_completion.failure_class_for
local complete_job = worker_completion.complete_job
local fail_job = worker_completion.fail_job
local function retry_floor_for(err: error?): table?
    if not err then return nil end
    local details = err:details()
    if details and details.retry_after_ms ~= nil then return {retry_after_ms = details.retry_after_ms} end
    return nil
end
worker.completion_opts = completion_opts
worker.failure_class_for = failure_class_for

local function heartbeat_exited(event: any, heartbeat_pid: string?): boolean
    if type(event) ~= "table" or heartbeat_pid == nil then
        return false
    end
    local ev = event :: any
    return ev.kind == process.event.EXIT and tostring(ev.from) == heartbeat_pid
end
worker.heartbeat_exited = heartbeat_exited

-- A slot exists only under its dispatcher: the pool's exit ends the loop.
local function dispatcher_exited(event: any, dispatcher_pid: string?): boolean
    if type(event) ~= "table" or dispatcher_pid == nil then
        return false
    end
    local ev = event :: any
    return (ev.kind == process.event.LINK_DOWN or ev.kind == process.event.EXIT)
        and tostring(ev.from) == dispatcher_pid
end
worker.dispatcher_exited = dispatcher_exited

local function settle_child_exit(db: sql.DB, dbtype: string, job: table, run_ctx: table,
    child_err: error?, control: string?): error?
    if control == "termination_unconfirmed" then
        return worker_fence.hold_unconfirmed_execution(db, job)
    elseif control == "revoked" then
        local changed, finish_err = lifecycle_cancel.finish_cancellation(db, dbtype, {
            id = job.id, token = job.lease_token, execution_seq = job.execution_seq,
        })
        if finish_err then return finish_err end
        local history_err = lifecycle.finalize_job_run(db, dbtype, run_ctx,
            job_types.RUN_STATE.FAILED, {}, {}, "job execution revoked")
        if history_err or not changed then return history_err end
        return lease_release.notify(tostring(job.id), tonumber(job.execution_seq),
            { kind = job.owner_kind, id = job.owner_id })
    elseif control == "shutdown" and not child_err then
        local _, settle_err = reclaim.settle_confirmed(db, dbtype, {
            id = job.id, token = job.lease_token, execution_seq = job.execution_seq,
        })
        return settle_err
    elseif child_err then
        local fail_err = fail_job(db, dbtype, job, {}, tostring(child_err), failure_class_for(child_err), run_ctx, retry_floor_for(child_err))
        if fail_err and job_types.is_lease_lost_error(fail_err) then
            local finalize_err = lifecycle.finalize_job_run(db, dbtype, run_ctx,
                job_types.RUN_STATE.LEASE_LOST, {}, {}, tostring(child_err))
            return finalize_err or fail_err
        end
        return fail_err
    end
    return nil
end
worker.settle_child_exit = settle_child_exit

-- Run a claimed job with history, lease heartbeat and guarded finalization.
-- Return "shutdown" when worker cancellation arrives during execution.

local function worker_response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "worker execution response is invalid",
        details = {code = "job_worker_response", field = field}})
end

local function process_job(db: sql.DB, dbtype: string, pid: string, job: table, run_id: string?): (string?, error?)
    local attempt_no = math.floor(tonumber(job.attempts) or 1)
    local run_ctx: table? = nil
    if type(run_id) == "string" and run_id ~= "" then
        run_ctx = { id = run_id, started_at_unix = time.now():unix() }
    else
        local fresh_ctx, run_start_err = lifecycle.start_job_run(db, dbtype, job, pid, attempt_no)
        if run_start_err then return nil, errors.wrap(run_start_err, "job run start failed") end
        if type(fresh_ctx) ~= "table" or type(fresh_ctx.id) ~= "string" or fresh_ctx.id == "" then
            return nil, worker_response_error("run.context")
        end
        run_ctx = fresh_ctx
    end
    local function finalize(status: string, output: any, error_text: string?, primary: error?): error?
        return error_envelope.cleanup(function(): (any, error?)
            return nil, lifecycle.finalize_job_run(db, dbtype, run_ctx, status, output, output, error_text)
        end, primary, "job run finalization failed")
    end
    -- The claim's durable lease is already live; renew only if dispatch has
    -- used most of its remaining window.
    local live, pre_err, lease_deadline = lease.validate_for_dispatch(db, dbtype, job)
    if pre_err or not live then
        local primary = pre_err or job_types.lease_lost_error("dispatch lease lost")
        local status = job_types.is_lease_lost_error(primary) and job_types.RUN_STATE.LEASE_LOST or job_types.RUN_STATE.FAILED
        return nil, finalize(status, {}, tostring(primary), primary)
    end

    local heartbeat_pid, hb_err = lease.start(job, lease_deadline)
    if hb_err or type(heartbeat_pid) ~= "string" or heartbeat_pid == "" then
        local primary = hb_err or worker_response_error("heartbeat.id")
        local park_err = lifecycle.fail_job(db, job, dbtype, "lease heartbeat spawn failed: " .. tostring(primary), failure_class_for(primary), retry_floor_for(primary))
        if park_err then primary = error_envelope.wrap_secondary(park_err, primary, "heartbeat failure persistence failed") end
        return nil, finalize(job_types.RUN_STATE.FAILED, {}, tostring(primary), primary)
    end
    local output: any = nil
    local execution_err: error? = nil
    local error_text: string? = nil
    local failure_class: string? = nil
    local control: string? = nil
    local proc_binding = dispatch.proc_binding_for(job)
    if proc_binding then
        local supervised_run_id: string? = nil
        if type(run_ctx) == "table" and type((run_ctx :: any).id) == "string" then
            supervised_run_id = (run_ctx :: any).id :: string
        end
        local result, proc_err, ctl = dispatch.run_supervised_proc(db, dbtype, job, proc_binding, nil, supervised_run_id)
        control = ctl
        output = result
        execution_err = proc_err
    else
        local exec_output, exec_err = dispatch.execute_job(db, dbtype, job)
        output = exec_output
        execution_err = exec_err
    end
    if execution_err then
        error_text = tostring(execution_err)
        failure_class = failure_class_for(execution_err)
    end
    local stop_err = lease.stop(heartbeat_pid)
    local function finish(ctl: string?, primary: error?): (string?, error?)
        local final = error_envelope.cleanup(function(): (any, error?) return nil, stop_err end,
            primary, "lease heartbeat cancellation failed")
        return ctl, final
    end
    if control == "termination_unconfirmed" then
        return finish("shutdown", worker_fence.hold_unconfirmed_execution(db, job))
    end
    if control == "shutdown" then return finish("shutdown", nil) end

    if error_text then
        logger:error("job_worker " .. pid .. " execute error job=" .. tostring(job.id) .. ": " .. error_text)
        local fail_err, recorded = fail_job(db, dbtype, job, output, error_text,
            failure_class, run_ctx, retry_floor_for(execution_err))
        if not fail_err and recorded ~= true then fail_err = worker_response_error("failure.recorded") end
        if fail_err and execution_err then
            fail_err = error_envelope.wrap_secondary(fail_err, execution_err, "job failure persistence failed")
        end
        if not recorded then
            local status = (fail_err and job_types.is_lease_lost_error(fail_err)) and job_types.RUN_STATE.LEASE_LOST or job_types.RUN_STATE.FAILED
            fail_err = finalize(status, output, error_text, fail_err)
        end
        return finish(control, fail_err)
    end

    local done_err: error? = nil
    if not (type(output) == "table" and (output :: any).self_completed == true) then
        done_err = complete_job(db, dbtype, job, output, run_ctx)
    end
    if done_err then
        local status = job_types.is_lease_lost_error(done_err) and job_types.RUN_STATE.LEASE_LOST or job_types.RUN_STATE.FAILED
        return finish(control, finalize(status, output, tostring(done_err), done_err))
    end
    -- A target using jobs.complete already settled its retained run history,
    -- including an idle slot's parked attempt.
    -- Other self-completing targets (such as wake continuations) only update
    -- the job and still need the worker to finalize their run row.
    if type(output) == "table" and (output :: any).self_completed == true
        and not (type((output :: any).completion) == "table"
            and (output :: any).completion.run_history_settled == true) then
        return finish(control, finalize(job_types.RUN_STATE.SUCCESS, output, nil, nil))
    end
    return finish(control, nil)
end
worker.process_job = process_job

local function child_response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "job child startup response is invalid",
        details = {code = "job_child_response", field = field}})
end

local function child_failure(err: error): table
    return { ok = false, error_native = job_types.error_to_data(err) }
end

local function run_job_child(args: table): table
    local job = type(args) == "table" and args.job or nil
    if type(job) ~= "table" then
        return child_failure(errors.new({ message = "missing job", kind = errors.INVALID }) :: error)
    end
    local run_id: string? = nil
    if type(args) == "table" and type((args :: any).run_id) == "string" then
        run_id = (args :: any).run_id :: string
    end
    -- The child supervises the lease heartbeat and proc target it links to
    -- itself and terminates a target that overruns; their LINK_DOWN must
    -- arrive as an event, not end the child before it finalizes the attempt.
    local trapped, trap_err = process.set_options({ trap_links = true })
    if trap_err then return child_failure(errors.wrap(trap_err, "job child trap_links failed")) end
    if trapped ~= true then return child_failure(child_response_error("options")) end
    -- Register before the start fence reads the row: recovery settles a fence
    -- only while this name is absent, and a fence it settled fails the read.
    local registered, register_err = process.registry.register(
        proc_supervisor.child_name(tostring(job.id), tostring(job.lease_token)), nil, process.registry.CONSISTENT)
    if register_err then return child_failure(errors.wrap(register_err, "job child liveness registration failed")) end
    if registered ~= true then
        return child_failure(child_response_error("registration"))
    end
    local database, db_err = sql.get(cfg.db_id())
    if db_err then return child_failure(errors.wrap(db_err, "job child db unavailable")) end
    local binding, binding_err = error_envelope.binding(database, nil, "type", "job child db unavailable", "job_child_response")
    if binding_err or not binding then
        return child_failure(error_envelope.wrap(binding_err or child_response_error("database"), "job child db unavailable", {field = "database"}))
    end
    local db = binding :: sql.DB
    local raw_type, type_err = sql_boundary.database_type(db, "job child db type failed", "database.type", child_response_error)
    if type_err or not raw_type then
        local primary = type_err or child_response_error("database.type")
        local final = sql_boundary.release(db, primary, "job child db release failed")
        return child_failure(final :: error)
    end
    if run_id and type(job.worker_id) == "string" then
        local started, start_err = claim_execution.mark_started(db, job, job.worker_id,
            run_id, tostring(process.pid()))
        if start_err or started ~= true then
            local native_err = start_err or (started == false and job_types.lease_lost_error("job child start fence failed")
                or child_response_error("start"))
            local final = sql_boundary.release(db, native_err, "job child db release failed")
            return child_failure(final :: error)
        end
    end
    local control, execution_err = process_job(db, tostring(raw_type), tostring(process.pid()), job, run_id)
    local release_err = sql_boundary.release(db, execution_err, "job child db release failed")
    if release_err then return child_failure(release_err) end
    return { ok = true, control = control }
end
worker.run_job_child = run_job_child

function worker.send_idle(dispatcher_pid: string, payload: table): (boolean, error?)
    local sent, err = process.send(dispatcher_pid, cfg.IDLE_TOPIC, payload)
    if err then return false, errors.wrap(err, "job_worker idle report failed") end
    if sent ~= true then
        return false, errors.new({kind = errors.INTERNAL, retryable = false,
            message = "job_worker idle report failed", details = {code = "job_idle_report_response"}})
    end
    return true, nil
end

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "job_worker startup response is invalid",
        details = {code = "job_worker_response", field = field}})
end

local function startup_binding(value: any, err: error?, method: string, field: string,
    operation: string): (any?, error?)
    local bound, binding_err = error_envelope.binding(value, err, method, operation, "job_worker_response")
    if binding_err and not err then
        return nil, error_envelope.wrap(binding_err, operation, {field = field})
    end
    return bound, binding_err
end

local function run_loop(args: table): ()
    local pid = tostring(process.pid())
    local dispatcher_pid = type(args) == "table" and args.dispatcher_pid or nil
    if type(dispatcher_pid) ~= "string" or dispatcher_pid == "" then
        error(errors.new({kind = errors.INVALID, retryable = false, message = "job_worker missing dispatcher pid",
            details = {code = "job_worker_identity", field = "dispatcher_pid"}}))
    end
    -- Keep a receiver on the runtime's unbuffered lifecycle channel while
    -- initialization and job settlement yield. Idle offers can then inspect
    -- already-delivered control events before they send to the pool.
    local lifecycle_events = process.events()
    local events_ch = channel.new(1)
    coroutine.spawn(function()
        while true do
            local event, open = lifecycle_events:receive()
            if not open then events_ch:close(); return end
            events_ch:send(event)
        end
    end)
    local subscription, subscribe_err = events.subscribe("registry", "registry.commit")
    local registry_subscription, subscription_err = startup_binding(subscription, subscribe_err, "channel", "subscription",
        "job_worker registry subscription failed")
    if subscription_err then error(subscription_err) end
    if not registry_subscription then error(response_error("subscription")) end
    local registry_ch = registry_subscription:channel()
    local assignment_ch = process.listen(cfg.ASSIGN_TOPIC)
    local heartbeat_pid: string? = nil
    local function cleanup(primary: error?): ()
        local final = error_envelope.cleanup(function(): (any, error?)
            return nil, worker_heartbeat.stop(heartbeat_pid)
        end, primary, "job_worker heartbeat cancellation failed")
        final = error_envelope.cleanup(function(): (any, error?)
            local value, err = process.unlisten(assignment_ch)
            return value, err
        end, final, "job_worker assignment listener removal failed")
        final = error_envelope.cleanup(function(): (any, error?)
            local value, err = registry_subscription:close()
            return value, err
        end, final, "job_worker registry subscription closure failed")
        if final then error(final) end
    end
    local options_set, options_err = process.set_options({ trap_links = true, upgradable = true })
    if options_err then cleanup(errors.wrap(options_err, "job_worker process options failed")) end
    if options_set ~= true then cleanup(response_error("process.options")) end
    local database, connect_err = sql.get(cfg.db_id())
    local binding, db_err = startup_binding(database, connect_err, "type", "database", "job_worker db connect failed")
    if db_err or not binding then
        cleanup(db_err or response_error("database"))
    end
    local db = binding :: sql.DB
    local function startup_failure(err: error): ()
        local final = sql_boundary.release(db, err, "job_worker startup db release failed")
        cleanup(final)
    end
    local dialect, dbtype_err = sql_boundary.database_type(db, "job_worker db type failed", "database.type", response_error)
    if dbtype_err or not dialect then startup_failure(dbtype_err or response_error("database.type")) end
    local dbtype = dialect :: string
    local initial_version, version_err = registry_version_id()
    if version_err then startup_failure(errors.wrap(version_err, "job_worker registry version failed")) end
    if type(initial_version) ~= "string" or initial_version == "" then startup_failure(response_error("version")) end
    local first_heartbeat_err = worker_heartbeat.mark(db, dbtype, pid, initial_version)
    if first_heartbeat_err then startup_failure(errors.wrap(first_heartbeat_err, "job_worker heartbeat registration failed")) end
    local hb_pid, hb_spawn_err = worker_heartbeat.start(pid, initial_version)
    if hb_spawn_err then startup_failure(errors.wrap(hb_spawn_err, "job_worker heartbeat start failed")) end
    if type(hb_pid) ~= "string" or hb_pid == "" then startup_failure(response_error("heartbeat.id")) end
    heartbeat_pid = hb_pid
    logger:info("job_worker loop started pid=" .. pid .. " db=" .. dbtype)
    local assignment_epoch = 0
    local db_held = true
    local function release_db(primary: error?): error?
        if not db_held then return primary end
        db_held = false
        return sql_boundary.release(db, primary, "job_worker db release failed")
    end
    local function handle_control(event: any): boolean
        if type(event) ~= "table" then
            return false
        end
        if event.kind == process.event.CANCEL then
            logger:info("job_worker " .. pid .. " cancelled, shutting down")
            cleanup(release_db(nil))
            return true
        end
        if event.kind == process.event.OUTDATED then
            logger:info("job_worker " .. pid .. " process is outdated, recycling loop")
            cleanup(release_db(nil))
            return true
        end
        if worker.dispatcher_exited(event, dispatcher_pid) then
            logger:warn("job_worker " .. pid .. " dispatcher exited, shutting down")
            cleanup(release_db(nil))
            return true
        end
        if event.kind == process.event.LINK_DOWN then
            logger:warn("job_worker " .. pid .. " linked process down from=" .. tostring(event.from))
            if tostring(event.from) == heartbeat_pid then
                cleanup(release_db(nil))
                return true
            end
        end
        -- A normally-exited heartbeat (its mark loop returned, e.g. after a
        -- database error) arrives as EXIT rather than LINK_DOWN; either way
        -- the loop recycles so supervision restarts it deliberately.
        if worker.heartbeat_exited(event, heartbeat_pid) then
            logger:warn("job_worker " .. pid .. " heartbeat process exited, recycling loop")
            cleanup(release_db(nil))
            return true
        end
        return false
    end

    local function report_idle(kind: string): (boolean, error?)
        while true do
            local pending = channel.select({ events_ch:case_receive(), default = true })
            if pending.default then break end
            if handle_control(pending.value) then return false, nil end
        end
        local accepted, err = worker.send_idle(dispatcher_pid,
            { worker_id = pid, kind = kind, version = initial_version, epoch = assignment_epoch })
        return accepted, err
    end

    local first_release_err = release_db(nil)
    if first_release_err then cleanup(first_release_err) end
    local first_reported, first_idle_err = report_idle("idle")
    if not first_reported then
        if first_idle_err then
            cleanup(release_db(first_idle_err))
        end
        return
    end
    while true do
        local drain = channel.select({ events_ch:case_receive(), default = true })
        if not drain.default and handle_control(drain.value) then
            return
        end
        local result = channel.select({
            events_ch:case_receive(),
            registry_ch:case_receive(),
            assignment_ch:case_receive(),
        })
        if result.channel == registry_ch then
            -- A commit is published after its version becomes current, so the
            -- commit of the version this loop started at can arrive after its
            -- idle report. Only a newer version retires the slot.
            local committed: string? = nil
            local committed_err: error? = nil
            if result.ok ~= false then committed, committed_err = registry_version_id() end
            if result.ok == false or committed ~= initial_version then
                if result.ok == false then
                    logger:error("job_worker registry subscription closed, recycling loop")
                elseif committed_err then
                    logger:error(tostring(committed_err))
                else
                    logger:info("job_worker registry committed, recycling loop")
                end
                cleanup(release_db(nil))
                return
            end
        elseif result.channel == events_ch then
            if handle_control(result.value) then return end
        elseif result.channel == assignment_ch then
            local assignment = result.value
            local job = type(assignment) == "table" and assignment.job or nil
            local run_ctx = type(assignment) == "table" and assignment.run_ctx or nil
            local next_epoch = type(assignment) == "table" and assignment.epoch or nil
            if type(job) ~= "table" or tostring(job.worker_id or "") ~= pid
                or type(run_ctx) ~= "table" or type(run_ctx.id) ~= "string"
                or type(next_epoch) ~= "number" or next_epoch ~= assignment_epoch + 1 then
                cleanup(release_db(errors.new({kind = errors.INVALID, retryable = false,
                    message = "job_worker received an invalid committed assignment",
                    details = {code = "job_worker_assignment"}})))
                return
            else
            assignment_epoch = next_epoch
            -- The child and its lease heartbeat need the SQLite connection while
            -- the parent waits. Reopen only after supervision returns.
            local child_release_err = release_db(nil)
            if child_release_err then cleanup(child_release_err) end
            local child_err, control, retire = worker_child.supervise_job_child(job, run_ctx.id, heartbeat_pid, events_ch)
            local reopened, reopen_err = sql.get(cfg.db_id())
            local restored, restore_err = startup_binding(reopened, reopen_err, "type", "database",
                "job_worker db reopen failed")
            if restore_err or not restored then
                cleanup(restore_err or response_error("database"))
                return
            end
            db = restored :: sql.DB
            db_held = true
            local settle_err = settle_child_exit(db, dbtype, job, run_ctx, child_err, control)
            if settle_err then
                cleanup(release_db(errors.wrap(settle_err, "job_worker child settlement failed")))
                return
            end
            if control == "shutdown" or control == "termination_unconfirmed" then
                logger:info("job_worker " .. pid .. " cancelled during job, shutting down")
                cleanup(release_db(nil))
                return
            end
            -- The loop's code changed while the execution ran: the execution
            -- settled under the code it started with, and the replacement slot
            -- loads the new code for the next one.
            if retire then
                logger:info("job_worker " .. pid .. " process is outdated, recycling loop after its execution")
                cleanup(release_db(nil))
                return
            end
            -- Heartbeat-owner EXIT/LINK_DOWN is monitored directly. Do not
            -- query pulse freshness after the supervised child returns.
            -- A finished child cannot offer this slot again while its durable
            -- assignment marker still names a job. Recycle the loop instead.
            local marker_rows, marker_err = db:query(
                "SELECT current_job_id FROM kickside_job_worker WHERE id=$1", { pid })
            local markers, proof_err = sql_boundary.bounded_rows(marker_rows, marker_err,
                "job_worker assignment marker lookup failed", "assignment.marker", 1, 1, response_error)
            if proof_err or not markers then
                cleanup(release_db(proof_err or response_error("assignment.marker")))
                return
            end
            if markers[1].current_job_id ~= nil then
                cleanup(release_db(errors.new({kind = errors.CONFLICT, retryable = false,
                    message = "job_worker cannot report idle with an occupied marker",
                    details = {code = "job_worker_occupied"}})))
                return
            end
            local idle_release_err = release_db(nil)
            if idle_release_err then cleanup(idle_release_err) end
            local reported, idle_err = report_idle("idle")
            if not reported then
                if idle_err then
                    cleanup(release_db(idle_err))
                end
                return
            end
            end
        end
    end
end
worker.run_loop = run_loop


return worker
