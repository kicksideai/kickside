local sql = require("sql")
local M = {}
function M.reset(stage: string, source: error?, secondary: error?)
    M.stage, M.source, M.secondary, M.effect_id = stage, source, secondary, nil
    M.opens, M.writes, M.releases, M.notifications = 0, 0, 0, 0
end
function M.open_db(): (any, error?)
    M.opens = M.opens + 1
    if M.stage == "open" then return nil, M.source end
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "release" then return nil, M.source end
        return true, M.secondary
    end}, nil
end
function M.write(...): (any, error?)
    M.writes = M.writes + 1
    if M.stage == "write" then return nil, M.source end
    if M.stage == "missing_write" then return nil, nil end
    if M.effect_id then
        local db, err = sql.get("app:db")
        if err then return nil, err end
        if not db then return nil, errors.new({kind = errors.INTERNAL, retryable = false, message = "durable resource guard database absent"}) end
        local _, write_err = db:execute("UPDATE kickside_thread SET component_id = component_id || 'x' WHERE id=$1", {M.effect_id})
        local _, release_err = db:release()
        if release_err then return nil, release_err end
        if write_err then return nil, write_err end
    end
    if M.stage == "unproven_effect" then return nil, nil end
    return {id = "thread", thread_id = "thread", marker = "kept"}, nil
end
function M.emit_update(...): error?
    M.notifications = M.notifications + 1
    if M.stage == "notify" then return M.source end
    return nil
end
return M
