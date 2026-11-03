-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Harness stand-in for a settings keeper starting on another node: it joins the
-- keeper group and waits to be cancelled.

local pg = require("pg")
local process = require("process")
local changes = require("settings_changes")

local function main(): (any?, any?)
    local scope = assert(pg.open(changes.SCOPE))
    assert(scope:join(changes.KEEPERS))
    local lifecycle = process.events()
    while true do
        local event = lifecycle:receive()
        if not event or event.kind == process.event.CANCEL then
            scope:leave(changes.KEEPERS)
            return true, nil
        end
    end
end

return { main = main }
