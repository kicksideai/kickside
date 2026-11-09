-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {calls=0}
function M.notify(_change)
    M.calls = M.calls + 1
    return true,nil
end
return M
