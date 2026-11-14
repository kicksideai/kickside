-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
return {run = function()
    return funcs.call("kickside.component:kind_declaration", "app:closed_kind")
end}
