local fixture = require("fixture")
return {find = function(query) return fixture.result("owner", fixture.owners) end}
