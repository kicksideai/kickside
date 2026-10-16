local sql = require("sql")
local M = {stage = "", source = nil, dialect = "", dialects = 0, queries = 0,
    writes = 0, begins = 0, commits = 0, rollbacks = 0}
function M.reset(stage: string, source: any, dialect: string)
    M.stage, M.source, M.dialect = stage, source, dialect
    M.dialects, M.queries, M.writes, M.begins, M.commits, M.rollbacks = 0, 0, 0, 0, 0, 0
    M.response_method, M.response_index, M.response = nil, nil, nil
end
function M.respond(method: string, index: integer, response: any)
    M.response_method, M.response_index, M.response = method, index, response
end
function M.transaction(): any
    return {
        db_type = function(_self: any): (string?, error?)
            M.dialects = M.dialects + 1
            if M.stage == "dialect" then return nil, M.source end
            return M.dialect, nil
        end,
        query = function(_self: any, statement: string, params: table): (any, error?)
            M.queries = M.queries + 1
            if M.response_method == "query" and M.queries == M.response_index then return M.response, nil end
            if (M.queries == 1 and M.stage == "thread") or (M.queries == 2 and M.stage == "prefix") then
                return nil, M.source
            end
            if M.queries == 1 then return {{max_pruned_seq = 0}}, nil end
            if M.dialect == sql.type.POSTGRES then
                return {{deleted = 1, max_pruned_seq = 5, boundary_updates = 1}}, nil
            end
            return {{value = 5}}, nil
        end,
        execute = function(_self: any, statement: string, params: table): (any, error?)
            M.writes = M.writes + 1
            if M.response_method == "execute" and M.writes == M.response_index then return M.response, nil end
            if (M.writes == 1 and M.stage == "delete") or (M.writes == 2 and M.stage == "boundary") then
                return nil, M.source
            end
            return {rows_affected = 1}, nil
        end,
        rollback = function(_self: any): (boolean, error?) M.rollbacks = M.rollbacks + 1; return true, nil end,
        commit = function(_self: any): (boolean?, error?)
            M.commits = M.commits + 1
            if M.stage == "commit" then return nil, M.source end
            return true, nil
        end,
    }
end
function M.database(): any
    return {begin = function(_self: any): (any, error?)
        M.begins = M.begins + 1
        if M.stage == "begin" then return nil, M.source end
        return M.transaction(), nil
    end}
end
return M
