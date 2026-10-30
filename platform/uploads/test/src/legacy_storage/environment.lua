-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local env = require("env")
local M = {failure = nil, resource_id = "app:objects"}
function M.get(id)
    if id == "kickside.uploads.env:storage_s3" then
        if M.failure then return nil, M.failure end
        return M.resource_id, nil
    end
    return env.get(id)
end
return M
