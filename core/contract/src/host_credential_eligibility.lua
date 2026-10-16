local registry = require("registry")
local funcs = require("funcs")
local M = {}

function M.check(args: any): (boolean?, error?)
    local entry, err = registry.get("kickside.contract:host_credential_eligibility")
    if err then return nil, err end
    local target = (entry :: any).meta.credential_eligibility
    if type(target) ~= "string" or target == "" then
        return nil, (errors.new({kind = errors.INVALID, retryable = false,
            message = "host credential eligibility requires a configured guard"}) :: error)
    end
    local eligible, check_err = funcs.call(target, args)
    if check_err then return nil, check_err end
    if eligible ~= true then
        return nil, (errors.new({kind = errors.INTERNAL, retryable = false,
            message = "host credential eligibility guard returns an invalid result"}) :: error)
    end
    return true, nil
end

return M
