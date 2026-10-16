local process = require("process")

local function run(input: any): (any?, error?)
    local payload = input and input.payload or {}
    local _, err = process.send(tostring(payload.reply_pid), tostring(payload.reply_topic),
        { job_id = input.job.id, execution_seq = input.job.execution_seq })
    if err then return nil, err end
    return { ok = true }, nil
end

return { run = run }
