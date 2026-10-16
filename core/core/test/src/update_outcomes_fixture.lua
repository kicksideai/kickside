local sql = require("sql")
local M = {}
function M.reset(stage: string, source: error?, secondary: error?)
    M.stage, M.source, M.secondary, M.effect_id = stage, source, secondary, nil
    M.begins, M.rollbacks, M.commits, M.writes, M.reads, M.locks, M.captures = 0,0,0,0,0,0,0
end
function M.gate_write(...): (any, error?) return {id = "thread", component_id = "component"}, nil end
function M.dbtype_of(...): (string?, error?) return "sqlite", nil end
function M.lock(...): error?
    M.locks = M.locks + 1
    return M.stage == "lock" and M.source or nil
end
function M.capture(...): (any, error?)
    M.captures = M.captures + 1
    if M.stage == "capture" or M.stage == "missing_rollback" or M.stage == "false_rollback" then return nil, M.source end
    return {}, nil
end
local tx = {}
function tx:rollback(): (boolean?, error?)
    M.rollbacks = M.rollbacks + 1
    if M.stage == "missing_rollback" then return nil, nil end
    if M.stage == "false_rollback" then return false, nil end
    return M.secondary == nil, M.secondary
end
function tx:commit(): (boolean?, error?)
    M.commits = M.commits + 1
    if M.effect_id then
        local db, err = sql.get("app:db")
        if err then error(err) end
        if not db then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "update guard requires a database"})) end
        local _, write_err = db:execute("UPDATE kickside_thread SET component_id=component_id || 'x' WHERE id=$1", {M.effect_id})
        local _, release_err = db:release()
        if write_err then error(write_err) end
        if release_err then error(release_err) end
    end
    if M.stage == "missing_commit" then return nil, nil end
    return M.stage ~= "commit", M.stage == "commit" and M.source or nil
end
function M.database(): any
    return {begin = function()
        M.begins = M.begins + 1
        if M.stage == "begin" then return nil, M.source end
        if M.stage == "missing_begin" then return nil, nil end
        if M.stage == "invalid_begin" then return {}, nil end
        return tx, nil
    end, query = function()
        M.reads = M.reads + 1
        if M.stage == "read" then return nil, M.source end
        if M.stage == "missing_rows" then return nil, nil end
        if M.stage == "invalid_rows" then return true, nil end
        if M.stage == "invalid_row" then return {true}, nil end
        if M.stage == "sparse_rows" then return {[2] = {id = "thread"}}, nil end
        if M.stage == "multiple_rows" then return {{id = "thread"},{id = "other"}}, nil end
        if M.stage == "empty_rows" then return {}, nil end
        return {{id = "thread", marker = "kept"}}, nil
    end}
end
local builder = {}
function builder:set(...) return self end
function builder:where(...) return self end
function builder:run_with(...) return self end
function builder:exec(...)
    M.writes = M.writes + 1
    return {rows_affected = 1}, nil
end
function M.update(...) return builder end
function M.params(): table
    return {has_state = true, state = "open", has_attrs = M.stage == "lock" or M.stage == "capture" or M.stage == "missing_rollback" or M.stage == "false_rollback", attrs_json = "{}"}
end
return M
