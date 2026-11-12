-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local api = require("api")
local http = require("http")

local function run()
    http.reset()
    api.new({ http = http }).handler()
    return { status = http.status, body = http.body }
end

return { run = run }
