local execution = require("execution")
local fixture = require("fixture")
local M = {}
for key, value in pairs(execution) do M[key] = value end
M.validate, M.to_row = fixture.validate, fixture.to_row
return M
