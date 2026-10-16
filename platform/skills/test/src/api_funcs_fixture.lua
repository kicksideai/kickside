-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}

local current: any = {}

function M.configure(value: any)
    current = type(value) == "table" and value or {}
end

function M.call(id: string, args: any): (any?, any?)
    if not current.call then return nil, "function fixture is not configured" end
    return current.call(id, args)
end

return M
