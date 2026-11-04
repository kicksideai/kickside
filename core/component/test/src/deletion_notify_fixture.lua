local fixture = require("fixture")
return {
    resolve_recipients = function()
        fixture.audience_commits = fixture.commits
        return {"reader"}, nil
    end,
    notify_access = function(id, topic, data, opts)
        fixture.event = data.event
        fixture.event_commits = fixture.commits
        fixture.recipients = opts and opts.recipients
        return {success = true}, nil
    end,
}
