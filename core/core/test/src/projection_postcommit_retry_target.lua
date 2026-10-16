local fixture = require("fixture")
local writer = require("writer")
return {run = function(args: table): (any, error?)
    fixture.reset(args.operation, args.stage, errors.new({kind = args.kind, retryable = args.retryable, message = "opaque",
        details = {code = "projection_postcommit_dependency", nested = {stage = args.stage}}}), args.dialect)
    fixture.effect_id = args.thread_id
    return writer[args.operation](fixture.database(), args.thread_id, {cursor_id = "cursor", projection_id = "projection"})
end}
