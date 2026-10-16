-- A user hub for production thread-event notifications. It observes the real
-- thread update, then tells the test to read the committed lifecycle event.
local process = require("process")
local channel = require("channel")

local function main(args: any): ()
    local name = "user." .. tostring(args.actor_id)
    local reply_pid, reply_topic = tostring(args.reply_pid), tostring(args.reply_topic)
    local thread_topic = "kickside.thread." .. tostring(args.workflow_id)
    local registered, register_err = process.registry.register(name)
    process.send(reply_pid, reply_topic, {
        kind = "ready", ok = registered == true,
        error = register_err and tostring(register_err) or nil,
    })
    if not registered then return end
    local inbox, events = process.inbox(), process.events()
    local count = 0
    while true do
        local selected = channel.select({ inbox:case_receive(), events:case_receive() })
        if selected.channel == events then break end
        local message = selected.value
        if message:topic() == "stop" then break end
        if message:topic() == "probe" then
            process.send(reply_pid, reply_topic, {kind = "count", count = count})
        end
        if message:topic() == thread_topic then
            local update = message:payload():data()
            if type(update) == "table" and update.event_type == "events.appended"
                and update.thread_id == args.workflow_id then
                count = count + 1
                process.send(reply_pid, reply_topic, { kind = "thread_event", thread_id = update.thread_id, count = count })
                if not args.continuous then break end
            end
        end
    end
    process.registry.unregister(name)
end

return { main = main }
