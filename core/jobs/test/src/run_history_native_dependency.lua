local sql = require("sql")
local native = require("native")
type DB = sql.DB
type Transaction = sql.Transaction
type EnqueueParams = native.EnqueueParams
type IdentityParams = native.IdentityParams
return require("fixture")
