local M = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source, M.queries, M.inserts, M.executes = stage, source, 0, 0, 0
end
function M.transaction(): any
    return {db_type = function()
        if M.stage == "dialect" then return nil, M.source end
        return "sqlite", nil
    end, query = function(...)
        M.queries = M.queries + 1
        local stage = ({"thread", "ids", "external", "sequences"})[M.queries]
        if M.stage == stage then return nil, M.source end
        if stage == "thread" then return {{event_count = 0, max_pruned_seq = 0}}, nil end
        return {}, nil
    end, execute = function(...)
        M.executes = M.executes + 1
        local stage = M.executes == 1 and "subject_write" or "head"
        if M.stage == stage then return nil, M.source end
        return {rows_affected = 1}, nil
    end}
end
function M.insert(...): (any, error?)
    M.inserts = M.inserts + 1
    if M.stage == "insert" then return nil, M.source end
    return {rows_affected = 1}, nil
end
function M.created_at(...): (string?, error?)
    if M.stage == "created_at" then return nil, M.source end
    return "2026-10-11T00:00:00Z", nil
end
local builder = {}
function builder:columns(...) return self end
function builder:values(...) return self end
function builder:run_with(...) return self end
function builder:exec(...) return M.insert(...) end
function M.insert_builder(...) return builder end
function M.version(...): (integer?, error?) return 0, nil end
return M
