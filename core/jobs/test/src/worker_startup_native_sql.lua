local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
type Transaction = sql.Transaction
local adapter: any = {type = sql.type, get = fixture.connect}
return adapter
