-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local security = require("security")

return {run = function(args)
    local member = assert(security.actor())
    local actor = member
    if args.mint_system then
        actor = assert(security.new_actor("system:knowledge.injection", assert(member:meta())))
    end
    local client = assert(assert(contract.get("kickside.component:component_service")):with_actor(actor):open())
    return client[args.method](client, args.request)
end}
