-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local security = require("security")
local function read(args: {component_id: string}): (table?, error?)
    local service = assert(assert(contract.get("kickside.component:component_service"))
        :with_actor(security.actor()):with_scope(security.scope()):open())
    return service:get_access_context({component_id = args.component_id, access_mask = 1, include_context = false})
end
return {read = read}
