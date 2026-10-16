local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
return {type = sql.type, builder = {select = function(...) return fixture.builder() end,
    update = function(...) return fixture.builder() end, eq = function(value) return value end}}
