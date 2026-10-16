local fixture = require("fixture")
return {get = fixture.get, is = function(...) return true end}
