local create = require("create")
local state = require("state")

local function handler(args)
    state.reset({}, args and args.body)
    create.handler()
    return state.result()
end

return { handler = handler }
