local sql = require("sql")
local M = {source = nil, query_fail = 0, write_fail = 0, stage = "", active = false, tomb = false,
    dialects = 0, queries = 0, writes = 0, begins = 0, commits = 0, rollbacks = 0}
function M.reset(stage: string, source: any, query_fail: integer, write_fail: integer, active: boolean, tomb: boolean)
    M.stage, M.source, M.query_fail, M.write_fail, M.active, M.tomb = stage, source, query_fail, write_fail, active, tomb
    M.dialects, M.queries, M.writes, M.begins, M.commits, M.rollbacks = 0, 0, 0, 0, 0, 0
end
function M.query(name: string): (any, error?)
    M.queries = M.queries + 1
    if M.queries == M.query_fail then return nil, M.source end
    if name == "kickside_thread" then return {{max_pruned_seq = 0}}, nil end
    if name == "kickside_retention_pin" and M.active then
        return {{cursor_seq = 0, generation = 1, command_id = "old-command", command_generation = 1}}, nil
    end
    if name == "kickside_retention_pin_tombstone" and M.tomb then
        return {{command_id = "older-command", command_generation = 0, pin_generation = 0, terminal_op_id = "older-op"}}, nil
    end
    return {}, nil
end
function M.exec(): (any, error?)
    M.writes = M.writes + 1
    if M.writes == M.write_fail then return nil, M.source end
    return {rows_affected = 1}, nil
end
local function builder(name: string): any
    local query: any = {}
    function query:from(table_name: string): any name = table_name; return self end
    function query:where(expression: any): any return self end
    function query:suffix(suffix: string): any return self end
    function query:set_map(values: table): any return self end
    function query:set(key: string, value: any): any return self end
    function query:run_with(db: any): any
        return {query = function(_self: any) return M.query(name) end,
            exec = function(_self: any) return M.exec() end}
    end
    return query
end
function M.select(...: any): any return builder("") end
function M.insert(name: string): any return builder(name) end
function M.update(name: string): any return builder(name) end
function M.delete(name: string): any return builder(name) end
function M.transaction(): any
    return {
        db_type = function(_self: any): (string?, error?)
            M.dialects = M.dialects + 1
            if M.stage == "dialect" then return nil, M.source end
            return sql.type.POSTGRES, nil
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
