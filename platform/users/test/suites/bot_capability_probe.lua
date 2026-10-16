local identity = require("execution_identity")

return {run = function(args)
    return identity.run_as(args.identity, "app:bot_effect_probe", {}, {deferred_owner = args.owner})
end}
