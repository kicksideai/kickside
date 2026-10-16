local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
return {type = sql.type, builder = {select = fixture.builder, update = fixture.builder,
    eq = function(...) return {} end, lte = function(...) return {} end}}
