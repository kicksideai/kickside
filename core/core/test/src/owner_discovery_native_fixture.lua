local M = {stage = "", source = nil, malformed = false, value = nil, serial = 0,
    versions = 0, finds = 0, queries = 0, gets = 0, releases = 0, calls = 0}
function M.reset(stage: string, source: any, malformed: boolean, value: any)
    M.stage, M.source, M.malformed, M.value = stage, source, malformed, value
    M.versions, M.finds, M.queries, M.gets, M.releases, M.calls = 0, 0, 0, 0, 0, 0
    M.serial = M.serial + 1
    M.owners = nil
end
function M.current_version(): (any, error?)
    M.versions = M.versions + 1
    if M.stage == "version" then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return {id = function() return "owner-discovery-fixture-" .. M.serial end}, nil
end
function M.find(criteria: table): (any, error?)
    M.finds = M.finds + 1
    local stage = criteria["meta.type"] == "kickside.retention.owner" and "owners" or
        criteria[".kind"] == "ns.definition" and "definitions" or "migrations"
    if M.stage == stage then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    if stage == "owners" then return M.owners or {{id = "fixture:owner"}}, nil end
    if stage == "definitions" then return {{id = "fixture:definition"}}, nil end
    return {{id = "fixture:migration", meta = {target_db = "app:db"}}}, nil
end
function M.query(self: any, statement: string): (any, error?)
    M.queries = M.queries + 1
    if statement ~= "SELECT id FROM _migrations" then
        error(errors.new({kind = errors.INTERNAL, retryable = false, message = "unexpected ledger query"}))
    end
    if M.stage == "rows" then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return {{id = "fixture:migration"}}, nil
end
function M.release(self: any) M.releases = M.releases + 1 end
function M.db(): any return {query = M.query, release = M.release} end
function M.get(id: string): (any, error?)
    M.gets = M.gets + 1
    if M.stage == "database" then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return M.db(), nil
end
function M.table_exists(db: any): (any, error?)
    if M.stage == "exists" then
        if M.source then return nil, M.source end
        if M.malformed then return M.value, nil end
    end
    return true, nil
end
function M.call(id: string, input: table): (any, error?)
    M.calls = M.calls + 1
    if M.stage == "response" then return M.value, nil end
    if M.stage == "call" then return nil, M.source end
    if M.stage == "owner" then return {success = false, error = M.source}, nil end
    return {success = true, deleted = 1}, nil
end
return M
