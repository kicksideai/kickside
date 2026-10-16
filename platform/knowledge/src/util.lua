-- Shared Knowledge string and value helpers.

local util = {}

function util.trim(value: any): string
    if type(value) ~= "string" then
        return ""
    end
    return value:match("^%s*(.-)%s*$") or ""
end

function util.same_value(a: any, b: any): boolean
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for key, value in pairs(a) do
        if not util.same_value(value, b[key]) then return false end
    end
    for key in pairs(b) do if a[key] == nil then return false end end
    return true
end

return util
