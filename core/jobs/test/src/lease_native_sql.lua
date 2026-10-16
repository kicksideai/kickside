local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
return {type = sql.type, get = fixture.get, builder = {update = fixture.update, eq = function(...) return {} end}}
