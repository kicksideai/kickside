local common = require("common")
local fixture = require("fixture")
local M = {}
for key, value in pairs(common) do M[key] = value end
M.open_db, M.emit_update = fixture.open_db, fixture.emit_update
return M
