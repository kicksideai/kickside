local fixture = require("fixture")
return {subscribe = function(...): (any, error?) return fixture.result("subscription", fixture.subscription()) end}
