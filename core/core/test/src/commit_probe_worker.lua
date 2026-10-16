local sql = require("sql")
local json = require("json")
local M = {}
function M.run(input: any): any
    local body = input.projection.body
    local mode = body.worker_config.mode
    if mode == "fail" then error("test fold failed") end
    if mode == "stale" then
        local db = assert(sql.get("app:db"))
        assert(db:execute("UPDATE kickside_projection_cursor SET generation=generation+1 WHERE id=$1", { input.cursor.id }))
        db:release()
    end
    body.value = input.range.to_seq
    return { body = body, last_seq = input.range.to_seq }
end
function M.after_commit(input: any): any
    -- A separate connection observes the durable fold. On SQLite this also
    -- catches invoking a DB-using callback while retaining the sole connection.
    local db = assert(sql.get("app:db"))
    local rows = assert(db:query("SELECT body,last_event_seq FROM kickside_projection WHERE id=$1", { input.projection.id }))
    local body = json.decode(rows[1].body)
    if tonumber(rows[1].last_event_seq) ~= input.range.to_seq or body.value ~= input.range.to_seq then
        db:release()
        error("notification observed uncommitted projection")
    end
    assert(db:execute([[INSERT INTO projection_commit_probe (projection_id,calls) VALUES ($1,1)
        ON CONFLICT(projection_id) DO UPDATE SET calls=projection_commit_probe.calls+1]], { input.projection.id }))
    db:release()
    return {}
end
return M
