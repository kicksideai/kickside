local process = require("process")
local channel = require("channel")
local time = require("time")
return {run = function(args: table): table
    local lifecycle = process.events()
    local accepted, ready_err = process.send(args.reply_pid, args.reply_topic, {})
    if ready_err then error(ready_err) end
    if accepted ~= true then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "cancellation probe requires ready completion"})) end
    local deadline = time.after("15s")
    while true do
        local selected = channel.select({lifecycle:case_receive(), deadline:case_receive()})
        if selected.channel ~= lifecycle then error(errors.new({kind = errors.TIMEOUT, retryable = false, message = "cancellation probe does not receive its control"})) end
        local event = selected.value
        if type(event) == "table" and event.kind == process.event.CANCEL then return {cancelled = true} end
    end
end}
