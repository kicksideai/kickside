-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local jobs = require("jobs")

local function run(input: table): (integer?, error?)
    if input.operation == "nudge" then return jobs.nudge_workers() end
    return jobs.purge_slot(input.params)
end

return { run = run }
