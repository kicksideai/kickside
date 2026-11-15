local execution = require("execution")
local fixture = require("fixture")
local M = {}
for key, value in pairs(execution) do M[key] = value end
M.validate, M.to_row = fixture.validate, fixture.to_row
function M.is_maintenance_key(key)
    fixture.maintenance_checks = fixture.maintenance_checks + 1
    return execution.is_maintenance_key(key)
end
return M
