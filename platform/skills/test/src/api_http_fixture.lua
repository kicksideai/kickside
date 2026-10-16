-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {
    CONTENT = { JSON = "application/json" },
    STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401 },
}

local current: any = {}

function M.configure(value: any)
    current = type(value) == "table" and value or {}
end

function M.request(): any
    return current.request and current.request() or nil
end

function M.response(): any
    return current.response and current.response() or nil
end

return M
