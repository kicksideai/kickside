local component = require("component")

return {run = function(args)
    return component.set_execution_identity(args.component_id, args.principal, args.request_id, args.expected_identity_generation)
end}
