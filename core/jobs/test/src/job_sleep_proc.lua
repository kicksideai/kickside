-- Test-only proc:// worker target. Sleeps for payload.sleep_ms then returns its
-- output directly. A small sleep exits cleanly
-- (legit work); a long sleep lets the supervisor reap it on max_execution/cancel.

local time = require("time")
local channel = require("channel")
local process = require("process")
local job_types = require("job_types")

local function run(input: any): table
    input = type(input) == "table" and input or {}
    local payload = type(input.payload) == "table" and input.payload or {}
    if type(payload.ready_to) == "string" then
        local _, ready_err = process.send(payload.ready_to, "job_worker_ready", { job_id = input.job.id })
        if ready_err then return {ok = false, error_native = job_types.error_to_data(ready_err)} end
    end
    if payload.fail == true then
        local kind = job_types.native_kind(payload.error_kind) or errors.INTERNAL
        return {ok = false, error_native = job_types.error_to_data(errors.new({message = tostring(payload.error_text or "configured proc failure"), kind = kind}) :: error)}
    end
    if payload.block == true then channel.new():receive() end
    local sleep_ms = math.floor(tonumber(payload.sleep_ms) or 0)
    if sleep_ms > 0 then
        time.sleep(tostring(sleep_ms) .. "ms")
    end
    return {ok = true, output = { slept = true, sleep_ms = sleep_ms, record = { status = "completed" } }}
end

return { run = run }
