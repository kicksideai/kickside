local api = require("api")
local fixture = require("fixture")
local M = {}
function M.run(args: table): (any, error?)
    fixture.reset("release", nil, errors.new({kind = args.kind, retryable = args.retryable,
        message = "database release refuses after the durable mutation", details = {code = "projection_release"}}))
    fixture.effect_id = args.thread_id
    return api[args.method]({thread_id = args.thread_id, kind = "projection", worker_ref = "func://app:worker"})
end
return M
