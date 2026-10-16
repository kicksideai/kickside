local sql = require("sql")
type DB = sql.DB
type Transaction = sql.Transaction
local fixture = require("fixture")
return {type = sql.type, get = function(id) return fixture.result("get", fixture.database()) end}
