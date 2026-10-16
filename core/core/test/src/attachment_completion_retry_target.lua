local api = require("api")
local fixture = require("fixture")
return {run = function(args: table): (any, error?)
    fixture.reset(args.method, args.stage, errors.new({kind = args.kind, retryable = args.retryable, message = "opaque", details = {code = "attachment_dependency", nested = {marker = "kept"}}}), nil)
    fixture.effect_id = args.thread_id
    if args.method == "emit" then return api.emit({component_id = "thread", type = "event"}) end
    local target = api[args.method]
    if type(target) ~= "function" then
        error(errors.new({kind = errors.INTERNAL, retryable = false, message = "attachment guard requires a declared resource method"}))
    end
    return target({id = "thread", component_id = "thread"})
end}
