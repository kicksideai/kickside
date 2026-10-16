local native = require("sql")
local fixture = require("fixture")
type DB = native.DB
type Transaction = native.Transaction
local function query(...): any
    local q: any = {}
    function q:from(...) return self end
    function q:where(...) return self end
    function q:limit(...) return self end
    function q:set_map(...) return self end
    function q:suffix(...) return self end
    function q:run_with(...) return self end
    function q:query() return fixture.query() end
    function q:exec() return fixture.insert() end
    return q
end
return {type = native.type, builder = {select = query, insert = query, eq = function(value) return value end}}
