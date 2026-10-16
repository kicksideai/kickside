local sql = require("sql")
local M = {stage = "", source = nil, missing = false, queries = 0, types = 0, writes = 0, notifications = 0}
function M.reset(stage: string, source: any, missing: boolean?)
    M.stage, M.source, M.missing = stage, source, missing == true
    M.queries, M.types, M.writes, M.notifications = 0, 0, 0, 0
end
function M.select(...: any): any
    local native = sql.builder.select(...)
    local wrapper: any = {}
    function wrapper:from(name: string): any
        native = native:from(name)
        return self
    end
    function wrapper:where(expression: any): any
        native = native:where(expression)
        return self
    end
    function wrapper:limit(count: integer): any
        native = native:limit(count)
        return self
    end
    function wrapper:run_with(db: any): any
        local executor = native:run_with(db)
        return {query = function(_self: any): (any, error?)
            M.queries = M.queries + 1
            if M.stage == "query" then return nil, M.source end
            return executor:query()
        end}
    end
    return wrapper
end
function M.database(db: sql.DB): any
    return {
        type = function(_self: any): (any, error?)
            M.types = M.types + 1
            if M.stage == "type" then return nil, M.source end
            return db:type()
        end,
        execute = function(_self: any, statement: string, params: table): (any, error?)
            M.writes = M.writes + 1
            if M.stage == "execute" then return nil, M.source end
            if M.missing then return nil, nil end
            return db:execute(statement, params)
        end,
    }
end
function M.notify(change: table): (boolean?, error?)
    M.notifications = M.notifications + 1
    M.change = change
    if M.stage == "notify" then return nil, M.source end
    return true, nil
end
return M
