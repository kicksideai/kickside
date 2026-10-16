local sql = require("sql")
local M = {}
function M.run(input: table): (any?, error?)
    local db, open_err = sql.get("app:db")
    if open_err then return nil, open_err end
    if not db then return nil, errors.new({kind = errors.INTERNAL, message = "effect probe has no database", retryable = false}) end
    local _, write_err = db:execute("UPDATE kickside_thread SET component_id = component_id || 'x' WHERE id=$1", {input.thread_id})
    db:release()
    if write_err then return nil, write_err end
    return nil, errors.new({kind = input.kind, retryable = input.retryable,
        message = "worker refuses after its durable effect", details = {code = "projection_retry_effect"}})
end
return M
