-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local native = require("time")
local fixture = require("fixture")
fixture.origin = native.now()
return {
    MILLISECOND = native.MILLISECOND,
    RFC3339 = native.RFC3339,
    now = function() return fixture.origin:add((fixture.clock_ms or 0) * native.MILLISECOND) end,
}
