local fixture = require("fixture")
local api = require("api")
return {run = function(args: table): (any, error?)
    fixture.reset(args.stage, errors.new({kind = args.kind, retryable = args.retryable, message = "opaque",
        details = {code = "ingest_dependency", nested = {marker = "kept"}}}), nil)
    fixture.effect_id = args.thread_id
    return api.ingest_multi(fixture.database(), {{thread_id = args.thread_id, events = {{type = "guard"}}}}, nil, true)
end}
