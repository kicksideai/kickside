-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local receive = require("receive")
local dm = require("dm")
local fixture = require("fixture")
local state = require("state")
return {run = function(args: {path: string, empty: boolean?}): any
    state.reset(); fixture.seed_responder({})
    local message = args.empty and {} or fixture.inbound()
    return args.path == "dm" and dm.receive(message) or receive.receive(message)
end}
