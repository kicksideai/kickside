local native = require("sql")
type DB = native.DB
local M = {builder = {}}
M.builder.select = function()
    local query = {}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:limit(...) return self end
    function query:run_with(db) self.db = db; return self end
    function query:query(): (any, error?) return self.db:query("lookup") end
    return query
end
M.builder.eq = function(value) return value end
return M
