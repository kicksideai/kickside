-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local authority = require("authority")
return {run = function(impl_id: string)
    local visible = security.can("registry.get", impl_id)
    local err = authority.check(impl_id, "update")
    local details = err and err:details() or {}
    return {visible = visible, admitted = err == nil, code = details.code}
end}
