-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
return {run = function(component_id)
    return funcs.call("kickside.component.system:exists", component_id)
end}
