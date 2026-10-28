local registry = require("registry")
return {groups = function(args)
    local fixture, err = registry.get("app:delegation_validation_state")
    if err then return nil, err end
    local state = fixture.data
    if state.bump_revision then
        state.bump_revision = false
        local changes = assert(registry.snapshot()):changes()
        changes:update(fixture)
        local _, apply_err = changes:apply()
        if apply_err then return nil, apply_err end
    end
    if state.failure then
        return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "principal directory is unavailable", details = {code = "directory_outage"}})
    end
    return {active = args.id == state.target, groups = {}}
end, unsupported = function()
    return nil, errors.new({kind = errors.INVALID, retryable = false, message = "the harness directory answers groups only"})
end}
