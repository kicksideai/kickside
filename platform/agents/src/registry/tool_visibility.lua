local M = {}

-- Discovery is an explicit registry opt-in. Only canonical boolean metadata is
-- accepted: a class/tag is descriptive, never a visibility grant, and malformed
-- private metadata fails closed rather than weakening the boundary.
function M.meta_is_public(meta: any): boolean
    if type(meta) ~= "table" or meta.public ~= true then return false end
    return meta.private == nil or meta.private == false
end

function M.meta_is_private(meta: any): boolean
    if type(meta) ~= "table" then return true end
    return meta.private ~= nil and meta.private ~= false
end

function M.entry_is_public_tool(entry: any): boolean
    if type(entry) ~= "table" then return false end
    local meta = entry.meta
    return entry.kind == "function.lua"
        and type(meta) == "table"
        and meta.type == "tool"
        and M.meta_is_public(meta)
end

return M
