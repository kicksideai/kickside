local M = {}
local options: any = {}
local counts: any = {}
local function failure(phase: string): error?
    counts[phase] = (counts[phase] or 0) + 1
    local err = options[phase]
    return err
end
function M.reset(next_options: any): any
    options, counts = next_options, {}
    return counts
end
local tx: any = {
    rollback = function() return true, failure("rollback") end,
    commit = function() return true, failure("commit") end,
}
local db: any = {
    begin = function() return tx, failure("begin") end,
    release = function() return true, failure("release") end,
}
function M.open_db(): (any?, error?) return db, failure("open") end
function M.lock_history(): error? return failure("lock") end
function M.read_history(): (any?, error?) return { undo = {}, redo = {} }, failure("history") end
function M.read_state(handle: any, _workflow_id: string): (any?, error?)
    return { params = {} }, failure(handle == db and "post" or "state")
end
function M.latest_published_interface(): (any?, error?) return {}, failure("published") end
function M.head_seq(): (number, error?) return 0, failure("head") end
function M.append_event(): error? return failure("append") end
function M.project_event(): error? return failure("project") end
function M.write_history(): error? return failure("save") end
function M.decorate_snapshot(_handle: any, snapshot: any): any return snapshot end
return M
