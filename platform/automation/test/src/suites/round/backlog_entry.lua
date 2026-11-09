-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local time = require("time")
local worker = require("round_worker")
local h = require("round_harness")

return { run = function(input: any): (any?, error?)
    local entered_at = time.now():unix_nano()
    h.exec("INSERT INTO round_fixture_log (automation_id, drive_key, item_key, attempts, detail_json)"
        .. " VALUES ($1, $2, 'worker-entry', $3, $4)",
        { input.payload.automation_id, input.payload.drive_key, input.job.execution_seq,
            h.encoded({ entered_at = tostring(entered_at) }) })
    return worker.run(input)
end }
