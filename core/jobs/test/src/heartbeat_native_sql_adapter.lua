local native = require("sql")
local fixture = require("fixture")
type DB = native.DB
type Transaction = native.Transaction
return {type = native.type, get = function(...) return fixture.result("database", fixture.database()) end,
    builder = {
        insert = function(name) return fixture.builder("insert", name) end,
        update = function(name) return fixture.builder("update", name) end,
        eq = function(value) return value end,
    }}
