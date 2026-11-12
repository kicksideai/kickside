-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local reader = require("inbox_reader")

local function run(): (number?, any?)
    local counts, err = reader.counts()
    if err then return nil, err end
    return counts.pending_count :: number, nil
end

return { run = run }
