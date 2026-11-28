-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {failure = "Invalid credential: provider-credential-sentinel"}
function M.generate(_prompt: any, options: any): (any?, any?)
    if options.model == "sampling-unsupported" then
        if options.temperature ~= nil then return nil, "temperature is unsupported" end
        return {result = "ok"}, nil
    end
    return nil, M.failure
end
return M
