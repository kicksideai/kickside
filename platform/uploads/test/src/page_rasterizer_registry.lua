-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {failure = false}
function M.find(_query)
    if M.failure then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Discovery denied", retryable = false}) end
    return {}, nil
end
return M
