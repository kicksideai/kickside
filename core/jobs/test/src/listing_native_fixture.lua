local M: any = {}
function M.reset(stage, source, dialect, transaction)
    M.stage, M.source, M.dialect, M.transaction = stage, source, dialect, transaction
    M.missing, M.proof, M.queries, M.types = false, nil, 0, 0
    M.rows = {{id = "job", owner_id = "owner", created_at = "2099-01-01T00:00:00Z"}}
end
function M.result(stage, value): (any, error?)
    if M.stage == stage then
        if M.missing then return M.proof, nil end
        if M.source then return nil, M.source end
    end
    return value, nil
end
function M.executor(): any
    local db = {}
    local function dialect()
        M.types = M.types + 1
        return M.result("dialect", M.dialect)
    end
    if M.transaction then db.db_type = dialect else db.type = dialect end
    return db
end
function M.builder(): any
    local query = {}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:order_by(...) return self end
    function query:limit(value) self.limit_value = value; return self end
    function query:run_with(executor) self.executor = executor; return self end
    function query:query(): (any, error?)
        M.queries = M.queries + 1
        local stage = M.anchor and M.queries == 1 and "anchor" or "rows"
        return M.result(stage, M.rows)
    end
    return query
end
return M
