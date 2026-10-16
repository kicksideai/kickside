local sql = require("sql")
local M = {source = nil, stage = "", fail_at = 1, queries = 0, dialects = 0, db = nil, first_rows = {}}
function M.reset(db: any, stage: string, source: any, fail_at: integer, first_rows: any)
    M.db, M.stage, M.source, M.fail_at, M.first_rows = db, stage, source, fail_at, first_rows
    M.queries, M.dialects = 0, 0
end
function M.database(): any
    return {type = function(_self: any): (any, error?)
        M.dialects = M.dialects + 1
        if M.stage == "type" then return nil, M.source end
        return M.db:type()
    end}
end
function M.select(...: any): any
    local native: any = sql.builder.select(...)
    local wrapper: any = {}
    setmetatable(wrapper, {__index = function(_self: any, method: string): any
        return function(_query: any, ...: any): any
            native = native[method](native, ...)
            return wrapper
        end
    end})
    function wrapper:run_with(db: any): any
        local executor = native:run_with(M.db)
        return {query = function(_self: any): (any, error?)
            M.queries = M.queries + 1
            if M.stage == "query" and M.queries == M.fail_at then return nil, M.source end
            if M.queries < M.fail_at then return M.first_rows, nil end
            return executor:query()
        end}
    end
    return wrapper
end
return M
