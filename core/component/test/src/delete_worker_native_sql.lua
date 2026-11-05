-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fixture = require("fixture")
return {get = function()
    return {
        query = function()
            if fixture.stage == "worker_read" then return nil, fixture.source end
            if fixture.stage == "worker_intent" then return {{deleting_at = "marked"}}, nil end
            return {{impl_id = "fixture:implementation", private_context = "{}", deleting_at = "marked", delete_intent = "{}"}}, nil
        end,
        release = function() return true end,
    }, nil
end}
