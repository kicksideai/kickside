-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local child_registration = require("child_registration")

local function run(request: any): any
    if request.custodian_id then
        return child_registration.register_root_attachment(request, request.custodian_id, request.plugin_id)
    end
    return child_registration.register_owned_child(request)
end

return {run = run}
