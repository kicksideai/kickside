-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}

local current: any = {}

function M.configure(value: any)
    current = type(value) == "table" and value or {}
end

function M.actor(): any
    return current.actor and current.actor() or nil
end

return M
