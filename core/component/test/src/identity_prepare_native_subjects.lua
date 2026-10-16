local fixture = require("fixture")
return {
    resolve = function(actor_id)
        fixture.resolutions = fixture.resolutions + 1
        local subjects = {{subject_type = "user", subject_id = actor_id}}
        if fixture.stage == "subjects" then return subjects, fixture.source end
        return subjects, nil
    end,
    access_filter = function(actor_id)
        fixture.filters = fixture.filters + 1
        if fixture.stage == "filter" then return {}, fixture.source end
        return nil, nil
    end,
}
