local common = require("common")
local M = {}
for key, value in pairs(common) do M[key] = value end
M.keyed_principal = function() return nil, nil end
M.is_maintenance_actor = function() return false end
return M
