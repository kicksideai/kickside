local M = {}
function M.executor(stage: string, source: any, owned: boolean): (any, table)
    local counts = {queries = 0, begins = 0, deletes = 0, commits = 0, rollbacks = 0}
    local db: any = {}
    local responses: table = {}
    counts.responses = responses
    db.query = function(_self: any, statement: string, params: table?): (any, error?)
        counts.queries = counts.queries + 1
        if stage == "query" then return nil, source end
        if responses.query then return responses.query.value, nil end
        return {{sink_id = "sink", idempotency_key = "receipt"}}, nil
    end
    db.execute = function(_self: any, statement: string, params: table): (any, error?)
        counts.deletes = counts.deletes + 1
        if stage == "delete" then return nil, source end
        if responses.delete then return responses.delete.value, nil end
        return {rows_affected = 1}, nil
    end
    db.commit = function(_self: any): (any, error?)
        counts.commits = counts.commits + 1
        if stage == "commit" then return nil, source end
        if responses.commit then return responses.commit.value, nil end
        return true, nil
    end
    db.rollback = function(_self: any): (any, error?)
        counts.rollbacks = counts.rollbacks + 1
        if counts.rollback_error then return nil, counts.rollback_error end
        return true, nil
    end
    if owned then
        db.begin = function(_self: any): (any, error?)
            counts.begins = counts.begins + 1
            if stage == "begin" then return nil, source end
            if responses.begin then return responses.begin.value, nil end
            return db, nil
        end
    else
        db.db_type = function(_self: any): string return "sqlite" end
    end
    return db, counts
end
return M
