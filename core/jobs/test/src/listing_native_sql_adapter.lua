local native = require("sql")
local fixture = require("fixture")
type DB = native.DB
type Transaction = native.Transaction
return {type = native.type, builder = {
    select = function(...) return fixture.builder() end,
    eq = function(value) return value end,
    expr = function(value, ...) return value end,
}}
