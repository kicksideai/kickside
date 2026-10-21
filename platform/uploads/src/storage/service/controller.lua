local process = require("process")
local channel = require("channel")
local time = require("time")
local events = require("events")
local log = require("logger"):named("uploads.storage")
local projection = require("projection")
local M = {}
local NAME = "kickside.uploads.storage:controller"
local TOPIC = "storage.reconcile"

function M.main(): any
    local _, options_err = process.set_options({ upgradable = true })
    if options_err then return nil, options_err end
    local subscription, subscribe_err = events.subscribe("registry", "registry.commit")
    if subscribe_err then return nil, subscribe_err end
    local messages = process.listen(TOPIC, { message = true })
    local process_events = process.events()
    local timer, timer_err = time.ticker("10s")
    if timer_err then subscription:close(); process.unlisten(messages); return nil, timer_err end
    local _, register_err = process.registry.register(NAME, nil, process.registry.LOCAL)
    if register_err then subscription:close(); process.unlisten(messages); timer:stop(); return nil, register_err end
    local function close(): ()
        subscription:close()
        process.unlisten(messages)
        timer:stop()
    end
    local initial, initial_err = projection.reconcile()
    if initial_err or not initial then close(); return nil, initial_err or "Storage initialization failed" end
    local registry_events = subscription:channel()
    local ticks = timer:channel()
    while true do
        local selected = channel.select({ process_events:case_receive(), messages:case_receive(), registry_events:case_receive(), ticks:case_receive() })
        if selected.channel == process_events then
            local event = selected.value
            if event.kind == process.event.CANCEL or event.kind == process.event.OUTDATED then
                close()
                if event.kind == process.event.OUTDATED then return process.upgrade() end
                return
            end
        else
            local result, reconcile_err = projection.reconcile()
            if reconcile_err then log:error("Storage configuration is not applied", { error = tostring(reconcile_err) }) end
            if selected.channel == messages then
                local request = selected.value:payload():data()
                if type(request) == "table" and type(request.reply_pid) == "string" and type(request.reply_topic) == "string" then
                    local _, send_err = process.send(request.reply_pid, request.reply_topic,
                        reconcile_err and { success = false, error = tostring(reconcile_err) } or result)
                    if send_err then log:warn("Storage requester left", { error = tostring(send_err) }) end
                end
            end
        end
    end
end

return M
