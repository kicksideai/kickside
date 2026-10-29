-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = { calls = 0, entry = {meta = {path = "/files"}} }
function M.get(_id: string): (any?, any?)
    M.calls = M.calls + 1
    return M.entry, M.err
end
return M
