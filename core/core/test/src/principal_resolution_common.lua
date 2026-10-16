local common = require("common")
local fixture = require("fixture")
local M = {}
for key, value in pairs(common) do M[key] = value end
M.open_db = fixture.open_db
M.declared_identity = function() return {system = true}, nil end
return M
