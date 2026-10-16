local resource = require("resource")
local state = require("state")
local M = {}
function M.run(args: table): (any?, error?)
    state.winner_actor = args.winner_actor
    state.winner_kind = args.winner_kind
    return resource.emit(args.emit)
end
return M
