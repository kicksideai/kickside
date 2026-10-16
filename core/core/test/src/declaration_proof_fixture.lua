local M = {}
function M.reset(stage: string, source: error?)
    M.stage, M.source = stage, source
    M.reads, M.registers = 0, 0
end
function M.projections(...): any
    return {{kind = "guard_projection", worker_ref = "app:guard_worker", on = "thread"}}
end
function M.database(): any
    return {query = function()
        M.reads = M.reads + 1
        if M.stage == "read" then return nil, M.source end
        if M.stage == "missing_rows" then return nil, nil end
        if M.stage == "scalar_rows" then return true, nil end
        if M.stage == "scalar_row" then return {true}, nil end
        if M.stage == "sparse_rows" then return {[2] = {id = "cursor"}}, nil end
        if M.stage == "keyed_rows" then return {named = {id = "cursor"}}, nil end
        if M.stage == "missing_id" then return {{}}, nil end
        if M.stage == "empty_id" then return {{id = ""}}, nil end
        if M.stage == "invalid_id" then return {{id = true}}, nil end
        if M.stage == "existing" then return {{id = "cursor"}}, nil end
        return {}, nil
    end}
end
function M.register(...): (any, error?)
    M.registers = M.registers + 1
    if M.stage == "register" then return nil, M.source end
    if M.stage == "missing_registration" then return nil, nil end
    if M.stage == "scalar_registration" then return true, nil end
    return {projection_id = "projection", cursor_id = "cursor", job_id = "job"}, nil
end
return M
