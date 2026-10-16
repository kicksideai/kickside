local M = {}
function M.configure(stage, source)
    M.stage, M.source, M.calls = stage, source, {}
end
local function record(stage)
    table.insert(M.calls, stage)
    if M.stage == stage then return nil, M.source end
    return true, nil
end
local db = {}
function db:release() table.insert(M.calls, "release") end
function db:query(statement, params): (any, error?)
    local _, err = record("query")
    if err then return nil, err end
    return {{private_context = '{"_execution_identity":{"principal":{"kind":"user","id":"principal"}}}',
        identity_generation = 1, identity_hash = "hash", declaration_hash = "declaration"}}, nil
end
function M.get(id): (any, error?)
    local _, err = record("get")
    if err then return nil, err end
    if M.stage == "missing_database" then return nil, nil end
    return db, nil
end
function M.check_user_access(...): (boolean, error?)
    local _, err = record("access")
    if err then return false, err end
    return true, nil
end
return M
