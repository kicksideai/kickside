-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The runtime pattern matcher stops at MaxBacktracks = 100000 (wippyai/go-lua
-- pm.go) and reports no match, so "^%s*(.-)%s*$" fails on large text.
-- The linear scan avoids backtracking.
local M = {}

-- trim(value) -> value without leading and trailing whitespace; "" for a
-- non-string or a string of whitespace only.
function M.trim(value: any): string
    if type(value) ~= "string" then return "" end
    local s = value :: string
    local first = s:find("%S")
    if not first then return "" end
    local last = #s
    while s:find("^%s", last) do last = last - 1 end
    return s:sub(first, last)
end

return M
