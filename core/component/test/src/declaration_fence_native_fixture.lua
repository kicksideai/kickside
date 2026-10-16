local M: any = {}
function M.reset(operation, source)
    M.operation, M.source = operation, source
    M.queries, M.writes = 0, 0
    M.rows = {{automation_id = "automation", applied_command_generation = 2, command_id = "command", declaration_hash = "hash"}}
end
function M.builder(operation): any
    local query = {}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:limit(...) return self end
    function query:set(...) return self end
    function query:set_map(...) return self end
    function query:run_with(executor) self.executor = executor; return self end
    function query:query(): (any, error?)
        M.queries = M.queries + 1
        if M.source then return nil, M.source end
        return M.rows, nil
    end
    function query:exec(): (any, error?)
        M.writes = M.writes + 1
        M.write_operation = operation
        if M.source then return nil, M.source end
        return {rows_affected = 1}, nil
    end
    return query
end
return M
