local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
local function select(...): any
    local query: any = {}
    function query:from(...) return self end
    function query:where(...) return self end
    function query:run_with(db) self.database = db; return self end
    function query:query(...) return self.database:query(...) end
    return query
end
return {get = fixture.get, type = sql.type, builder = {select = select, eq = function(...) return {} end}}
