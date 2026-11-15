-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local registry = require("registry")
local M = {calls=0,refuse_at=0}
function M.reset(refuse_at: integer)
    M.calls,M.refuse_at=0,refuse_at
end
function M.get(id: string): (any?, error?)
    M.calls=M.calls+1
    if M.refuse_at>0 and M.calls==M.refuse_at then
        return nil,errors.new({kind=errors.UNAVAILABLE,message="declaration lookup refuses"})
    end
    return registry.get(id)
end
M.find=registry.find
return M
