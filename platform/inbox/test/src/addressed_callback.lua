-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")

local function run(input: any): (any?, any?)
    assert(security.actor():id() == input.item.metadata.expected_resolver, "callback identity changed")
    assert(input.resolution_id == "resolve:" .. input.item.id .. ":" .. tostring(input.item.version_event_id or input.item.created_event_id), "version binding changed")
    assert(input.action == "dismiss", "action changed")
    assert(security.can("app.inbox.send", "app:addressed_type"), "callback scope changed")
    return { ok = true }, nil
end

return { run = run }
