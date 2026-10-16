-- kb_render with the read gate open, so presentation probes reach the stub
-- retrieval without a real knowledge base component.
local render = require("kb_render")

local M = {}
for key, value in pairs(render) do M[key] = value end
M.deny = function(_kb_id: any): string? return nil end

return M
