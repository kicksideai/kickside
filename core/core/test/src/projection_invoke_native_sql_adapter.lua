local sql = require("sql")
local fixture = require("fixture")
type DB = sql.DB
return {get = fixture.get}
