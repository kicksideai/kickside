local M = {}
function M.reset(stage: string, source: error?, secondary: error?)
    M.stage, M.source, M.secondary, M.reads, M.releases, M.opens = stage, source, secondary, 0, 0, 0
end
function M.list(...): (any, error?, any, any)
    if M.stage == "empty_components" then return {}, nil, {}, {has_more = false, next_offset = 0} end
    if M.stage == "missing_page" then return {"component"}, nil, nil, nil end
    return {"component"}, nil, {}, {has_more = false, next_offset = 1}
end
function M.open(): (any, error?)
    M.opens = M.opens + 1
    if M.stage == "open" then return nil, M.source end
    if M.stage == "missing_open" then return nil, nil end
    return {release = function()
        M.releases = M.releases + 1
        if M.stage == "missing_release" then return nil, nil end
        if M.stage == "false_release" then return false, nil end
        return M.stage == "release" and nil or true, M.stage == "release" and M.source or M.secondary
    end}, nil
end
function M.query(...): (any, error?)
    M.reads = M.reads + 1
    if M.stage == "read" then return nil, M.source end
    if M.stage == "missing_rows" then return nil, nil end
    if M.stage == "invalid_rows" then return true, nil end
    if M.stage == "sparse_rows" then return {[2] = {id = "thread"}}, nil end
    if M.stage == "invalid_row" then return {true}, nil end
    if M.stage == "missing_id" then return {{}}, nil end
    if M.stage == "invalid_id" then return {{id = 12}}, nil end
    if M.stage == "empty_id" then return {{id = ""}}, nil end
    if M.stage == "empty_mapping" then return {}, nil end
    return {{id = "b"},{id = "a"},{id = "a"}}, nil
end
local builder = {}
function builder:from(...) return self end
function builder:where(...) return self end
function builder:order_by(...) return self end
function builder:run_with(...) return self end
function builder:query(...) return M.query(...) end
function M.select(...) return builder end
return M
