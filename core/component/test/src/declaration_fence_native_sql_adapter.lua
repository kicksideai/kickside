local fixture = require("fixture")
return {builder = {
    select = function(...) return fixture.builder("select") end,
    update = function(...) return fixture.builder("update") end,
    insert = function(...) return fixture.builder("insert") end,
}}
