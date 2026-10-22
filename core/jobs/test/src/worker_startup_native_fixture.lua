local channel = require("channel")
local M = {}
function M.reset(stage: string, source: error?, secondary: error?, cleanup_errors: table?): ()
    M.stage, M.source, M.secondary = stage, source, secondary
    M.calls = {}
    M.cleanup_errors, M.control = cleanup_errors or {}, nil
    M.release_at, M.send_reply, M.schedule = 1, false, {}
    M.assignment_channel, M.events_channel = nil, nil
    M.reopen_active, M.reopen_error = false, nil
    M.start_false = false
    M.child_output = {}
    M.lease_stop_error = nil
    M.run_start_error, M.validation_error, M.lease_start_error = nil, nil, nil
    M.execute_error, M.complete_error, M.finalize_error, M.hold_error = nil, nil, nil, nil
    M.run_context, M.validation_live, M.heartbeat_id = {id = "run", started_at_unix = 1}, true, "lease-heartbeat"
    M.proc_binding, M.execution_control = nil, nil
    M.recorded_override, M.recorded_value = false, nil
    M.child_error, M.settle_error = nil, nil
    M.retry_floor = nil
    M.marker_override, M.marker_value = false, nil
end
local function hit(stage: string): () M.calls[stage] = (M.calls[stage] or 0) + 1 end
function M.result(stage: string, healthy: any): (any, error?)
    hit(stage)
    if M.stage == stage then return nil, M.source end
    return healthy, nil
end
function M.database(): any
    return {type = function(): (any, error?) return M.result("database.type", "sqlite") end,
        release = function(): (any, error?) hit("release"); return true, M.calls.release == M.release_at and M.secondary or nil end,
        query = M.query}
end
function M.subscription(): any
    return {channel = function(): any return channel.new(1) end,
        close = function(): (boolean, error?) hit("close"); return true, M.cleanup_errors.close end}
end
function M.unlisten(_channel: any): (boolean, error?) hit("unlisten"); return true, M.cleanup_errors.unlisten end
function M.stop(_pid: any): error? hit("stop"); return M.cleanup_errors.stop end
function M.mark(...): error?
    local _, err = M.result("heartbeat.mark", true)
    return err
end
function M.send(...): (boolean, error?) hit("send"); return M.send_reply, nil end
function M.events(): any return {receive = function(): (any, boolean) return nil, false end} end
function M.listen(...): any M.assignment_channel = channel.new(1); return M.assignment_channel end
function M.new_channel(...): any M.events_channel = channel.new(...); return M.events_channel end
function M.selection(cases: table): any
    if M.control then local event = M.control; M.control = nil; return {value = event} end
    if cases.default then return {default = true} end
    local selected = table.remove(M.schedule, 1)
    if selected then
        return {channel = selected.source == "assignment" and M.assignment_channel or M.events_channel, value = selected.value}
    end
    error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker fixture requires scheduled selection"}))
end
function M.supervise(...): (error?, string?, boolean)
    hit("child"); return M.child_error, nil, false
end
function M.connect(...): (any, error?)
    if M.reopen_active and (M.calls.database or 0) > 0 then hit("database"); return nil, M.reopen_error end
    return M.result("database", M.database())
end
function M.query(...): (any, error?)
    if M.marker_override then hit("marker"); return M.marker_value, nil end
    return M.result("marker", {{}})
end
function M.fail_job(...): (error?, boolean)
    M.retry_floor = select(8, ...)
    hit("settle"); if M.recorded_override then
        local recorded = M.recorded_value
        if type(recorded) ~= "boolean" then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "worker fixture requires boolean recording proof"})) end
        return M.settle_error, recorded
    end
    return M.settle_error, M.settle_error == nil
end
function M.complete_job(...): error? hit("complete"); return M.complete_error end
function M.execute(...): (any, error?) hit("execute"); return M.child_output, M.execute_error end
function M.finalize(...): error? hit("finalize"); return M.finalize_error end
function M.lease_validate(...): (boolean, error?) hit("lease.validate"); return M.validation_live, M.validation_error end
function M.lease_start(...): (string?, error?) hit("lease.start"); return M.heartbeat_id, M.lease_start_error end
function M.lease_stop(...): error? hit("lease.stop"); return M.lease_stop_error end
function M.run_start(...): (any, error?) hit("run.start"); return M.run_context, M.run_start_error end
function M.hold(...): error? hit("hold"); return M.hold_error end
function M.supervised(...): (any, error?, string?) hit("execute"); return M.child_output, M.execute_error, M.execution_control end
return M
