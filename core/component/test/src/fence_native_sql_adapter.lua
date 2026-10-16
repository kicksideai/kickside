local native = require("sql")
type DB = native.DB
type Transaction = native.Transaction
local M = {type = native.type, as = native.as}
local function builder()
    local query = {}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:limit(...) return self end
    function query:suffix(...) return self end
    function query:set(...) return self end
    function query:run_with(db) self.db = db; return self end
    function query:query(): (any, error?) return self.db:query() end
    function query:exec(): (any, error?) return self.db:execute() end
    return query
end
M.builder = {select = builder, update = builder}
return M
