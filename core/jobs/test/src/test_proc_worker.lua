-- Test-only proc:// projection worker. Mirrors test_count_worker but as a
-- process.lua so a projection can bind a proc:// worker_ref in the runner suite.
-- It counts the events it was handed into the projection body and returns the
-- patch. It is invoked through process.exec only in an integration path; the
-- runner fence tests drive catchup's proc functions directly with a fabricated
-- worker_output, so this entry exists chiefly to make a proc worker_ref resolve.

local json = require("json")
local security = require("security")

local function run(input: table): table
    input = type(input) == "table" and input or {}
    local body = type(input.projection) == "table" and type(input.projection.body) == "table" and input.projection.body or {}
    body.stats = type(body.stats) == "table" and body.stats or {}
    local range = type(input.range) == "table" and input.range or {}
    local processed = tonumber(range.processed_count) or 0
    body.stats.count = (tonumber(body.stats.count) or 0) + processed
    local actor = security.actor()
    local scope = security.scope()
    if not actor then
        error("proc worker missing ambient actor")
    end
    if not scope then
        error("proc worker missing ambient scope")
    end
    local meta = actor:meta() or {}
    body.proc_actor_id = tostring(actor:id())
    body.proc_actor_user_id = meta.user_id
    body.proc_has_scope = true
    return { body = body }
end

return { run = run }
