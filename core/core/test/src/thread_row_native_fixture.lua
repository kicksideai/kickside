local sql = require("sql")
local json = require("json")
local M = {stage = "", source = nil, writes = 0, queries = 0, proof = nil}
function M.reset(stage: string, source: any)
    M.stage, M.source, M.proof = stage, source, nil
    M.writes, M.queries = 0, 0
end
local function exec(): (any, error?)
    M.writes = M.writes + 1
    if (M.stage == "insert" and M.writes == 1) or (M.stage == "edge" and M.writes == 2) then return nil, M.source end
    if (M.stage == "insert_proof" and M.writes == 1) or (M.stage == "edge_proof" and M.writes == 2) then return M.proof, nil end
    if M.stage == "duplicate" and M.writes == 1 then return {rows_affected = 0}, nil end
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
    function wrapper:run_with(_db: any): any return {exec = exec} end
    return wrapper
end
function M.insert(...: any): any return builder("insert", ...) end
function M.decode(value: string): (any, error?)
    if M.stage == "decode" then return nil, M.source end
    return json.decode(value)
end
function M.transaction(): any
    return {query = function(_self: any, statement: string, args: any): (any, error?)
        M.queries = M.queries + 1
        if M.stage == "parent" then return nil, M.source end
        if M.stage == "parent_proof" then return M.proof, nil end
        if M.stage == "absent_parent" then return {}, nil end
        return {{id = "parent"}}, nil
    end}
end
return M
