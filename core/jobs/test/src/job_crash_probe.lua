-- First attempt marks durable start, then waits to be killed by the harness.
-- The reclaimed second attempt completes immediately.
local sql = require("sql")
local process = require("process")
local job_types = require("job_types")

local function run(input: table): table
    local job = type(input) == "table" and input.job or nil
    if type(job) ~= "table" then return {ok = false, error_native = job_types.error_to_data(errors.new({message = "missing job", kind = errors.INVALID}) :: error)} end
    if tonumber(job.attempt_no) == 1 then
        local db, db_err = sql.get("app:db")
        if db_err or not db then return {ok = false, error_native = job_types.error_to_data(db_err or (errors.new({message = "crash probe database unavailable", kind = errors.UNAVAILABLE}) :: error))} end
        local _, marker_err = sql.builder.update("kickside_job")
            :set("last_error", "crash_probe_started")
            :where(sql.builder.eq({ id = job.id, status = "running", lease_token = job.lease_token }))
            :run_with(db):exec()
        db:release()
        if marker_err then return {ok = false, error_native = job_types.error_to_data(marker_err)} end
        local payload = type(input.payload) == "table" and input.payload or {}
        local reply_pid = tostring(payload.reply_pid or "")
        local reply_topic = tostring(payload.reply_topic or "")
        if reply_pid == "" or reply_topic == "" then
            return {ok = false, error_native = job_types.error_to_data(errors.new({message = "missing crash probe reply coordinates", kind = errors.INVALID}) :: error)}
        end
        local _, signal_err = process.send(reply_pid, reply_topic, { job_id = job.id })
        if signal_err then return {ok = false, error_native = job_types.error_to_data(signal_err)} end
        -- The harness terminates this process after observing the durable mark.
        process.listen("crash_probe.release"):receive()
    end
    return {ok = true, output = { recovered = true, record = { status = "completed" } }}
end

return { run = run }
