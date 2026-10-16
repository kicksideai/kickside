local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
return {type = sql.type, builder = {select = function(...) return fixture.builder() end,
    update = function(...) return fixture.builder() end, eq = sql.builder.eq, lte = sql.builder.lte, expr = sql.builder.expr}}
