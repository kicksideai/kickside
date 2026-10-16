local fixture = require("fixture")
local real = require("real")
return {dbtype_of = fixture.dbtype_of, gate_write = real.gate_write}
