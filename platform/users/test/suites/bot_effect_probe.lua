local security = require("security")
local store = require("store")
local identity = require("execution_identity")

return {run = function(args)
    local nested, capture_err = identity.capture(args.capture)
    if capture_err then return nil, capture_err end
    if not security.can("access", "app:run_as_membership_extension") then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, retryable = false, message = "effect resource access is denied"})
    end
    local actor = assert(security.actor())
    local records = assert(store.get("app:bot_execution_effects"))
    local count, read_err = records:get("bot_effect:" .. actor:id())
    if read_err then records:release(); return nil, read_err end
    local saved, write_err = records:set("bot_effect:" .. actor:id(), count + 1)
    records:release()
    if write_err then return nil, write_err end
    assert(saved)
    return {actor_id = actor:id(), meta = actor:meta(), nested = nested}
end}
