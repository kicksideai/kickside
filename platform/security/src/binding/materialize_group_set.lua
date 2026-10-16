local security = require("security")
local trigger_reconcile = require("trigger_reconcile")
local projection = require("scope_projection")
local error_envelope = require("error_envelope")

local function materialize(args)
    if not security.can("security.groups.compose", "kickside.security.binding:materialize_group_set") then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "group composition requires runtime authority"})
    end
    if type(args) ~= "table" or type(args.groups) ~= "table" or #args.groups == 0 then
        return nil, errors.new({kind = errors.INVALID, message = "groups must be a non-empty array"})
    end
    -- A login whose group set is current needs no projection pass.
    local result, err = projection.group_set(args.groups)
    if result and not result.current then result, err = trigger_reconcile.trigger({groups = args.groups}) end
    if err then
        return nil, (errors.new({kind = errors.UNAVAILABLE, message = tostring(err),
            retryable = err:retryable(), details = {cause = error_envelope.encode(err)} :: { [string]: any }}) :: error)
    end
    return {scope_name = result.scope_name}, nil
end

return {materialize = materialize}
