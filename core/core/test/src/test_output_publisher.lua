-- Test-only function that models a producer with a declared Threads output
-- capability. The Threads append contract sees the function's active security
-- frame, not a caller-supplied capability flag.

local security = require("security")
local contract = require("contract")
local errors = require("errors")

local M = {}

function M.publish(args: any): (any?, error?)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, (errors.new({ message = "test publisher security frame is required", kind = errors.PERMISSION_DENIED }) :: error)
    end

    local def, def_err = contract.get("kickside.core:threads")
    if def_err then return nil, def_err end
    if not def then return nil, (errors.new({ message = "Threads contract is unavailable", kind = errors.INTERNAL }) :: error) end
    local inst, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err then return nil, open_err end
    if not inst then return nil, (errors.new({ message = "Threads contract open returned no instance", kind = errors.INTERNAL }) :: error) end
    if args.operation == "emit" then
        return (inst :: any):emit(args)
    end
    return (inst :: any):append_event(args)
end

return M
