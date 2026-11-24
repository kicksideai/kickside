-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local state = require("state")

return { run = function()
    local value, err = state.read()
    if err then error(tostring(err)) end
    return value
end }
