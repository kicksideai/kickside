local fixture = require("fixture")
return {id = function(...): (any, error?) return fixture.result("version", "version") end}
