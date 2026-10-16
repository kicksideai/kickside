local sql = require("sql")
local M = {}
function M.reset(stage: string, source: error?, secondary: error?)
    M.stage, M.source, M.secondary, M.effect_id = stage, source, secondary, nil
    M.begins, M.inserts, M.rollbacks, M.commits, M.attachments = 0, 0, 0, 0, 0
end
function M.prepare(...)
    return {thread_class = "guard_class", attrs = "{}"}, nil
end
function M.declared_class(...): string? return nil end
function M.class_error(...): error? return nil end
function M.insert(...): error?
    M.inserts = M.inserts + 1
    return (M.stage == "insert" or M.stage == "missing_rollback") and M.source or nil
end
function M.dbtype_of(...): (string?, error?) return "sqlite", nil end
function M.impl_id(...): (string?, error?) return "guard:kind", nil end
local tx = {}
function tx:rollback(): (boolean?, error?)
    M.rollbacks = M.rollbacks + 1
    if M.stage == "missing_rollback" then return nil, nil end
    return M.secondary and nil or true, M.secondary
end
function tx:commit(): (boolean?, error?)
    M.commits = M.commits + 1
    if M.stage == "missing_commit" then return nil, nil end
    if M.effect_id then
        local db, err = sql.get("app:db")
        if err then return nil, err end
        if not db then return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "create retry guard requires a database"}) end
        local _, write_err = db:execute("UPDATE kickside_thread SET component_id=component_id || 'x' WHERE id=$1", {M.effect_id})
        local _, release_err = db:release()
        if write_err then error(write_err) end
        if release_err then error(release_err) end
    end
    if M.stage == "commit" then return nil, M.source end
    return true, nil
end
function M.database(): any
    return {begin = function()
        M.begins = M.begins + 1
        if M.stage == "begin" then return nil, M.source end
        if M.stage == "missing_begin" then return nil, nil end
        if M.stage == "invalid_begin" then return {}, nil end
        return tx, nil
    end,
    query = function() return {{id = "thread", thread_class = "guard_class", marker = "kept"}}, nil end}
end
function M.upsert(...)
    M.attachments = M.attachments + 1
    return {}, nil
end
function M.find_by_thread(...) return nil, nil end
return M
