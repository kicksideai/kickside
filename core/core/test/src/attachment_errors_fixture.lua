local M = {}
function M.reset(stage: string, primary: error?, secondary: error?)
    M.stage, M.primary, M.secondary = stage, primary, secondary
    M.reads, M.purges, M.upserts = 0, 0, 0
end
function M.upsert(...)
    M.upserts = M.upserts + 1
    if M.stage == "retention" or M.stage == "missing_purge" or M.stage == "scalar_purge" then return nil, M.primary end
    return {}, nil
end
function M.read(...)
    M.reads = M.reads + 1
    if M.stage == "read" then return nil, M.primary end
    if M.stage == "missing" then return nil, nil end
    if M.stage == "empty" then return {}, nil end
    if M.stage == "scalar_rows" then return "opaque", nil end
    if M.stage == "scalar_thread" then return {"opaque"}, nil end
    return {{id = "thread", thread_class = "test_class", marker = "kept"}}, nil
end
function M.database(): any return {query = M.read} end
function M.purge(...)
    M.purges = M.purges + 1
    if M.stage == "missing_purge" then return nil, nil end
    if M.stage == "scalar_purge" then return "opaque", nil end
    if M.secondary then return nil, M.secondary end
    return {purged = true}, nil
end
return M
