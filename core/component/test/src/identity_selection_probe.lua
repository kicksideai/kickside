local component_command = require("component_command")

return {run = function(args)
    return component_command.set_execution_identity(args.component_id, args.principal,
        args.request_id, args.expected_identity_generation)
end}
