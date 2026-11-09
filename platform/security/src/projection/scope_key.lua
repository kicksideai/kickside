-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local hash = require("hash")
local M = {}
M.META_TYPE = "kickside.security.scope_projection"
function M.id(group: string): (string?, error?)
    local digest, err = hash.sha256(group)
    if err then return nil, err end
    return "kickside.security.projection:scope_" .. digest, nil
end
return M
