local native = require("sql")
type DB = native.DB
type Transaction = native.Transaction
local M: any = {type = {SQLITE = "sqlite", POSTGRES = "postgres"}}
function M.reset(stage, source)
    M.stage, M.source, M.queries = stage, source, 0
    M.active, M.runs, M.missing = {}, {}, false
end
local function select(...): any
    local q: any = {}
    function q:from(name) self.name = name; return self end
    function q:where(...) return self end
    function q:limit(...) return self end
    function q:run_with(...) return self end
    function q:query()
        M.queries = M.queries + 1
        local stage = self.name == "kickside_job" and "active" or "run"
        if stage == M.stage then
            if M.missing then return M.value, nil end
            return nil, M.source
        end
        return stage == "active" and M.active or M.runs, nil
    end
    return q
end
M.builder = {select = select, eq = function(value) return value end}
return M
