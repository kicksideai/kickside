local sql = require("sql")
local json = require("json")
local M = {stage = "", source = nil, queries = 0, writes = 0, appends = 0, encodes = 0, recheck_source = nil}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.recheck_source = stage, source, nil
    M.queries, M.writes, M.appends, M.encodes = 0, 0, 0, 0
end
local function query(): (any, error?)
    M.queries = M.queries + 1
    if M.stage == "read" then return nil, M.source end
    if M.queries > 1 and M.recheck_source then return nil, M.recheck_source end
    if M.stage == "existing" or (M.stage == "race" and M.queries > 1) then return {{id = "thread"}}, nil end
    return {}, nil
end
local function exec(): (any, error?)
    M.writes = M.writes + 1
    if M.stage == "insert" or M.stage == "race" then return nil, M.source end
    return {rows_affected = 1}, nil
end
local function builder(method: string, ...: any): any
    local native: any = sql.builder[method](...)
    local wrapper: any = {}
    setmetatable(wrapper, {__index = function(_self: any, name: string): any
        return function(_query: any, ...: any): any
            native = native[name](native, ...)
            return wrapper
        end
    end})
    function wrapper:run_with(_db: any): any return {query = query, exec = exec} end
    return wrapper
end
function M.select(...: any): any return builder("select", ...) end
function M.insert(...: any): any return builder("insert", ...) end
function M.encode(value: any): (any, error?)
    M.encodes = M.encodes + 1
    if M.stage == "encode" then return nil, M.source end
    return json.encode(value)
end
function M.append_system(...: any): (any, error?)
    M.appends = M.appends + 1
    if M.stage == "append" then return nil, M.source end
    return {inserted = 1, duplicates = 0}, nil
end
M.append_system_tx = M.append_system
return M
