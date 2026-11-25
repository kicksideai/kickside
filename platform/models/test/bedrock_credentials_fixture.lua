-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}
local credentials: any
local calls = 0

function M.prepare(value: any)
    credentials = value
    calls = 0
end

function M.resolve()
    calls = calls + 1
    return credentials
end

function M.calls(): number
    return calls
end

return M
