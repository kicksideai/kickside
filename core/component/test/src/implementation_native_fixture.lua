local M = {}
function M.configure(source, global_rows, candidate_rows)
    M.source, M.queries, M.security_calls, M.filters = source, 0, 0, 0
    M.global_rows = global_rows or {{impl_id = "implementation"}}
    M.candidate_rows = candidate_rows or M.global_rows
end
local builder = {}
function builder:from(name) return self end
function builder:where(...) return self end
function builder:run_with(db) return self end
function builder:query(): (any, error?)
    M.queries = M.queries + 1
    if M.source then return nil, M.source end
    return M.global_rows, nil
end
M.sql = {builder = {select = function(...) return builder end}}
M.security = {can = function(action, id)
    M.security_calls = M.security_calls + 1
    return true
end}
function M.filter()
    return {where = function(self, expression, ...)
        M.filters = M.filters + 1
        return self
    end}
end
function M.candidates()
    return {
        run_with = function(self, db) return self end,
        query = function()
            M.queries = M.queries + 1
            if M.source then return nil, M.source end
            return M.candidate_rows, nil
        end,
    }
end
return M
