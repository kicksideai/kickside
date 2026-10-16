local time = require("time")
local process = require("process")
local channel = require("channel")
local callback_names = require("callback_names")

local M = {}

local CALLBACK_TIMEOUT = "30s"
local CALLBACK_TOPIC = "oauth_callback"
local REPLY_TOPIC = "oauth_callback_response"

type CallbackMessage = {
    code: string?,
    state: string?,
    error: string?,
    error_description: string?,
}

type CallbackRuntime = {
    lookup: (name: string) -> any,
    listen: (topic: string) -> any,
    send: (pid: string, topic: string, payload: CallbackMessage) -> any,
    unlisten: (channel_handle: any) -> (),
    after: (duration: string) -> any,
    select: (cases: { any }) -> any,
}

local function default_runtime(): CallbackRuntime
    return {
        lookup = function(name: string): any
            return process.registry.lookup(name, process.registry.CONSISTENT)
        end,
        listen = function(topic: string): any
            return process.listen(topic)
        end,
        send = function(pid: string, topic: string, payload: CallbackMessage): any
            return process.send(pid, topic, payload)
        end,
        unlisten = function(channel_handle: any): ()
            process.unlisten(channel_handle)
        end,
        after = function(duration: string): any
            return time.after(duration)
        end,
        select = function(cases: { any }): any
            return channel.select(cases)
        end,
    }
end

function M.send_callback_and_wait(negotiator_pid: string, callback_message: CallbackMessage, runtime: CallbackRuntime): (any?, string?)
    local response_channel = runtime.listen(REPLY_TOPIC)
    local send_success = runtime.send(negotiator_pid, CALLBACK_TOPIC, callback_message)
    if not send_success then
        runtime.unlisten(response_channel)
        return nil, "communication_failed"
    end

    local timeout_channel = runtime.after(CALLBACK_TIMEOUT)
    local result = runtime.select({
        response_channel:case_receive(),
        timeout_channel:case_receive()
    })

    runtime.unlisten(response_channel)

    if result.channel == timeout_channel then
        return nil, "timeout"
    end
    return result.value, nil
end

function M.deliver(state: string, callback_message: CallbackMessage, runtime: CallbackRuntime?): (any?, string?)
    local rt = runtime or default_runtime()
    local negotiator_pid = rt.lookup(callback_names.NEGOTIATOR_PREFIX .. state)
    if not negotiator_pid then
        return nil, "session_not_found"
    end
    return M.send_callback_and_wait(tostring(negotiator_pid), callback_message, rt)
end

return M
