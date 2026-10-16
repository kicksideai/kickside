local id: string? = nil
local M = {}

function M.set_id(value: string): () id = value end
function M.v7(): string
    if not id then error("projection UUID fixture has no configured id") end
    return id
end

return M
