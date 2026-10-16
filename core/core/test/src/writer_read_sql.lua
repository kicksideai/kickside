local real = require("sql")
type DB = real.DB
type Transaction = real.Transaction
local fixture = require("fixture")
return {type = real.type, builder = {select = fixture.select, eq = real.builder.eq}}
