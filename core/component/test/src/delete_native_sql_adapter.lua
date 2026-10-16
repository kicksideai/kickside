local native = require("sql")
type DB = native.DB
type Transaction = native.Transaction
local M = {type = native.type}
M.builder = {delete = function()
    local query = {}
    function query:where(...) return self end
    function query:run_with(tx) self.tx = tx; return self end
    function query:exec(): (any, error?) return self.tx:execute("DELETE") end
    return query
end}
return M
