local M = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source, M.queries, M.accesses = stage, source, 0, 0
    M.rows = {{id = "thread", component_id = "component", marker = "kept"}}
    M.append_options = nil
end
function M.query(...): (any, error?)
    M.queries = M.queries + 1
    if M.stage == "query" then return nil, M.source end
    if M.stage == "missing_rows" then return nil, nil end
    if M.stage == "scalar_rows" then return true, nil end
    if M.stage == "scalar_row" then return {true}, nil end
    if M.stage == "sparse_rows" then return {[2] = {id = "thread", component_id = "component"}}, nil end
    if M.stage == "missing_row_id" then return {{component_id = "component"}}, nil end
    if M.stage == "missing_component" then return {{id = "thread"}}, nil end
    if M.stage == "empty" then return {}, nil end
    return M.rows, nil
end
function M.database(): any
    return {query = M.query, type = function()
        if M.stage == "type" then return nil, M.source end
        if M.stage == "missing_type" then return nil, nil end
        if M.stage == "invalid_type" then return true, nil end
        return "sqlite", nil
    end}
end
function M.has_access(...): (boolean?, error?)
    M.accesses = M.accesses + 1
    if M.stage == "access" then return false, M.source end
    if M.stage == "access_success_error" then return true, M.source end
    if M.stage == "missing_access" then return nil, nil end
    if M.stage == "denied" then return false, nil end
    return true, nil
end
function M.append_events_tx(_tx: any, _id: any, _events: any, options: any): (any, error?)
    M.append_options = options
    return {inserted = 1, max_seq = options.locked_thread and options.locked_thread.event_count + 1 or 1}, nil
end
local builder = {}
function builder:from(...) return self end
function builder:where(...) return self end
function builder:limit(...) return self end
function builder:run_with(...) return self end
function builder:query(...) return M.query(...) end
function M.select(...) return builder end
return M
