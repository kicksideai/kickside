local process = require("process")
local function claim(args): (any?, error?)
    local registered, err = process.registry.register(args.name, nil, process.registry.CONSISTENT)
    if not registered or err then return nil, err end
    local removed, remove_err = process.registry.unregister(args.name, process.registry.CONSISTENT)
    if not removed or remove_err then return nil, remove_err end
    return { claimed = true }, nil
end
return { claim = claim }
