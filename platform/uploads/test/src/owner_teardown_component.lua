local context = require("context")
return {component_owner = function(_id: string): (string, error?) return context.owner, nil end}
