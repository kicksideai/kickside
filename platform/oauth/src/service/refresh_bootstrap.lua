local refresh_schedule = require("refresh_schedule")
local process = require("process")
local channel = require("channel")
local M = {}
function M.run(): ()
    local _, err = refresh_schedule.bootstrap()
    if err then error(tostring(err)) end
    local events = process.events()
    while true do
        local selected = channel.select({ events:case_receive() })
        if selected.ok == false then return end
        local event = selected.value
        if event.kind == process.event.CANCEL then return end
        if event.kind == process.event.OUTDATED then process.upgrade() end
    end
end
return M
