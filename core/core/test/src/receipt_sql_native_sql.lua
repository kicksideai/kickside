local fixture = require("fixture")
local sql = require("sql")
return {type = sql.type, get = fixture.get, builder = {eq = sql.builder.eq,
    update = function(...) return fixture.builder("update") end,
    delete = function(...) return fixture.builder("delete") end}}
