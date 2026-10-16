local fixture = require("fixture")
return {builder = {select = function(...) return fixture.builder() end, eq = function(value) return value end}}
