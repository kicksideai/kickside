-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M: { [string]: any } = {}
function M.get(_id: string): (any?, any?) return M.item, nil end
return M
