-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local process = require("process")
local time = require("time")
local channel = require("channel")

local function run(input: any): (any?, error?)
    local payload = input.payload
    local _, err = process.send(payload.reply_pid, payload.reply_topic, { job_id = input.job.id })
    if err then return nil, err end
    channel.select({ time.after("500ms"):case_receive() })
    return { ok = true }, nil
end

return { run = run }
