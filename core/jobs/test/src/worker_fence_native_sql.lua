local native = require("sql")
local fixture = require("fixture")
return {type = native.type, builder = {update = fixture.builder, eq = native.builder.eq}}
