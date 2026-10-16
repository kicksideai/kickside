local fixture = require("fixture")
local writer = require("writer")
return {run = function(args: table): (any, error?)
    fixture.reset(args.dialect, args.stage, errors.new({kind = args.kind, retryable = args.retryable, message = "opaque",
        details = {code = "register_completion_dependency", nested = {stage = args.stage}}}), false)
    fixture.effect_id = args.thread_id
    return writer.register_projection(fixture.database(), args.thread_id, {kind = "model", worker_ref = "func://app:test_count_worker",
        system_identity = true, reset = true})
end}
