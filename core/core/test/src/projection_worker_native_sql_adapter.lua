local sql = require("sql")
type DB = sql.DB
type Transaction = sql.Transaction
return {type = sql.type, builder = {select = require("fixture").select, expr = sql.builder.expr}}
