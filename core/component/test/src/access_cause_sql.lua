local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
local function builder(operation)
    local query: any = {}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:limit(...) return self end
    function query:set(...) return self end
    function query:set_map(...) return self end
    function query:suffix(...) return self end
    function query:run_with(db) self.db = db; return self end
    function query:query() return self.db:query() end
    function query:exec() return self.db:execute(operation) end
    return query
end
return {get = fixture.get, type = sql.type, builder = {
    select = function(...) return builder("select") end, update = function(...) return builder("update") end,
    insert = function(...) return builder("insert") end, delete = function(...) return builder("delete") end}}
