local fixture = require("fixture")
local writer = require("writer")
return {run = function(args: table): (any, error?)
    fixture.reset("commit", errors.new({kind = args.kind, retryable = args.retryable, message = "opaque",
        details = {code = "projection_transaction_dependency", nested = {marker = "kept"}}}), nil, args.dialect)
    fixture.effect_id = args.thread_id
    return writer.pause(fixture.database(), args.thread_id, {cursor_id = "cursor"})
end}
