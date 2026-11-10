-- Test-only proc:// worker target. Optionally reports execution progress, then
-- sleeps for payload.sleep_ms and returns its output directly. A small sleep exits cleanly
-- (legit work); a long sleep lets the supervisor reap it on max_execution/cancel.

local time = require("time")
local channel = require("channel")
local process = require("process")
local job_types = require("job_types")
local jobs = require("jobs")

local function run(input: any): table
    input = type(input) == "table" and input or {}
    local payload = type(input.payload) == "table" and input.payload or {}
    if type(payload.ready_to) == "string" then
        local _, ready_err = process.send(payload.ready_to, "job_worker_ready", { job_id = input.job.id, target_pid = tostring(process.pid()) })
        if ready_err then return {ok = false, error_native = job_types.error_to_data(ready_err)} end
    end
    if type(payload.finish_topic) == "string" then
        local finish = process.listen(payload.finish_topic)
        finish:receive()
    end
    if payload.fail == true then
        local kind = job_types.native_kind(payload.error_kind) or errors.INTERNAL
        return {ok = false, error_native = job_types.error_to_data(errors.new({message = tostring(payload.error_text or "configured proc failure"), kind = kind}) :: error)}
    end
    if payload.block == true then channel.new():receive() end
    -- Report progress progress_count times, progress_every_ms apart.
    local progress_count = math.floor(tonumber(payload.progress_count) or 0)
    for _ = 1, progress_count do
        time.sleep(tostring(math.floor(tonumber(payload.progress_every_ms) or 0)) .. "ms")
        local _, progress_err = jobs.report_progress(input.job.id, {
            token = input.job.lease_token, execution_seq = input.job.execution_seq,
        })
        if progress_err then return {ok = false, error_native = job_types.error_to_data(progress_err)} end
    end
    local sleep_ms = math.floor(tonumber(payload.sleep_ms) or 0)
    if sleep_ms > 0 then
        time.sleep(tostring(sleep_ms) .. "ms")
    end
    if payload.output ~= nil then return {ok = true, output = payload.output} end
    return {ok = true, output = { slept = true, sleep_ms = sleep_ms, record = { status = "completed" } }}
end

return { run = run }
