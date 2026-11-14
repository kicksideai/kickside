local fixture = require("fixture")
return {actor = fixture.actor, scope = fixture.scope, can = function(action: string, _resource: string) return action == "component.context.read_system", nil end}
