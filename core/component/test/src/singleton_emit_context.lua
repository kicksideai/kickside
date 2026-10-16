local fixture = require("fixture")
return {current_runtime_identity = function() return fixture.actor, fixture.scope, nil end}
