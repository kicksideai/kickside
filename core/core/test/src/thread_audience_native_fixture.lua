local sql = require("sql")
local M = {stage = "", source = nil, absent = false, attrs = nil, real = false,
    gets = 0, queries = 0, releases = 0, lookups = 0, sends = 0}
function M.reset(stage: string, source: any, absent: boolean?, attrs: any, real: boolean?)
    M.stage, M.source, M.absent, M.attrs, M.real = stage, source, absent == true, attrs, real == true
    M.gets, M.queries, M.releases, M.lookups, M.sends = 0, 0, 0, 0, 0
end
function M.get(id: string): (any, error?)
    M.gets = M.gets + 1
    if M.stage == "get" then return nil, M.source end
    if M.absent then return nil, nil end
    local real_db = nil
    if M.real then
        local db, err = sql.get(id)
        if err then return nil, err end
        real_db = db
    end
    return {
        query = function(_self: any, statement: string, params: table): (any, error?)
            M.queries = M.queries + 1
            if M.stage == "query" then return nil, M.source end
            if real_db then return real_db:query(statement, params) end
            if M.attrs == nil then return {}, nil end
            return {{attrs = M.attrs}}, nil
        end,
        release = function(_self: any)
            M.releases = M.releases + 1
            if real_db then real_db:release() end
        end,
    }, nil
end
function M.lookup(name: string): (any, error?)
    M.lookups = M.lookups + 1
    return nil, nil
end
function M.send(pid: string, topic: string, data: any): (any, error?)
    M.sends = M.sends + 1
    return true, nil
end
return M
