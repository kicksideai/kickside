-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local groups = require("groups")
local M = {}
function M.resolve(request: any): (any?, error?)
    return groups.resolve(type(request) == "table" and request.groups or nil)
end
return M
