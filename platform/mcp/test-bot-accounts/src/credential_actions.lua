local security = require("security")
local repo = require("repo")
local flow = require("flow")
return {run = function(args)
    if args.operation == "grant" then
        local actor = assert(security.actor())
        return flow.grant(args.actor_id or actor:id(), args.params, args.mint)
    end
    return repo.mint(args.mint)
end}
