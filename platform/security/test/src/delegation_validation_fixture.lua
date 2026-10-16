local registry = require("registry")
local funcs = require("funcs")
return {call = function(args)
    return funcs.call(args.target, args.args)
end, check = function(args)
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
            message = "host authority lookup is unavailable", details = {code = "host_validation_outage"}})
    end
    if args.principal.id ~= state.target or (args.root ~= "*" and args.root ~= state.root) then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "target or root is unavailable"})
    end
    return {success = true}
end}
