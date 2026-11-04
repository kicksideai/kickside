-- Whitespace trim that holds on large text. The anchored pattern
-- "^%s*(.-)%s*$" gives up on strings over roughly 45 KB in the Wippy runtime:
-- match returns nil and gsub returns the input untouched. This scans instead.
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
