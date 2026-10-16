local native = require("sql")
local fixture = require("fixture")
type DB = native.DB
type Transaction = native.Transaction
return {builder = {
    update = function(name) return fixture.builder("update", name) end,
    delete = function(name) return fixture.builder("delete", name) end,
    insert = function(name) return fixture.builder("insert", name) end,
    select = function(...) return fixture.builder("select") end,
    expr = function(value) return {expression = value} end,
}}
