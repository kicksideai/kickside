local fixture = require("fixture")
local api = require("api")
return {run = function(args: table): (any, error?)
    fixture.reset(args.stage, errors.new({kind = args.kind, retryable = args.retryable, message = "opaque", details = {code = "update_dependency", nested = {marker = "kept"}}}), nil)
    fixture.effect_id = args.thread_id
    return api.update(fixture.database(), args.thread_id, fixture.params(), nil)
end}
