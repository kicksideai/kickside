-- Test-only dead handler: reads the dead job its outcome names and sends it to
-- the process registered under RECEIVER.
local process = require("process")
local jobs = require("jobs")

local RECEIVER = "app.test.job_dead_receiver"

local function run(input: any): table
    local outcome = type(input) == "table" and input.payload or {}
    local dead, read_err = jobs.get_job(tostring(outcome.job_id))
    if read_err then error(read_err) end
    if not dead then error("dead job " .. tostring(outcome.job_id) .. " is absent") end
    local pid = process.registry.lookup(RECEIVER, process.registry.CONSISTENT)
    if pid then
        local _, send_err = process.send(tostring(pid), RECEIVER,
            { job_id = dead.id, status = dead.status, last_error = dead.last_error })
        if send_err then error(send_err) end
    end
    return { record = { status = "completed" } }
end

local function fail(): (any?, error?)
    error(errors.new({kind = errors.INVALID, retryable = false, message = "outcome rejected"}))
end

return { run = run, fail = fail, RECEIVER = RECEIVER }
