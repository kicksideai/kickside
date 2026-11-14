-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
return {run = function(request)
    local service = assert(assert(contract.get("kickside.component:component_service")):open())
    return service[request.method](service, request.args)
end}
