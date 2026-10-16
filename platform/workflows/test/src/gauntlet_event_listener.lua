local process = require("process")
local channel = require("channel")

local function run(args: any)
    local actor_id = tostring(args.actor_id or "")
    local reply_pid = tostring(args.reply_pid or "")
    local reply_topic = tostring(args.reply_topic or "")
    local name = "user." .. actor_id
    local registered, register_err = process.registry.register(name)
    process.send(reply_pid, reply_topic, {
        kind = "ready", ok = registered == true, error = register_err and tostring(register_err) or nil,
    })
    if not registered then return end
    local inbox = process.inbox()
    local events = process.events()
    while true do
        local selected = channel.select({ inbox:case_receive(), events:case_receive() })
        if selected.channel == events then break end
        local message = selected.value
        local topic = tostring(message:topic() or "")
        if topic == "stop" then break end
        local dataflow_id = topic:match("^dataflow:(.+)$")
        if dataflow_id then
            process.send(reply_pid, reply_topic, { kind = "dataflow", dataflow_id = dataflow_id })
        end
    end
    process.registry.unregister(name)
end

return { run = run }
