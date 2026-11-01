local M: any = {}
function M.reset(stage, source) M.stage, M.source, M.calls, M.spawns = stage, source, 0, 0 end
function M.result(stage, value) if M.stage == stage then return nil, M.source end; return value, nil end
function M.get(...) return M.result("registry", {kind = "function.lua"}) end
function M.scope() return M end
function M.policy(...) return M.result("policy", {proc_max_execution_ms = 1000}) end
function M.with(self, ...) return M end
function M.new() return M end
function M.with_context(...) return M end
function M.with_scope(...) return M end
function M.with_options(...) return M.result("executor", M) end
function M.call(...) M.calls = M.calls + 1; return {result = {marker = "kept"}}, nil end
function M.spawn_linked_monitored(...)
    M.spawns = M.spawns + 1
    return M.result("spawn", "child")
end
function M.events() return {} end
function M.wait_once(...) return {kind = "exit", result = {value = {ok = true, output = {result = {marker = "kept"}}}}} end
function M.supervise_loop(hooks, pid, opts)
    local signal = hooks.wait()
    local output, err = opts.interpret_exit(signal.result)
    return output, err, nil, false
end
function M.process_host() return "fixture-host" end
function M.decode_payload(...) return {}, nil end
function M.read(job)
    if job and type(job.lease_policy) == "table" then return job.lease_policy, nil end
    return M.policy()
end
function M.load_from(_, job) return M.read(job) end
return M
