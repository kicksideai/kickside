-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")

-- These facade fixtures cover transactions and health, with no registered pool.
local function notify_workers(_entry_id: string): (integer, error?)
    return 0, nil
end

return {
    notify_workers = notify_workers,
    nudge_workers = fixture.nudge_workers,
}
