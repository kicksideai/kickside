-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Harness subscriber: joins this node's settings change subscribers and forwards
-- revisions committed after subscription to the test process that spawned it.

local process = require("process")
local channel = require("channel")
local changes = require("settings_changes")
local writer = require("settings_writer")

local function main(parent: string): (any?, any?)
    local inbox, err = changes.subscribe()
    if err or not inbox then return nil, err end
    local baseline = assert(writer.stored_revision())
    process.send(parent, "listener.ready", true)
    local lifecycle = process.events()
    while true do
        local result = channel.select({ inbox:case_receive(), lifecycle:case_receive() })
        if not result.ok then return nil, "listener channel closed" end
        if result.channel == lifecycle then
            if result.value and result.value.kind == process.event.CANCEL then return true, nil end
        elseif result.value.revision > baseline then
            process.send(parent, "listener.revision", result.value.revision)
        end
    end
end

return { main = main }
