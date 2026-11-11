-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: {diagnostic: string?} = {}
function M.named(_self, _name: string)
    return {warn = function(_log, _message: string, fields: {error: string}) M.diagnostic = fields.error end}
end
return M
