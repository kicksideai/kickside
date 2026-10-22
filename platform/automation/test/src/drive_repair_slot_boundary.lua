-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local slot = require("slot")
local M = {}
function M.provision(owner, key)
    if M.before then M.before(owner, key) end
    local id, err = slot.provision(owner, key)
    if M.after then M.after(owner, key, id, err) end
    return id, err
end
function M.wake_dispatcher()
    if M.fail_wake then return nil, errors.new({kind=errors.UNAVAILABLE,message="injected dispatcher failure"}) end
    return slot.wake_dispatcher()
end
return M
