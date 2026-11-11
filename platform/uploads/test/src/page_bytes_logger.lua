-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: {diagnostic: string?} = {}
function M:named(_name: string)
    local log = {}
    function log:warn(_message: string, fields: {error: string}) M.diagnostic = fields.error end
    return log
end
return M
