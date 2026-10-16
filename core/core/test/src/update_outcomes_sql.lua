local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
return {builder = {update = fixture.update, eq = sql.builder.eq}}
