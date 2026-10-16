local fixture = require("fixture")
return {actor = fixture.actor, scope = fixture.scope, can = function(...) return true, nil end}
