local common = require("common")
local fixture = require("fixture")
local M = {}
for key, value in pairs(common) do M[key] = value end
M.open_db, M.declared_identity, M.emit_update = fixture.open_db, fixture.identity, fixture.emit
M.actor_id = function() return nil end
M.actor_principal = function() return nil, nil end
return M
