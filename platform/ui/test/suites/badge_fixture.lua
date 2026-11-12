-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local time = require("time")

local function count(): number
    local actor = assert(security.actor())
    assert(not actor:id():match("^system:"), "badge must run under the viewer")
    return 7
end

local function slow(): number
    time.after("2s"):receive()
    return 9
end

return { count = count, slow = slow }
