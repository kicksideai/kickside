local common = require("common")
local fixture = require("fixture")
local M = {}
for key, value in pairs(common) do M[key] = value end
M.open_db = fixture.open_db
M.emit_update = fixture.emit
M.actor_id = function() return "actor" end
return M
