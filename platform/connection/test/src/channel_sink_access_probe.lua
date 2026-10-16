local channel_sink = require("channel_sink")
local reply_sender = require("reply_sender")

local function run(req: any): any
    reply_sender.reset()
    local result = channel_sink.write(req)
    return { result = result, send_count = #reply_sender.calls() }
end

return { run = run }
