-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local create = require("create")
local state = require("state")

local function handler(args)
    state.reset({}, args and args.body)
    create.handler()
    return state.result()
end

return { handler = handler }
