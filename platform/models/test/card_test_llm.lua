-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {failure = "Invalid credential: provider-credential-sentinel"}
function M.generate() return nil, M.failure end
return M
