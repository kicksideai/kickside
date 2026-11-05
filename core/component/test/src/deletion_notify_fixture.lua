-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")
return {
    resolve_recipients = function()
        fixture.audience_commits = fixture.commits
        fixture.audiences = fixture.audiences + 1
        return fixture.result("audience", {"reader"})
    end,
    notify_access = function(id, topic, data, opts)
        fixture.event = data.event
        fixture.event_commits = fixture.commits
        fixture.event_effects = fixture.effects
        fixture.recipients = opts and opts.recipients
        return fixture.result("notify", {success = true})
    end,
}
