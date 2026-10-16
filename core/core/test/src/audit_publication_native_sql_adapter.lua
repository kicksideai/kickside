local sql = require("sql")
type DB = sql.DB
return {get = require("fixture").get}
