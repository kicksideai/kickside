local sql = require("sql")
local M = {}
function M.reset(stage: string, source: error?, secondary: error?)
    M.stage, M.source, M.secondary, M.effect_id = stage, source, secondary, nil
    M.begins, M.locks, M.appends, M.wakes, M.commits, M.rollbacks, M.notifies, M.nudges = 0,0,0,0,0,0,0,0
end
local function result(stage: string, healthy: any): (any, error?)
    if M.stage == stage then return nil, M.source end
    if M.stage == "missing_" .. stage then return nil, nil end
    if M.stage == "invalid_" .. stage then return "invalid", nil end
    if M.stage == "success_error_" .. stage then return healthy, M.source end
    return healthy, nil
end
local tx = {}
function tx:query(...): (any, error?)
    M.locks = M.locks + 1
    return result("lock", {{id = "thread", event_count = 0}})
end
function tx:rollback(): (boolean?, error?)
    M.rollbacks = M.rollbacks + 1
    if M.stage == "missing_rollback" then return nil, nil end
    if M.stage == "false_rollback" then return false, nil end
    return M.secondary == nil, M.secondary
end
function tx:commit(): (any, error?)
    M.commits = M.commits + 1
    if M.effect_id then
        local db, err = sql.get("app:db")
        if err then error(err) end
        if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "ingest guard requires a database"})) end
        local _, write_err = db:execute("UPDATE kickside_thread SET component_id=component_id || 'x' WHERE id=$1", {M.effect_id})
        local _, release_err = db:release()
        if write_err then error(write_err) end
        if release_err then error(release_err) end
    end
    return result("commit", true)
end
function M.database(): any
    return {type = function() return "sqlite", nil end, begin = function()
        M.begins = M.begins + 1
        if M.stage == "invalid_begin" then return {}, nil end
        return result("begin", tx)
    end}
end
function M.append(...): (any, error?)
    M.appends = M.appends + 1
    if M.stage == "missing_rollback" or M.stage == "false_rollback" then return nil, M.source end
    return result("append", {thread_id = "thread", inserted = 1, duplicates = 0, max_seq = 1, marker = "kept"})
end
function M.wake(...): (any, error?)
    M.wakes = M.wakes + 1
    if M.stage == "idle" then return {{touched_count = 0}}, nil end
    return result("wake", {{touched_count = 1}})
end
function M.notify(...): (any, error?)
    M.notifies = M.notifies + 1
    if M.stage == "absent_sweeper" then return false, nil end
    return result("notify", true)
end
function M.nudge(...): (any, error?)
    M.nudges = M.nudges + 1
    return result("nudge", 1)
end
return M
