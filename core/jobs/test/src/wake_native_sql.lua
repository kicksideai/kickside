local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
return {type = sql.type, builder = {update = fixture.builder, select = fixture.builder,
    eq = function(...) return {} end, expr = function(...) return {} end}}
