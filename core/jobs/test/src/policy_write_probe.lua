-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local jobs = require("jobs")
return {run = function()
    local value, err = jobs.set_policy_overrides({["worker.count_postgres"] = 21})
    return {value = value, kind = err and err:kind()}
end}
