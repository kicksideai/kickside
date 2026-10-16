local fixture = require("fixture")
local api = require("api")
return {run = function(args: table): (any, error?)
    fixture.reset(args.method, "open", errors.new({kind = errors.TIMEOUT, retryable = true, message = "operation refuses", details = {code = "registration_operation"}}),
        errors.new({kind = args.kind, retryable = args.retryable, message = "cleanup refuses", details = {code = "registration_cleanup", nested = {marker = "kept"}}}))
    fixture.effect_id = args.thread_id
    local method = api[args.method]
    if type(method) ~= "function" then
        return nil, errors.new({kind = errors.INVALID, retryable = false, message = "registration retry guard method is required"})
    end
    return method({id = args.thread_id, component_id = args.thread_id})
end}
