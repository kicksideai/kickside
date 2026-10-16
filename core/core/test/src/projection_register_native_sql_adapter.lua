local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
return {type = sql.type, builder = {select = fixture.select, insert = fixture.insert,
    update = fixture.update, eq = sql.builder.eq, expr = sql.builder.expr}}
