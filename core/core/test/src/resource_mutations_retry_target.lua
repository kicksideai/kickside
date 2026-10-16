local api = require("api")
local fixture = require("fixture")
return {run = function(args: table): (any, error?)
    fixture.reset(args.stage, errors.new({kind = args.kind, retryable = args.retryable, message = "opaque", details = {code = "resource_dependency", nested = {marker = "kept"}}}), nil)
    fixture.effect_id = args.thread_id
    return api[args.method]({thread_id = args.thread_id})
end}
