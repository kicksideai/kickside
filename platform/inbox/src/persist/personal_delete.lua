-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local events = require("inbox_events")

-- The addressed writer authorizes the sender before binding the personal owner.
return { run = function(input: any): (boolean, any?)
    return events.delete_personal(input)
end }
